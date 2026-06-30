# Phase 3 — Public Site

**Goal:** build the public reading & discovery experience — implementing the design handoff **1:1**,
reusing the foundation + Prose from Phase 2. This is the interview-facing proof-of-work, so fidelity
and polish matter most here.

> **UI source of truth:** `plan/design/handoff/design/` — `DESIGN-HANDOFF.md` (§1.3 public components,
> §2 screen index, §3 build order "Phase B/C"), `Stage1-Handoff.md` (home + cert hub), `Stage2-Handoff.md`
> (post + project), `Stage3-Handoff.md` (archives/journey/about/search), `AllPosts-Handoff.md`.
> Mockups: `HomeBody`, `SecurityHubBody`, `PostArticleBody`, `ProjectArticleBody`, `ArchiveBody`,
> `ProjectsBody`, `JourneyBody`, `AboutBody`, `SearchBody`, `AllPostsBody`, `SiteHeader`, `SiteFooter`.

> **Reconciliation:** coverage + post lists + search all read from **D1** (not frontmatter/JSON). The
> handoff's "build from frontmatter" (Q1) and "client JSON search index" (Q3) assume a file model; we
> query D1 instead. Coverage components are Server Components fed by the centralized coverage query
> (`03-data-model.md` §10, built in Phase 2).

## Prerequisites / reading
Phase 2 complete (foundation, primitives, Prose, theme, coverage query). Read `01-product-spec.md`
§1–7 and the design handoff above. Next docs: `01-getting-started/03-layouts-and-pages.md`,
`04-functions/generate-static-params.md`, `03-api-reference/02-components/form.md`,
`03-api-reference/05-config/01-next-config-js/cacheComponents.md`.

## Tasks
1. **Enable caching:** turn on `cacheComponents: true` in `next.config.ts` (deferred from Phase 0) and
   validate the build; wrap public lists/posts in `use cache` + tags (`02-architecture.md` §5).
2. **Public shell:** `SiteHeader` (active states, sticky `bg-background/85 backdrop-blur`, search
   trigger, theme toggle, mobile `sheet`) + `SiteFooter` (identity links from `lib/site.ts`) → a
   `app/(public)/layout.tsx` route group.
3. **Leaf components** (`DESIGN-HANDOFF.md` §1.2–1.3): `PostMeta`, `TypeChip`, `TagPill`,
   **`CoverageBar`** (signature; `role=progressbar`, % label, grow-in/`motion-reduce`),
   **`CoverageChecklist`** (signature; status by icon **and** text). Fed by the D1 coverage query.
4. **Cards:** `PostCard` (+`featured`), `ProjectCard` (metric chips, status dot via `--chart-2`,
   repo/demo), `CertCard` (% in `--brand`, progress line), and `PostList` (dense reverse-chron rows).
5. **Post page `/posts/[slug]`** (`Stage2-Handoff.md`): `PostMeta`, cover (16:9), **`TOC`** (h2+h3,
   scroll-spy, sticky desktop / `<details>` mobile — resolves Q8), **`Prose`** (from Phase 2),
   `TagPill`s, `PrevNext` (within domain), `RelatedPosts` (shared tags). `generateStaticParams` over
   published slugs; `generateMetadata`; `opengraph-image.tsx`.
6. **Project write-up variant** (`type=project`): same shell + **`AtAGlanceCard`** (goal/stack/
   duration/status/metrics/repo/demo). This is the interview centerpiece — make results scannable.
7. **Home `/`** (`HomeBody`): `HomeHook` (no hero illustration), progress snapshot (`CoverageBar`×3),
   `CertCard`×3, one featured `ProjectCard`, latest `PostCard`×4 (count = Q7 constant).
8. **Cert hubs `/a-plus` · `/security-plus` · `/network-plus`** (`SecurityHubBody`): `SectionHub`
   (+overall `CoverageBar`), `CoverageChecklist` (per-domain ✓/○ + counts), `CrossCertCard` (honest
   A+/Sec+ > Net+ story), latest posts (×5). Net+ shows the zero/empty state honestly.
9. **Archives via unified `ArchiveList`** (`ArchiveBody`): `/[section]/[category]` (domain +
   official-objective blurb + coverage chip), `/tags/[tag]` (`#tag` in brand + A+→Net+→Sec+
   progression), `/types/[type]` (brand-outline type chip). Include **empty / loading / error** states.
10. **All Posts `/posts`** (`AllPosts-Handoff.md`): `PostList` (reverse-chron, **month-grouped**) +
    `FacetBar` (section/type/tag, shared with search) + sort + "Load older". The "View all" target so
    the IA doesn't jump list→single. Server list + client facet island (URL params).
11. **Projects `/projects`** (`ProjectsBody`): `ProjectCard` grid.
12. **Journey `/journey`** (`JourneyBody`): `NowBlock` (current focus) + `JourneyTimeline` (milestone
    dots: filled = passes/ships, hollow = upcoming) + journal `PostCard`s.
13. **About `/about`** (`AboutBody`): `Prose` (from-zero story) + `AboutIdentity` (Avatar + identity
    links **matching the footer** — single source).
14. **Search `/search`** (`SearchBody`): **server-side over D1** (`LIKE`, or FTS5 later) + facets
    (section/type/tag) + result rows; optional ⌘K `command` palette as a later add. Empty / loading /
    initial states. (Deviation from handoff Q3's JSON index — our content is in D1.)
15. **Polish (optional):** `unstable_instant = { prefetch: 'static' }` on `/posts/[slug]` + hubs; stream
    dynamic bits behind `<Suspense>` (`02-architecture.md` §5).

## Acceptance criteria
- [ ] Every public page is a 1:1 match to its mockup (token-named, both light + dark, mobile + desktop).
- [ ] From home, any post is reachable in ≤3 clicks (cert → domain → post; or `/posts` → post).
- [ ] `CoverageBar`/`CoverageChecklist`/`CrossCertCard` reflect real published-post coverage **from D1**
      and update on publish.
- [ ] Post page: TOC scroll-spy, accurate dates/reading-time, prev/next within domain, related posts;
      project variant shows the at-a-glance card + repo link.
- [ ] `/posts` filters + sorts via URL params and paginates; tag/type/domain archives render with
      empty/loading states.
- [ ] Search returns D1 results filtered by facets.
- [ ] Lists cached (`use cache` + tags) and revalidate on publish; no per-request re-render of post HTML.

## Risks / notes
- `generateStaticParams` with `cacheComponents` must return ≥1 entry — guard empty content (seed ≥1
  post per lead cert).
- Don't read `cookies()`/`searchParams` inside a `use cache` function — pass values as args.
- Keep coverage queries cached under tag `posts`.
- `PostList` (dense) is a sibling of `PostCard`; `ArchiveList` is one component with three intro
  variants — build each once and reuse (handoff build order, Phase C).
