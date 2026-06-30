# Phase 0 — Foundation

**Goal:** a deployable skeleton on Cloudflare with the full toolchain wired — pnpm, OpenNext, empty
D1 + R2 bindings, Tailwind v4 + shadcn, and a "hello world" home page live on Workers. Nothing
feature-specific yet; this de-risks the platform.

**Outcome:** `pnpm run preview` runs the app on the real `workerd` runtime locally, and
`pnpm run deploy` puts it on a `*.workers.dev` (or the custom domain) URL.

---

## Prerequisites / reading
- Read `AGENTS.md`, `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, and this
  plan's `02-architecture.md` + `06-deployment.md`.
- Confirm: Next **16.2.9**, React 19.2, Node ≥20.9 (local 22.x OK), pnpm 10, wrangler 4.

## Tasks
1. **Switch npm → pnpm.**
   - Delete `package-lock.json` and `node_modules/`. Run `pnpm install`.
   - Add to `package.json`: `"packageManager": "pnpm@10.x"` and
     `"pnpm": { "onlyBuiltDependencies": ["esbuild","sharp","unrs-resolver","workerd"] }`.
   - Add `.nvmrc` = `20` (or leave; local 22 is fine).
2. **Install core infra deps** (feature libs arrive in later phases):
   ```bash
   pnpm add @opennextjs/cloudflare drizzle-orm
   pnpm add -D wrangler drizzle-kit
   ```
3. **Config files** (shapes in `06-deployment.md` §1 / `02-architecture.md` §8):
   - `next.config.ts` — add `initOpenNextCloudflareForDev()`, `cacheComponents: true`,
     `images.remotePatterns`. **Do not add a `webpack` key** (breaks the Turbopack build).
   - `open-next.config.ts` — incremental (R2) + tag (D1) + queue (DO) overrides.
   - `wrangler.jsonc` — name, main, compatibility_date `2025-05-05`+, `nodejs_compat` +
     `global_fetch_strictly_public`, assets, IMAGES, D1 (×2 bindings), R2 (×2), DO queue,
     WORKER_SELF_REFERENCE, observability.
   - `drizzle.config.ts` — `dialect:"sqlite"`, `schema:"./lib/db/schema.ts"`, `out:"./migrations"`.
   - `package.json` scripts — dev/build/preview/deploy/upload/cf-typegen/db:* (`06-deployment.md` §1).
4. **Provision Cloudflare:**
   ```bash
   npx wrangler login
   npx wrangler d1 create studyblog-db        # paste id into BOTH d1 entries in wrangler.jsonc
   npx wrangler r2 bucket create studyblog-media
   npx wrangler r2 bucket create studyblog-inc-cache
   pnpm cf-typegen                            # generates cloudflare-env.d.ts (CloudflareEnv)
   ```
5. **shadcn + Tailwind v4 baseline** (`07-design-system.md`):
   - `components.json` (new-york, rsc, lucide, neutral, cssVariables).
   - `app/globals.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, the **`@source not`**
     exclusions, `@custom-variant dark`, an `@theme inline` block, base `:root`/`.dark` tokens.
   - `lib/utils.ts` with `cn()`. Install `clsx tailwind-merge class-variance-authority lucide-react
     tailwind-merge tw-animate-css motion` and `pnpm dlx shadcn@latest add button card badge`.
6. **`.gitignore`:** add `.open-next/`, `.wrangler/`, `.dev.vars*`, `.env*`, `cloudflare-env.d.ts`,
   `*.tsbuildinfo`. Create `.dev.vars` (placeholders; gitignored) and keep `.env.example` updated.
7. **Clean scaffold:** replace the default `app/page.tsx`/`globals.css` boilerplate with a minimal
   root layout (`<html lang>`, fonts, `metadataBase`, skip link, `<main id="main">`) and a simple home
   placeholder. Remove the Vercel/Next SVGs not needed.
8. **Smoke a binding:** in the home page, read `getCloudflareContext().env` and render whether `DB`
   is defined (proves bindings flow in dev). Remove after verifying.

## Acceptance criteria
- [ ] `pnpm install` is clean; `pnpm build` passes (Turbopack, no webpack key).
- [ ] `pnpm dev` serves locally and `getCloudflareContext().env.DB` is defined in a Server Component.
- [ ] `pnpm run preview` builds via OpenNext and serves on **workerd** (miniflare) without errors.
- [ ] `pnpm run deploy -- --keep-vars` succeeds; the hello-world page loads on the deployed URL.
- [ ] `cloudflare-env.d.ts` generated and **gitignored**; `.dev.vars`/`.env*` gitignored.
- [ ] `git status` clean of build artifacts.

## Risks / notes
- `pnpm deploy` ≠ `pnpm run deploy` (built-in shadows the script).
- If `FinalizationRegistry is not defined` at runtime → bump `compatibility_date`.
- Don't commit secrets; don't set `CLOUDFLARE_API_TOKEN` locally (shadows `wrangler login` OAuth).
- This phase writes **no** feature code — resist scope creep; the win is a green deploy.
