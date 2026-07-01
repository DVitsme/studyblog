# Phase 3 — Public Reading & Discovery Site

The interview-facing surface: home, cert hubs, article pages, archives, discovery, and search. Built
1:1 from the design handoff (`plan/design/handoff/design/`), reading everything from **D1** (not
frontmatter). Read `docs/architecture.md` and `docs/data-and-content.md` first for the foundation this
builds on.

## Routes (all under the `app/(public)/` route group)

| Route | File | Rendering | Notes |
|---|---|---|---|
| `/` | `(public)/page.tsx` | dynamic | HomeHook, 3× CoverageBar, 3× CertCard, featured ProjectCard, latest PostCard×4 |
| `/posts/[slug]` | `(public)/posts/[slug]/page.tsx` | dynamic | Article: cover, TOC (scroll-spy), Prose, tags, PrevNext, RelatedPosts. `type=project` → AtAGlanceCard |
| `/[section]` | `(public)/[section]/page.tsx` | dynamic | Cert hub (`a-plus`/`security-plus`/`network-plus`): SectionHub, CoverageChecklist, CrossCertCard, latest×5. Unknown slug → 404 |
| `/[section]/[category]` | `(public)/[section]/[category]/page.tsx` | dynamic | Domain archive (category = `slugify(domain.name)`) |
| `/tags/[tag]` | `(public)/tags/[tag]/page.tsx` | dynamic | Tag archive |
| `/types/[type]` | `(public)/types/[type]/page.tsx` | dynamic | Type archive (validates against `POST_TYPES`) |
| `/posts` | `(public)/posts/page.tsx` | dynamic | All Posts: month-grouped `PostRow`s + `FacetBar` (client) + sort + "Load older" |
| `/projects` | `(public)/projects/page.tsx` | dynamic | ProjectCard grid |
| `/journey` | `(public)/journey/page.tsx` | dynamic | NowBlock + JourneyTimeline + journal PostCards |
| `/about` | `(public)/about/page.tsx` | **static** | The only genuinely static page — no D1 reads (identity from `lib/site.ts`) |
| `/search` | `(public)/search/page.tsx` | dynamic | Server-side D1 **FTS5** + `SearchForm` client facets |

The `(public)` route group provides the shell layout (`SiteHeader` + `<main id="main">` + `SiteFooter`);
admin/login/api/media live outside it and keep their own chrome. The root `app/layout.tsx` no longer
wraps children in `<main>` — each area owns its own `<main id="main">` (fixes the nested-`<main>` +
skip-link target). Admin's `<main>` lives in `AdminShell`; login wraps its card in `<main>`.

## Key decisions

### 1. Caching — runtime-first ISR, `cacheComponents` OFF (deviates from the plan, research-backed)

The plan said "enable `cacheComponents`". Research (see the caching report) concluded that is the
**riskier** path on `@opennextjs/cloudflare` 1.20: it forces PPR-by-default, **disables cache
interception**, and `use cache` → R2 durability is undocumented on Cloudflare. Instead we use **classic
ISR/SSG with `cacheComponents` off, runtime-first**:

- Pages read D1 via the sync `getCloudflareContext().env` at **request time** — no build-time binding
  coupling, no forced `generateStaticParams`, no risk of building against an empty local D1.
- **The page code is cache-agnostic.** It's identical whether or not the incremental cache is wired.
- **Current state = "option C" (fully dynamic):** every data page has `export const dynamic =
  "force-dynamic"` so the initial deploy is guaranteed (no new bindings, nothing to populate at build).
  `/about` is the exception — pure static.
- `savePost`/`deletePost` already call `revalidatePath` for the public routes (`/`, `/posts`,
  `/posts/[slug]`, `/[section]`). These are **no-ops while dynamic**, and become the publish-time cache
  invalidation the moment the incremental cache is enabled.

**Deferred flip to cached ISR (the "option B" the research recommends as the end state):**
1. Provision a dedicated R2 bucket `studyblog-cache` (+ optionally a `studyblog-tag-cache` D1).
2. `open-next.config.ts`: `incrementalCache: r2IncrementalCache`, `tagCache: d1NextTagCache`,
   `enableCacheInterception: true`. **No `queue`** (we do only on-demand revalidation → no Durable
   Object, no Workers-Paid dependency).
3. `wrangler.jsonc`: add `NEXT_INC_CACHE_R2_BUCKET` + `NEXT_TAG_CACHE_D1` bindings.
4. Remove `force-dynamic` from the param routes (`/posts/[slug]`, `/[section]`, archives) so they render
   on first request and cache to R2; keep `/search` and `/posts` dynamic (they read `searchParams`).

Smallest blast radius: ship dynamic, verify, then flip. R2 cache population is a known-flaky OpenNext
step — keep the runtime-first pattern so there is little to populate at build.

### 2. Search — Cloudflare D1 **FTS5** (`migrations/0002_fts_search.sql`)

D1 supports the SQLite FTS5 module. We use an **external-content** virtual table (`content='posts'`,
`content_rowid='id'`, `tokenize='porter unicode61'`) kept in sync by three triggers, and rank with
weighted `bm25(posts_fts, 10, 5, 1)` (title > excerpt > body).

- **Migration gotcha:** the trigger `BEGIN`/`END` are **UPPERCASE** — D1's *remote* migration splitter
  mis-parses lowercase `begin` inside a trigger body and fails only on `--remote`.
- **Query safety (`searchPosts` in `lib/db/queries.ts`):** `toFtsMatch()` strips input to
  letter/digit tokens and re-emits each as a quoted prefix term (`"foo"* "bar"*`). No user character can
  reach an FTS operator, so a malformed-input syntax error is **impossible**. Values are still bound
  parameters (injection-safe). Raw SQL is used (FTS table + `bm25()` are outside Drizzle's schema); unix
  timestamps are converted to `Date` by hand since raw SQL bypasses Drizzle's timestamp mapping.
- Seed after migrating: `pnpm db:seed:posts:local` / `pnpm db:seed:posts` (the `posts_ai` trigger keeps
  the index synced on every admin write).

### 3. The public query layer (`lib/db/queries.ts`, "PUBLIC READS" section)

Every public read is scoped to `status='published'` and returns plain data (pages layer caching on top):
`listPublishedPosts` (the flexible filter behind `/posts`, archives, hubs, home — section/type/tag/`q`),
`countPublishedPosts`, `getPublishedPostBySlug`, `prevNextForPost`, `relatedPosts` (shared-tag count),
`listProjects`/`featuredProject`, `sectionCoverage` (the CoverageChecklist feed), `certCards`,
`sectionFacets`/`typeFacets`/`tagFacets`, and `searchPosts`. Tag filtering uses a correlated `EXISTS` so
posts never fan out into duplicate rows.

### 4. Editorial copy (`lib/content/copy.ts`)

Copy that is **not** in D1 lives here, keyed by section slug / `domain_ref` / type: cert-hub
descriptions + honest notes, per-domain checklist captions, and type-archive blurbs. Journey milestones
and About facts are page-local. Kept in code (not the DB) so it versions with the repo.

## Component map (`components/site/`)

Leaf: `type-chip` (+`brand` variant), `tag-pill`, `post-meta`, `coverage-bar` (`CoverageTrack` +
`CoverageBar`, the reusable animated track), `coverage-checklist`, `empty-state`, `icons` (inline
GitHub/LinkedIn glyphs). Cards: `post-card` (vertical/stacked/featured), `project-card`, `cert-card`,
`post-list` (`PostRow`). Article: `toc` (`Toc` desktop scroll-spy + `TocMobile`), `prev-next`,
`related-posts`, `at-a-glance`. Sections: `home-hook`, `section-hub`, `cross-cert`, `now-block`,
`journey-timeline`, `about-identity`, `archive-list`. Islands (`"use client"`): `site-header`,
`facet-bar`, `search-form`, `toc`. Reused from Phase 2: `prose` (the `.prose-content` reading surface).

## Gotchas specific to this phase

- **lucide-react removed brand glyphs** (`Github`, `Linkedin`) — they're logos, not icons. Use the inline
  SVGs in `components/site/icons.tsx`. All other lucide icons are present.
- **TOC id matching:** `renderMarkdownWithToc` collects headings **after** `rehype-slug` (so ids match
  the anchors) and **before** autolink (so the text is clean). Do not reorder the pipeline.
- **Cover images use `next/image` with `unoptimized`** — the optimizer's self-fetch of `/media/<key>`
  fails under `global_fetch_strictly_public`. Proper optimization is a Phase 4 item.
- **Tailwind spacing:** non-standard steps (18/22/26px) are written as arbitrary brackets (`p-[22px]`,
  `gap-[26px]`) rather than `p-5.5` to guarantee the class is emitted.
- **`force-dynamic` everywhere** is intentional for the initial ship (see caching decision), not an
  oversight.

## Deferred / follow-ups (see `studyblog-followups`)

- The caching flip to ISR (§1) — the biggest remaining item; do it once a base deploy is verified.
- Public **image optimization** for covers (Cloudflare Images / a loader) — currently `unoptimized`.
- `opengraph-image.tsx` per post (metadata is wired; the dynamic OG image is not).
- An RSS feed (`/rss.xml`) — `IDENTITY.rss` is stubbed; the footer/About reveal it once it ships.
- Optional `⌘K` command palette (the `/search` page is the primary surface).
