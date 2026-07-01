# Phase 0 — Foundation

**Goal:** a deployable, empty skeleton on Cloudflare Workers with the full toolchain wired (pnpm,
Next 16 + OpenNext, D1, Tailwind v4 + shadcn tokens) — no feature code, just de-risk the platform.
**Landed in one commit: `14aabe6` "Project init".** Plan: `plan/phases/00-foundation.md`.

> Verified against the plan by a reconciliation pass. This doc describes what **Phase 0** established;
> where the *current* working tree differs, it's because a later phase evolved that file (called out
> below). For the deep patterns see [architecture.md](./architecture.md) and
> [deployment-and-gotchas.md](./deployment-and-gotchas.md).

## What landed

**Toolchain / versions** (`package.json` @ `14aabe6`): `next` **16.2.9** + `react`/`react-dom`
**19.2.4** (all exact-pinned), `@opennextjs/cloudflare` ^1.20.1, `drizzle-orm` ^0.45.2 + `drizzle-kit`
^0.31.10, `wrangler` ^4.105, `tailwindcss` v4, `typescript` ^5. UI utils only at this stage
(`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tw-animate-css`). **pnpm**
(`packageManager: pnpm@10.33.0`, `pnpm.onlyBuiltDependencies: [esbuild, sharp, unrs-resolver,
workerd]`); the create-next-app `package-lock.json` was removed.

**Cloudflare wiring** (`wrangler.jsonc`): worker `studyblog`, `main: .open-next/worker.js`,
`compatibility_date: "2026-03-01"`, `compatibility_flags: ["nodejs_compat",
"global_fetch_strictly_public"]`, bindings `ASSETS` / `IMAGES` / `WORKER_SELF_REFERENCE` and **one D1**
(`DB`). `next.config.ts` calls `initOpenNextCloudflareForDev()` (+ `images.remotePatterns`, **no**
webpack key). `open-next.config.ts` is `defineCloudflareConfig({})` (empty).

**Scripts**: `dev`/`build`/`start`/`lint`, `preview`, `deploy`, `upload`, `cf-typegen`, and the full
`db:generate|migrate:local|migrate|seed:local|seed` set.

**App shell** (`app/layout.tsx`): Inter + JetBrains_Mono via `next/font`, `metadataBase` + title
template, an sr-only skip link → `<main id="main">`, `suppressHydrationWarning` on `<html>`/`<body>`.
`app/globals.css`: Tailwind v4 `@import`s, `@source not "…md/mdx/html"` exclusions,
`@custom-variant dark`, `@theme inline` (radius, shadcn `--color-*`, brand accent, chart, fonts), and
the neutral shadcn palette in **oklch** for `:root`/`.dark`. `lib/utils.ts` = `cn()`. A **binding smoke
test** home page (`app/page.tsx`, `force-dynamic`) renders whether `getCloudflareContext().env.DB` /
`.IMAGES` are defined.

## Plan vs. what landed (deviations)

The plan's *spirit* + acceptance goal (green, deployable skeleton) were met. Concrete divergences:

| Plan said | Reality | Why |
|---|---|---|
| `cacheComponents: true` in `next.config.ts` | **Omitted** (commented) | Deferred to Phase 3, when `use cache` actually exists to test |
| Provision **2 R2 buckets** + R2 bindings | **No R2 at all** | R2 scope not yet granted on the account; deferred to Phase 2/3 |
| `open-next.config.ts` incremental(R2)+tag(D1)+queue(DO) overrides | **Empty** `defineCloudflareConfig({})` | Follows from R2 deferral (→ dummy caches; `revalidatePath` no-ops for now) |
| 2nd D1 binding `NEXT_TAG_CACHE_D1` | Not added | Deferred with the tag cache |
| `drizzle.config.ts` is a Phase-0 file | Landed in **Phase 1** (`db218a5`) | Sequencing — it belongs with the schema |
| `compatibility_date: 2025-05-05` | `2026-03-01` | Satisfies the real constraint (≥ 2025-05-05, avoids the `FinalizationRegistry` error) — an improvement |
| `deploy: opennextjs-cloudflare deploy` | Phase 0 matched the plan; **now** `wrangler deploy --no-autoconfig` | Fixed in Phase 2A — wrangler ≥4.101 autoconfig makes plain deploy silently no-op (see gotchas doc) |
| install `motion`; `shadcn add button card badge`; pin shadcn CLI as a dep | **`motion` never installed**; primitives added in Phase 2A; CLI used via `pnpm dlx` | Not needed until the UI phase |
| keep `.env.example` tracked | Exists locally but **gitignored** (`.env*`) | Intentional — secrets/examples stay local |

Also note (not plan deviations, just attribution): the `ThemeProvider` + sonner `Toaster` in
`layout.tsx`, the expanded `lib/site.ts` (IDENTITY/NAV/links), `--ring: var(--brand)`, the
`.prose-content`/Shiki CSS, and the `ratelimits` binding are all **later phases**, not Phase 0.

**Unplanned cruft:** `course-example.html` (~4.4 MB) is tracked in the repo root — a design reference
that bloats clones (the `@source not "**/*.html"` rule keeps Tailwind from scanning it). Consider
removing or gitignoring it.

## Phase-0 decisions & gotchas worth keeping

- **Prove bindings via `getCloudflareContext().env`, not `process.env`** — on Workers, `process.env` is
  empty; `initOpenNextCloudflareForDev()` makes bindings appear under `next dev` too.
- **`force-dynamic` on the smoke-test home** because it reads request-time bindings (remove when a real
  cached home lands in Phase 3).
- **No `webpack` key** — Turbopack is the Next 16 default; a webpack key breaks the build.
- **`compatibility_date` ≥ 2025-05-05** avoids a Workers-runtime `FinalizationRegistry` error.
- **`--no-autoconfig` deploy trap** — the single most important operational gotcha; see
  [deployment-and-gotchas.md](./deployment-and-gotchas.md#deploy).
