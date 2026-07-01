# Architecture

## Runtime model: Next.js App Router → OpenNext → Cloudflare Worker

This app is **not** running on Node or Vercel. It's a Next.js 16 App Router build compiled by
**OpenNext** (`@opennextjs/cloudflare`) into a single **Cloudflare Worker** that runs on **workerd**.

```
next build  ─────────────►  .next/         (standard Next build output)
opennextjs-cloudflare build ─►  .open-next/    (worker.js entry + server-functions handler + assets/)
wrangler deploy --no-autoconfig ─►  Cloudflare Worker (workerd) + static assets
```

- **Static assets** (`.open-next/assets/`) are served by Cloudflare's asset layer (the `ASSETS`
  binding in `wrangler.jsonc`).
- **Dynamic routes** run inside the Worker. In this app *everything under `/` that touches auth or D1
  is dynamic* (`ƒ` in the build output); only truly static pages prerender (`○`).
- The Worker's cold-start budget is ~1 s and its size is bounded — which is why the Shiki bundle work
  (see [data-and-content.md](./data-and-content.md)) and lean dependencies matter. Current worker:
  **~1.5 MB gzip, ~27 ms startup.**

Config that wires this up:
- `next.config.ts` — calls `initOpenNextCloudflareForDev()` (makes `getCloudflareContext()` work in
  `next dev`), plus `images.remotePatterns`. `cacheComponents` is intentionally OFF until Phase 3.
- `open-next.config.ts` — `defineCloudflareConfig({})`. Empty = the incremental/tag caches resolve to
  no-op "dummy" overrides (relevant to `revalidatePath`, see below).
- `wrangler.jsonc` — Worker name, `compatibility_flags: ["nodejs_compat", ...]`, and **bindings**:
  `DB` (D1), `ASSETS`, `IMAGES` (Cloudflare Images), `WORKER_SELF_REFERENCE`. Secrets (auth) are
  Worker secrets, not in this file.

## Accessing Cloudflare bindings: `getCloudflareContext()`

Bindings (D1, Images, rate limiter, …) live on the Worker `env`, reached via `getCloudflareContext()`:

- **Synchronous form** — in Server Components, Server Actions, and Route Handlers (all run inside a
  request): `const { env } = getCloudflareContext();`. This is how `lib/db/index.ts` builds the
  per-request Drizzle client.
- **Async form** — `await getCloudflareContext({ async: true })` — used in `auth.ts` because the
  NextAuth config factory can be evaluated during static generation (no live request), where the sync
  form would throw.

**Rule: never cache a binding-derived client in a module-level singleton.** D1/bindings are
request-scoped; a shared client throws *"Cannot perform I/O on behalf of a different request."* Build
per request (it's cheap). See `lib/db/index.ts`.

## No middleware / no `proxy.ts` (auth is gated in layout + DAL + actions)

OpenNext (1.20) does **not** support Next 16's Node-runtime middleware, so there is deliberately **no
`middleware.ts`/`proxy.ts`**. The security boundary is instead:

1. `app/admin/layout.tsx` calls `requireOwner()` — gates the whole `/admin` tree.
2. `lib/auth/dal.ts` — `requireOwner()` is the authoritative check (redirects to `/login` if no session).
3. **Every** admin Server Action and the preview Route Handler re-checks the owner itself — never trust
   the layout alone.

Details in [auth.md](./auth.md). The takeaway when reusing: **don't reach for middleware to protect
routes** on this stack — gate in the layout + a DAL function + at each mutation.

## Rendering model

- Server Components read D1 directly and render HTML on the Worker. Admin pages call `requireOwner()`
  (which reads cookies) so they're dynamic.
- Mutations are **Server Actions** (`"use server"`), not API routes — except the live-preview endpoint,
  which is a **Route Handler** (`app/api/admin/preview/route.ts`) precisely because the client needs to
  `fetch` it with a cancelable `AbortController` (a Server Action can't be aborted mid-flight).
- `revalidatePath` is called after mutations but currently **no-ops** (the dummy tag cache) — harmless
  because admin pages are dynamic/uncached. When Phase 3 adds `use cache` + public pages, a real cache
  must be configured and the **public** paths revalidated. (See gotchas.)

## File layout

```
app/
  layout.tsx            root layout (fonts, ThemeProvider, Toaster)
  page.tsx              public home (placeholder pre-Phase-3)
  login/                LoginCard + login Server Action (Auth.js signIn)
  admin/
    layout.tsx          requireOwner() gate + <AdminShell>
    page.tsx            dashboard (stats + recent + coverage gaps)
    posts/
      page.tsx          posts list (server table + client filter island)
      actions.ts        savePost / deletePost / duplicatePost (Server Actions)
      new/ , [id]/edit/ the editor pages
  api/admin/preview/    owner-gated Markdown→HTML preview Route Handler
  api/auth/[...nextauth] Auth.js handlers
components/
  ui/                   shadcn primitives (new-york)
  admin/                AdminShell, editor, metadata-panel, tag-input, publish-bar, …
  site/                 Prose (reading surface), type-chip, …
lib/
  db/                   index.ts (per-request client), schema.ts, queries.ts
  auth/                 dal.ts (requireOwner), password.ts (scrypt), rate-limit.ts
  content/              render.ts, rehype-shiki.ts, highlighter.ts, vendor-shiki/ (grammars)
  site.ts taxonomy.ts format.ts slug.ts utils.ts
auth.ts                 NextAuth factory (async config, reads Worker secrets)
migrations/             Drizzle-generated SQL (applied via wrangler d1 migrations apply)
plan/                   original phased plan + design handoff (mockups, specs)
docs/                   THIS handbook
```

Path alias: `@/*` → repo root (see `tsconfig.json`). Note `lib/db/schema.ts` imports taxonomy with a
**relative** path (not `@/`) so drizzle-kit's bundler can resolve it during `db:generate`.
