# 06 — Deployment & Cloudflare Runbook

Deploy target: **Cloudflare Workers via OpenNext** (`@opennextjs/cloudflare` v1.x) with **D1**, **R2**,
and the **IMAGES** binding. This mirrors the working reference (`kevincameron`) plus the additions
this app needs (auth secrets, R2 media uploads, R2/D1 incremental cache for `use cache`/ISR).

Names used below (rename as desired): worker `studyblog`, D1 `studyblog-db`, R2 media
`studyblog-media`, R2 inc-cache `studyblog-inc-cache`.

---

## 1. Canonical config files

### `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studyblog",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-05-05",                 // >= 2025-05-05 avoids FinalizationRegistry error
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],

  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "studyblog" }],
  "images": { "binding": "IMAGES" },                  // next/image optimization in prod
  "observability": { "enabled": true },

  "vars": {
    "AUTH_URL": "https://studyblog.example.com",
    "AUTH_TRUST_HOST": "true",
    "NEXT_PUBLIC_SITE_URL": "https://studyblog.example.com",
    "NEXT_PUBLIC_SITE_NAME": "StudyBlog"
  },

  "d1_databases": [
    { "binding": "DB", "database_name": "studyblog-db", "database_id": "<UUID>", "migrations_dir": "migrations" },
    { "binding": "NEXT_TAG_CACHE_D1", "database_name": "studyblog-db", "database_id": "<UUID>" }
  ],

  "r2_buckets": [
    { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "studyblog-inc-cache" },
    { "binding": "MEDIA_BUCKET", "bucket_name": "studyblog-media" }
  ],

  "durable_objects": { "bindings": [{ "name": "NEXT_CACHE_DO_QUEUE", "class_name": "DOQueueHandler" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["DOQueueHandler"] }],

  "routes": [{ "pattern": "studyblog.example.com", "custom_domain": true }],
  "workers_dev": false
}
```
Notes: the **tag-cache D1 can be the same database** as `DB` (different tables). The **DO queue** is
only needed for time-based revalidation — if all revalidation is on-demand (`updateTag`/`revalidateTag`
in actions), you may omit `queue`/`durable_objects`. Keep it for safety.

### `open-next.config.ts`
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,   // durable store for use cache / ISR / data cache
  tagCache: d1NextTagCache,               // for revalidateTag / updateTag / use-cache tags
  queue: doQueue,                          // only for time-based revalidation; omit if unused
});
```
> The reference ships an **empty** `defineCloudflareConfig({})` (no ISR). We enable the overrides
> because the content model relies on `use cache` + tag revalidation (`02-architecture.md` §5). Wrap
> with `withRegionalCache` later if R2 round-trips show up in latency.

### `next.config.ts`
See `02-architecture.md` §8 (cacheComponents, remotePatterns) plus `initOpenNextCloudflareForDev()`.
**Image strategy:** use the **`IMAGES` binding** (matches the reference, zero zone config — `<Image>`
"just works", billed per transformation). If you prefer to avoid per-transform billing, switch to a
custom `/cdn-cgi/image/` loader (`images.loader: "custom"`, `loaderFile`) and enable Transformations
on the zone. For a small blog, start with the IMAGES binding.

### `package.json` scripts (pnpm)
```json
{
  "dev": "next dev",
  "build": "next build",
  "lint": "eslint",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
  "db:generate": "drizzle-kit generate",
  "db:migrate:local": "wrangler d1 migrations apply studyblog-db --local",
  "db:migrate": "wrangler d1 migrations apply studyblog-db --remote",
  "db:seed:local": "wrangler d1 execute studyblog-db --local --file=db/seed-domains.sql",
  "db:seed": "wrangler d1 execute studyblog-db --remote --file=db/seed-domains.sql"
}
```
> **Always `pnpm run deploy`** — `pnpm deploy` is a built-in that shadows the script.

## 2. One-time provisioning
```bash
pnpm add @opennextjs/cloudflare drizzle-orm next-auth zod \
  unified remark-parse remark-gfm remark-rehype rehype-slug rehype-autolink-headings \
  rehype-sanitize rehype-stringify rehype-pretty-code shiki
pnpm add -D wrangler drizzle-kit @types/node

npx wrangler login                                  # OAuth (don't set CLOUDFLARE_API_TOKEN locally — it shadows OAuth)
npx wrangler d1 create studyblog-db                 # paste database_id into wrangler.jsonc (both D1 entries)
npx wrangler r2 bucket create studyblog-media
npx wrangler r2 bucket create studyblog-inc-cache
pnpm cf-typegen                                     # generate CloudflareEnv types (re-run after wrangler.jsonc edits)
```

## 3. Database lifecycle
```bash
# after editing lib/db/schema.ts
pnpm db:generate            # drizzle-kit → SQL into ./migrations
pnpm db:migrate:local       # apply to local miniflare D1
pnpm db:seed:local          # seed sections/domains locally
# production
pnpm db:migrate && pnpm db:seed
```
- `drizzle.config.ts` `out` **must equal** `migrations_dir` (`./migrations`).
- Local and remote D1 are **independent** — migrate/seed both.
- drizzle-kit *generates*, wrangler *applies* (no D1 HTTP creds needed locally).

## 4. Secrets & env (see also `04-auth.md` §2)
| Kind | Mechanism |
|------|-----------|
| Local secrets | `.dev.vars` (gitignored): `AUTH_SECRET`, `AUTH_OWNER_EMAIL`, `AUTH_OWNER_HASH`, … |
| Prod secrets | `wrangler secret put <NAME>` (or dashboard → Variables & Secrets → Secret) |
| Prod config | `vars` in `wrangler.jsonc` (`AUTH_URL`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_*`) |
| Build-time public | `NEXT_PUBLIC_*` are **inlined at `next build`** — must exist at build (CI build vars) |
| Runtime secrets | read via `getCloudflareContext().env` (reliable); pass into NextAuth explicitly (`04-auth.md` §3) |

> **`opennextjs-cloudflare deploy` can wipe dashboard-set vars** — preserve with
> `pnpm run deploy -- --keep-vars` (or manage all vars in `wrangler.jsonc`).

## 5. R2 media uploads (admin cover/inline images)
Owner-only upload via a Server Action or `app/api/media/upload/route.ts` (call `requireOwner()` first):
```ts
const { env } = getCloudflareContext();
const file = formData.get("file") as File;
const key = `uploads/${crypto.randomUUID()}-${file.name}`;
await env.MEDIA_BUCKET.put(key, file.stream(), {
  httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
});
// insert into media table; return public URL
```
**Serving:** attach a **custom domain to `studyblog-media`** (R2 → bucket → Settings → Custom Domains,
e.g. `media.studyblog.example.com`) so Cloudflare CDN caches in front of R2 (egress is free). Add the
media hostname to `images.remotePatterns`. For large uploads, optionally switch to **presigned PUT
URLs via `aws4fetch`** (tiny; avoid `@aws-sdk/*` — it blows the Worker size budget). v1 can use the
direct Worker upload (cover images are small).

## 6. Deploy
**Recommended: Workers Builds (CI/CD)** — connect the GitHub repo in the Cloudflare dashboard so prod
builds run in CI (keeps local `.dev.vars` out of the build, sets `NEXT_PUBLIC_*` build vars centrally).
**Local deploy** for quick iterations:
```bash
pnpm run preview     # build + run real workerd locally (miniflare) — test bindings/cache before shipping
pnpm run deploy -- --keep-vars
```
First-ever deploy: create the worker, then attach the custom domain (`routes` in wrangler.jsonc, or
dashboard). Set `workers_dev:false` once the domain is live.

## 7. Custom domain
`"routes": [{ "pattern": "studyblog.example.com", "custom_domain": true }]` auto-creates DNS + TLS
(the zone must be in the same Cloudflare account). Update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to
match (rebuild for the public var).

## 8. Workers limits to respect (small blog is comfortably inside)
| Limit | Paid | Mitigation |
|-------|------|-----------|
| Worker size (gzip) | ~10 MB | avoid `@aws-sdk/*`; prefer `aws4fetch`; lean deps; analyze `.open-next/.../*.meta.json` |
| CPU / request | 30 s (5 min max) | **cache Markdown render** (`use cache`), don't re-highlight per request |
| Subrequests | 1000+ | fine |
| Memory | 128 MB | fine |
| Secrets | 128 × 5 KB | fine |

## 9. Gotchas (full list in `02-architecture.md` §runtime + research)
- No `runtime = "edge"` anywhere. No native `sharp` at runtime (use IMAGES binding/loader).
- Bindings only via `getCloudflareContext().env` **inside handlers**; **async mode** for SSG
  (`generateStaticParams`, static `generateMetadata`).
- **Per-request DB client** — never a module-level Drizzle singleton (`03-data-model.md` §5).
- No persistent filesystem (`/tmp` is ephemeral) — uploads go to R2.
- ISR/`use cache` won’t propagate across instances without the incremental + tag cache overrides (§1).
- `compatibility_date >= 2025-05-05`; pin a current `@opennextjs/cloudflare` v1.x; test `use cache`
  paths explicitly (newest surface area).

## 10. Pre-deploy checklist
- [ ] `pnpm run preview` works on workerd locally (login, write, publish, read, image upload).
- [ ] Remote D1 migrated **and seeded** (sections + domains).
- [ ] All secrets set in prod (`AUTH_SECRET`, `AUTH_OWNER_HASH`, `AUTH_OWNER_EMAIL`).
- [ ] `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` match the real domain; `AUTH_TRUST_HOST=true`.
- [ ] `cf-typegen` re-run after final `wrangler.jsonc`; `cloudflare-env.d.ts` not committed (gitignore).
- [ ] `.dev.vars`, `.env*`, `.open-next/`, `.wrangler/` gitignored.
- [ ] Custom domain attached; `workers_dev:false`.
- [ ] Deploy with `-- --keep-vars`.
