# Phase 3 — Public Site

**Goal:** the full public reading & navigation experience — home, cert hubs, domain/type/tag archives,
the rich post page, the **coverage tracker**, the journey narrative, projects, about, and search.

**Outcome:** a polished, fast, navigable blog that works as both a study-review tool and a portfolio.

---

## Prerequisites / reading
Phase 2 complete (content exists to render). Read `01-product-spec.md` §1–7, `02-architecture.md`
§4–5, `07-design-system.md`. Next docs: `01-getting-started/03-layouts-and-pages.md`,
`04-functions/generate-static-params.md`, `02-components/form.md`, `02-guides/instant-navigation.md`.

## Tasks
1. **Site chrome:** `components/site/site-header.tsx` (nav: A+, Security+, Network+, Journey,
   Projects, About, Search) + `site-footer.tsx`. Route group `app/(public)/` shares this layout.
2. **Home `/`:** journey blurb + "from zero" hook, **progress snapshot** (per-exam `coverage-bar`),
   latest posts, the 3 cert cards, a featured `project`. Cached (`use cache`, tag `posts`).
3. **Cert hubs** `/a-plus`, `/security-plus`, `/network-plus`: section blurb, **coverage checklist**
   (each domain ✓/○ + post count, links to domain archive), latest posts in section. Honest framing
   (A+/Sec+ lead; Net+ shown as early/planned).
4. **Archives:**
   - `/[section]/[category]` — domain archive (posts in that domain + the official objective blurb).
   - `/types/[type]` — format archive.
   - `/tags/[tag]` — cross-cert concept hub (+ short "how this deepens A+→Net+→Sec+" intro).
   - `/projects` — `type:project` posts as case-study cards.
   Use `generateStaticParams` for sections/types/known tags/domains where practical; cache lists.
5. **Post page `/posts/[slug]`** (upgrade the Phase 2 stub): `generateStaticParams` over published
   slugs; `<Prose>` + sticky **TOC**, `post-meta` (published/updated/reading-time/type badge),
   cover image, **prev/next within the same domain**, **related posts** (shared tags). For
   `type:project`, render the **at-a-glance card** (`project_meta`) + repo/demo links.
6. **Coverage components** `coverage-bar.tsx` / `coverage-checklist.tsx` driven by the §10 query
   (`03-data-model.md`); unweighted % default, weighted toggle.
7. **Journey `/journey`** — timeline of milestones (exam passes, project ships) + a **Now** block
   (current focus) + the weekly `journal` posts. **About `/about`** — who/why/from-zero + consistent
   identity links (résumé/LinkedIn/GitHub).
8. **Search `/search`** — `components/site/search-form.tsx` using `<Form>` from `next/form` (GET,
   URL params, prefetched); server filters posts by text/section/type/tag (D1 `LIKE`; FTS5 is a
   Phase 5 upgrade). Dynamic route behind `<Suspense>`.
9. **Reading aids & states:** `loading.tsx` skeletons, `not-found.tsx`, empty states for thin
   sections, responsive images, dark-mode toggle.
10. **(Optional polish)** `export const unstable_instant = { prefetch: 'static' }` on `/posts/[slug]`
    and hubs; stream any dynamic bits behind `<Suspense>` (`02-architecture.md` §5).

## Acceptance criteria
- [ ] From the home page a reader can reach any post in ≤3 clicks via cert → domain → post.
- [ ] Coverage bars/checklists reflect real published-post coverage per exam and update on publish.
- [ ] Tag hubs collect posts across all three certs; type archives and project cards render correctly.
- [ ] Post page shows TOC, accurate dates/reading-time, prev/next within the domain, related posts,
      and (for projects) the at-a-glance card + repo link.
- [ ] Search filters by text + facets and is shareable via URL params.
- [ ] Lists are cached and revalidate on publish; no per-request re-render of post HTML.
- [ ] Mobile layout is clean; dark mode works; no layout shift on images.

## Risks / notes
- `generateStaticParams` with `cacheComponents` must return ≥1 entry — guard empty content at launch
  (seed at least one post per lead cert, or fall back to `dynamicParams`).
- Don't read `cookies()`/`searchParams` inside a `use cache` function — pass values in as args.
- Keep coverage queries cached under tag `posts` so they don't run per request.
