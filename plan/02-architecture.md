# 02 — Architecture

How the system is built and why. Pairs with `03-data-model.md` (schema), `04-auth.md` (auth), and
`06-deployment.md` (Cloudflare runbook). Cited doc paths are relative to:

```
DOCS = node_modules/next/dist/docs/01-app/
```

Read the cited page before implementing the matching feature (per `AGENTS.md`).

---

## 1. High-level architecture

```
                     ┌─────────────────────────────────────────────┐
   Reader / Bot ───▶ │  Cloudflare Worker  (OpenNext-wrapped Next)  │
   Interviewer       │                                             │
                     │   Next.js 16 App Router (RSC, Node runtime)  │
   Owner ──/login──▶ │   ├─ public routes (cached, use cache)      │
                     │   ├─ /admin/** (dynamic, auth-gated)        │
                     │   ├─ proxy.ts (optimistic auth redirect)    │
                     │   └─ Server Actions / Route Handlers        │
                     └───┬───────────┬───────────┬────────────┬────┘
                         │ DB        │ MEDIA     │ NEXT_CACHE  │ IMAGES
                         ▼           ▼           ▼            ▼
                    Cloudflare    Cloudflare   R2/KV       Cloudflare
                    D1 (SQLite)   R2 bucket    inc. cache  Images binding
                    via Drizzle   (uploads)    (ISR tags)  (next/image opt)
```

- **One Worker** serves everything (public + admin + API). No separate backend.
- **D1** is the system of record (posts, taxonomy, domains). **Drizzle ORM** provides typed access.
- **R2** stores uploaded images; the **IMAGES** binding optimizes `next/image` in production.
- **R2 (or KV)** also backs OpenNext's **incremental cache** so `use cache` / ISR tags work across
  Worker instances (the reference doesn't configure this yet — we add it; see `06-deployment.md`).
- **Auth** is stateless **JWT** (no session store needed); the owner credential lives in Worker
  secrets.

## 2. Runtime & hosting model (the non-negotiables)

- **Everything runs on the Cloudflare Workers runtime via OpenNext, which uses the Node.js runtime
  (`nodejs_compat`). The `edge` runtime is NOT supported.** Never write `export const runtime =
  "edge"`. (`DOCS/01-getting-started/17-deploying.md`; OpenNext docs.)
- **Bindings (D1, R2, KV, IMAGES) are objects on the Cloudflare context**, accessed with
  `getCloudflareContext().env.<BINDING>` from `@opennextjs/cloudflare` — **not** `process.env`.
  `process.env` holds only string vars/secrets (`AUTH_SECRET`, `AUTH_OWNER_*`, public `NEXT_PUBLIC_*`).
- **`initOpenNextCloudflareForDev()`** in `next.config.ts` makes bindings available in `next dev`.
- **Don't read secrets at build/module load.** Build a lazy accessor; if reading `process.env` at
  request time for a value that must not be inlined, call `await connection()` first
  (`DOCS/03-api-reference/04-functions/connection.md`). Replaces `unstable_noStore`.
- **No native addons** (bcrypt/argon2/sharp-at-runtime). `sharp` is dev-only for image opt; prod uses
  the IMAGES binding.

## 3. Proposed folder structure

App Router at repo root (no `src/`), `@/*` → repo root — matching the reference's conventions.

```
app/
  layout.tsx                 Root layout (<html>/<body>, fonts, metadataBase, skip link)
  page.tsx                   Home
  globals.css                Tailwind v4 @theme + tokens (see 07-design-system.md)
  (public)/                  Route group for public pages (optional, keeps admin separate)
    a-plus/page.tsx
    network-plus/page.tsx
    security-plus/page.tsx
    [section]/[category]/page.tsx
    posts/[slug]/page.tsx
    posts/[slug]/opengraph-image.tsx
    tags/[tag]/page.tsx
    types/[type]/page.tsx
    projects/page.tsx
    journey/page.tsx
    about/page.tsx
    search/page.tsx
  admin/
    layout.tsx               AUTH GATE: await auth(); redirect('/login') if not owner
    page.tsx                 Dashboard
    posts/...                CRUD pages
    taxonomy/page.tsx
    media/page.tsx
    settings/page.tsx
  login/page.tsx
  api/
    auth/[...nextauth]/route.ts     Auth.js handlers (GET, POST)
    media/upload/route.ts           R2 upload (owner-only) — or a Server Action
  sitemap.ts
  robots.ts
  rss.xml/route.ts
proxy.ts                     Optimistic /admin redirect (Node runtime; was middleware.ts)
auth.ts                      NextAuth() config → { handlers, auth, signIn, signOut }
mdx-components.tsx           Required IF we ever enable @next/mdx (no-arg signature)
lib/
  db/
    index.ts                 drizzle(getCloudflareContext().env.DB)
    schema.ts                Drizzle tables
    queries/                 typed read/write helpers (posts, taxonomy, coverage)
  auth/
    password.ts              scrypt hash/verify (node:crypto)
    dal.ts                   verifySession()/requireOwner() — server-only DAL
  content/
    render.ts                Markdown → sanitized HTML (remark/rehype), cached
    toc.ts, reading-time.ts
  taxonomy.ts                Section/type enums + helpers (client-safe constants)
  site.ts                    Site identity (name, url) from env with fallback
  utils.ts                   cn() (clsx + tailwind-merge)
components/
  ui/                        shadcn primitives
  site/                      public composites (header, footer, post-card, coverage-bar, toc, ...)
  admin/                     editor, metadata panel, media picker, ...
content/                     OPTIONAL static TS data (e.g. domain seed authored here, then seeded)
db/                          seed SQL (domains, sample posts)
migrations/                  D1 migration SQL (drizzle-kit generated, wrangler-applied)
drizzle.config.ts
open-next.config.ts
wrangler.jsonc
next.config.ts
```

## 4. Rendering & data flow

- **Server Components by default.** Pages/layouts are `async` Server Components that call typed
  Drizzle queries directly (no API layer for reads). `params`/`searchParams` are **Promises** — await
  them (`DOCS/03-api-reference/03-file-conventions/page.md`).
- **Mutations = Server Actions** (`'use server'`), used by the admin editor. Each action re-verifies
  the owner session, validates input, writes via Drizzle, then revalidates caches
  (`DOCS/01-getting-started/07-mutating-data.md`).
- **Route Handlers** only where a non-page endpoint is needed: Auth.js catch-all, R2 upload, RSS.
  GET handlers are **uncached by default** in v16 (`DOCS/01-getting-started/15-route-handlers.md`).
- **Typed prop helpers** `PageProps<'/posts/[slug]'>`, `RouteContext<'/...'>` are globally available
  (generated by `next dev`/`build`/`next typegen`) — use them; run `npx next typegen` when types lag.

### 4.1 Markdown rendering pipeline (concrete)
Posts store **Markdown** (`body_md`). Render server-side to **sanitized HTML** with a `unified`
pipeline, then dangerously-set the sanitized output inside a styled `.prose` container:

```
remark-parse → remark-gfm → remark-rehype (allowDangerousHtml: false)
  → rehype-slug → rehype-autolink-headings
  → rehype-pretty-code (Shiki) | rehype-highlight      // syntax highlighting
  → rehype-sanitize (schema allowing code/tables/anchors)
  → rehype-stringify
```

- Wrap the render in a cached function: `'use cache'; cacheTag('post-' + id); cacheLife('max')` so a
  post renders once and is reused until edited (`DOCS/03-api-reference/01-directives/use-cache.md`).
- **Sanitize** (rehype-sanitize) because content comes from a DB/editor — defense in depth even
  though it's single-author.
- Syntax highlighting via **Shiki** (build-time themes, no client JS) is ideal for a study blog with
  lots of CLI/code. Pass remark/rehype plugins as **string names** if routed through `@next/mdx`
  (Turbopack constraint); for a standalone `unified` pipeline you import them directly in server code.
- Compute **TOC** and **reading time** from the parsed tree in the same pass.

> **Alternative (documented, not v1):** MDX-from-DB via `next-mdx-remote/rsc` if posts ever need React
> embeds (interactive subnet calculator, quiz widget). Adds JS execution surface — gate to trusted
> single-author content only.

## 5. Caching & revalidation strategy

Enable **`cacheComponents: true`** in `next.config.ts` (replaces `experimental.ppr` / `useCache` /
`dynamicIO`; makes data dynamic-by-default with PPR, opt specific reads *into* cache)
(`DOCS/03-api-reference/05-config/01-next-config-js/cacheComponents.md`).

| Surface | Strategy |
|---------|----------|
| A rendered post | `use cache` + `cacheTag('post-<id>')`, `cacheLife('max')` |
| Post lists (home/section/tag/type/category) | `use cache` + a shared tag like `cacheTag('posts')` (+ per-section tags), `cacheLife('hours')` |
| Coverage tracker | derived from `posts` — tag `cacheTag('posts')` so publishing refreshes it |
| Taxonomy (tags/categories/domains) | `use cache` + `cacheTag('taxonomy')` |
| `/admin/**`, `/search`, anything reading session/cookies | **uncached** (dynamic) |

**Invalidation (in Server Actions):**
- On create/edit/publish/unpublish: `updateTag('post-<id>')` (read-your-writes in the same request),
  plus `revalidateTag('posts', 'max')` and any affected section/tag tags.
- Note v16: **`revalidateTag` requires a 2nd arg** (a cacheLife profile, e.g. `'max'`); `updateTag()`
  and `refresh()` are new and **Server-Action-only**
  (`DOCS/03-api-reference/04-functions/revalidateTag.md`, `.../updateTag.md`).

For this to work on Cloudflare across instances, configure OpenNext's **incremental cache (R2) +
tag cache** in `open-next.config.ts` (see `06-deployment.md`). Without it, tags won't propagate
reliably in production.

### Instant navigation (nice-to-have)
With `cacheComponents` on, opt key public routes into validated instant nav:
`export const unstable_instant = { prefetch: 'static' }` on `/posts/[slug]` and hubs — it *validates*
at build that the cached shell is truly instant (catches a misplaced `<Suspense>`). Stream the
fresh/dynamic bits behind their own `<Suspense>`
(`DOCS/02-guides/instant-navigation.md`). Treat as polish (Phase 4), not load-bearing.

## 6. Next.js 16 conventions cheat-sheet (with doc paths)

| Topic | v16 reality | Doc |
|-------|-------------|-----|
| Build/dev | **Turbopack is default**; drop `--turbopack`; custom webpack needs `--webpack` | `02-guides/upgrading/version-16.md` |
| Request APIs | `await cookies()/headers()/draftMode()`; `params`/`searchParams` are Promises | `03-api-reference/04-functions/cookies.md` |
| Middleware | **`proxy.ts`** (root), **Node-only**, `runtime` option throws; config flag `skipProxyUrlNormalize` | `01-getting-started/16-proxy.md` |
| Route handlers | GET **uncached by default**; opt in `dynamic = 'force-static'`; `ctx.params` is a Promise | `01-getting-started/15-route-handlers.md` |
| Server Actions | `'use server'`, POST-only, **public endpoints — re-auth inside**; `revalidateTag(tag, profile)` | `02-guides/data-security.md` |
| Forms | `<Form>` from `next/form`: string `action` → prefetched GET search form; fn `action` → Server Action | `03-api-reference/02-components/form.md` |
| Caching | `cacheComponents: true`; `use cache`, `cacheLife`, `cacheTag`; `updateTag`/`refresh` (action-only) | `03-api-reference/01-directives/use-cache.md` |
| Metadata | `generateMetadata` (async params); **viewport/themeColor → separate `generateViewport`** | `03-api-reference/04-functions/generate-metadata.md` |
| OG images | `import { ImageResponse } from 'next/og'`; `opengraph-image.tsx`; `Image({ params })` params is Promise | `03-api-reference/04-functions/image-response.md` |
| Sitemap/robots | `sitemap.ts`/`robots.ts` returning `MetadataRoute.*`; `generateStaticParams` returns sync array | `03-api-reference/03-file-conventions/01-metadata/sitemap.md` |
| Static params | `generateStaticParams` sync array; with `cacheComponents` must return ≥1 | `03-api-reference/04-functions/generate-static-params.md` |
| Error UI | `error.tsx` is a **Client Component**; `unstable_retry` prop (16.2) preferred over `reset` | `03-api-reference/03-file-conventions/error.md` |
| Auth interrupts | `forbidden()`/`unauthorized()` + `forbidden.tsx`/`unauthorized.tsx` (experimental: `authInterrupts`) | `02-guides/authentication.md` |
| Parallel routes | every slot needs `default.js` | `02-guides/upgrading/version-16.md` |
| Images | `images.remotePatterns` (not `domains`); defaults tightened (`qualities:[75]`, 4h TTL) | upgrade guide |
| MDX | `@next/mdx` **file-based only**; `mdx-components.tsx` `useMDXComponents()` takes **no args**; no DB-string API | `02-guides/mdx.md` |
| Removed | `next lint`, AMP, `next/legacy/image`, `serverRuntimeConfig`/`publicRuntimeConfig` | upgrade guide |

## 7. Library inventory (pin to reference where shared)

| Package | Version | Use |
|---------|---------|-----|
| `next` | 16.2.x | framework |
| `react`, `react-dom` | 19.2.x | |
| `@opennextjs/cloudflare` | ^1.19.x | CF adapter |
| `wrangler` (dev) | ^4.x | CF CLI, D1 migrations, types |
| `next-auth` (Auth.js v5) | ^5 (beta line) | auth — see `04-auth.md` |
| `drizzle-orm` | latest | D1 access |
| `drizzle-kit` (dev) | latest | schema → migration SQL |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | styling |
| `shadcn` (CLI, dev) | ^4.x | components |
| `radix-ui` | ^1.x | primitives (unified pkg) |
| `lucide-react`, `motion`, `tailwind-merge`, `clsx`, `class-variance-authority`, `tw-animate-css` | per reference | UI utils |
| `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`/`shiki`, `rehype-sanitize`, `rehype-stringify` | latest | Markdown pipeline |
| `zod` | latest | input validation in actions |
| (opt.) `resend`, `@react-email/components` | per reference | contact/newsletter later |

> Pin exact versions during Phase 0 by checking the reference's `package.json` and the registry.
> Confirm `next-auth` v5's current stable/beta tag at install time (`04-auth.md`).

## 8. Key config: `next.config.ts` (target shape)

```ts
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  cacheComponents: true,                 // replaces ppr/useCache/dynamicIO
  typedRoutes: true,                     // stable in v16
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      // + your public R2/custom media domain
    ],
  },
  // experimental: { authInterrupts: true }, // only if using forbidden()/unauthorized()
};

export default nextConfig;

// Make Cloudflare bindings available during `next dev` (OpenNext).
initOpenNextCloudflareForDev();
```

> If we later route post bodies through `@next/mdx`, wrap with `createMDX` and add `md`/`mdx` to
> `pageExtensions` — **not needed** for the DB-Markdown pipeline (which renders via `unified`
> directly). Do **not** add a `webpack` key (would break the Turbopack build).

## 9. Must-read docs before each feature (quick map)
- Routing/layouts/pages → `DOCS/01-getting-started/03-layouts-and-pages.md`
- Data fetching → `DOCS/01-getting-started/06-fetching-data.md`
- Mutations/actions → `DOCS/01-getting-started/07-mutating-data.md`
- Caching → `DOCS/02-guides/migrating-to-cache-components.md` + `01-directives/use-cache.md`
- Auth → `DOCS/02-guides/authentication.md` + `DOCS/02-guides/data-security.md`
- Proxy → `DOCS/01-getting-started/16-proxy.md`
- Metadata/OG/sitemap → `DOCS/01-getting-started/14-metadata-and-og-images.md`
- Deploy → `DOCS/01-getting-started/17-deploying.md` (+ `06-deployment.md` here for OpenNext specifics)
