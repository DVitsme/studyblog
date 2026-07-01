# Deployment & gotchas

## Deploy

```bash
pnpm deploy        # = opennextjs-cloudflare build && wrangler deploy --no-autoconfig
```

**`--no-autoconfig` is mandatory, not optional.** Since **wrangler 4.101** the `--autoconfig` flag
defaults to `true`, and its "OpenNext project detected → call opennextjs-cloudflare deploy"
auto-delegation fires on every `wrangler deploy` — including the one OpenNext runs internally. The
delegation short-circuits the actual upload: the command prints its banner / "Building list of
assets…" then **exits 0 without uploading** (worker unchanged, no error). `--no-autoconfig` disables it
and the real upload runs. `pnpm deploy` already encodes this; if you ever call wrangler directly, keep
the flag. (Alternative: pin `wrangler@4.100`. Do NOT rely on plain `opennextjs-cloudflare deploy` — it
doesn't forward the flag to its spawned wrangler.)

Other build/deploy commands: `pnpm build` (next build only, fast type/compile check),
`pnpm preview` (opennext build + local workerd — but this can be slow/stall in non-TTY shells; for
verifying runtime behavior, deploying + curling prod is more reliable), `pnpm cf-typegen`
(regenerate binding types after changing `wrangler.jsonc`).

### First-run setup for a cloned project

1. `pnpm install`.
2. **D1**: `wrangler d1 create <name>` → put the `database_id` in `wrangler.jsonc`'s `DB` binding.
3. **Migrations**: `pnpm db:generate` (if schema changed) → `pnpm db:migrate:local` and
   `pnpm db:migrate` (remote) → seed with `pnpm db:seed:local` / `pnpm db:seed`.
4. **Auth secrets** (Worker secrets, and mirror in `.dev.vars` for local): `AUTH_SECRET`,
   `AUTH_OWNER_EMAIL`, `AUTH_OWNER_HASH` (a `scrypt:<salt>:<hash>` — generate with
   `lib/auth/password.ts`'s `hashPassword`). See [auth.md](./auth.md).
5. **`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`** — a base64 32-byte key in `.env.local` (build-time,
   gitignored). Pins Server Action encryption so redeploys don't invalidate in-flight actions. **Each
   build machine / CI must set the same key**, or a fresh one is generated per build.
6. `pnpm cf-typegen` to generate `cloudflare-env.d.ts` for the bindings.
7. Swap the app-specifics: `lib/db/schema.ts` + `migrations/`, `lib/taxonomy.ts`, `lib/site.ts`,
   `app/globals.css` tokens.

### Secrets & bindings

- **Secrets** = Worker secrets (`wrangler secret put NAME`, piped from a file — never echoed) + a
  gitignored `.dev.vars` for local dev. Never commit secrets; `.env*` and `.dev.vars` are gitignored.
- **Bindings** (in `wrangler.jsonc`): `DB` (D1), `ASSETS` (static), `IMAGES` (Cloudflare Images),
  `WORKER_SELF_REFERENCE`, `AUTH_RATE_LIMITER` (see [auth.md](./auth.md)), and `MEDIA_BUCKET` (R2, for
  media uploads — bucket `studyblog-media`). A 2nd R2 bucket for the incremental cache comes in Phase 4.

### Deploying from a non-interactive shell (CI, or an agent's Bash tool)

wrangler's asset upload + first-run telemetry prompt misbehave without a TTY. Run
`wrangler telemetry disable` once (persists), and in a sandboxed tool you may need unrestricted network
egress for the upload. A normal terminal (`pnpm deploy`) needs none of this.

---

## Gotchas catalogue

Each of these cost real debugging time. Skim before you start.

| # | Gotcha | Fix / where |
|---|---|---|
| 1 | **Deploy exits 0 but uploads nothing** (wrangler ≥4.101 autoconfig delegation) | `wrangler deploy --no-autoconfig` (in `pnpm deploy`) |
| 2 | **Importing `shiki`/`@shikijs/rehype`/`@shikijs/langs` pulls all ~250 grammars → 15 MB worker** | `@shikijs/core` + vendored grammars + custom rehype; ESLint `no-restricted-imports` guard. See data doc. |
| 3 | **Next 16 Node middleware unsupported on OpenNext** — no `middleware.ts`/`proxy.ts` | Gate auth in layout + DAL + each action. See auth doc. |
| 4 | **D1 has no interactive transactions** (`db.transaction()` throws) | `db.batch([...])` for atomic multi-writes. See data doc. |
| 5 | **lucide-react 1.x renamed icons** (`CircleCheck`≠`CheckCircle`, `EllipsisVertical`≠`MoreVertical`, `CircleAlert`≠`AlertCircle`, `ChartColumn`≠`BarChart3`) | Verify names in `node_modules/lucide-react` before importing |
| 6 | **Drizzle `timestamp` mode = Unix _seconds_**, not ms | Compare against `Date.now()/1000` in raw SQL |
| 7 | **Local miniflare D1 doesn't enforce FKs** — bad FK passes in dev, 500s in prod | Validate `sectionSlug`/`domainId` existence in the action before writing |
| 8 | **`LIKE` treats `%`/`_` in user search as wildcards** | Escape + `ESCAPE '\'` clause (see `queries.ts`) |
| 9 | **`revalidatePath` no-ops** (empty `open-next.config.ts` → dummy tag cache) | Fine now (dynamic admin). Phase 3: configure real incremental+tag cache and revalidate **public** paths on publish |
| 10 | **React 19 `react-hooks/refs`**: can't read `ref.current` during render | Read refs only in event handlers/effects; pass the element into helpers (see `post-editor.tsx`) |
| 11 | **ESLint crawls for minutes** if it lints `.open-next` (29 MB) | `globalIgnores` includes `.open-next/**`, `.wrangler/**`, `plan/**`, `cloudflare-env.d.ts`, `lib/content/vendor-shiki/**` |
| 12 | **shadcn CLI `ERR_PNPM_INVALID_NODE_VERSION`** | Prefix installs: `npm_config_use_node_version=22.x pnpm dlx shadcn@latest add …` |
| 13 | **`getCloudflareContext()` throws in the auth factory** (no request during static gen) | Use the `{ async: true }` form in `auth.ts`; sync form elsewhere; never singleton a binding client |
| 14 | **`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` regenerated per build** invalidates in-flight actions | Pin it in `.env.local` (build-time); set the same value in CI |
| 15 | **zod v4 API** differs from v3 | `z.flattenError(err).fieldErrors`, `{ error: "…" }` messages (not `.flatten()`/`invalid_type_error`) |
| 16 | **`next/image` optimizer self-fetch fails** on Workers with `global_fetch_strictly_public` (`"upstream response is invalid"`) | Use `unoptimized` for same-origin R2 images, or transform via the `IMAGES` binding in the serve route (Phase 3) |
| 17 | **Uploads >1 MB fail via Server Actions** (default `bodySizeLimit`) | Use a Route Handler for file uploads — no body limit; Workers allow 100 MB |

See also **[../plan/](../plan/)** for the original phased plan, and the memory notes for the running
list of deferred follow-ups (login rate-limit tuning, `posts.updated_at` index, Phase-3 public
revalidation, R2 media).
