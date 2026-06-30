# StudyBlog — Stage 3 Handoff Specs (Discovery & Narrative pages)

> Per-screen blocks in the exact format from `components-tech-and-handoff-spec.md`. Components
> referenced by name; full specs in `Component-Library-Sheet.md` (v5 §34–§38). Token-named, no
> arbitrary values. Both themes via `.dark`; both breakpoints noted per element.
>
> **Mockups:** `StudyBlog Discovery.dc.html` (7-screen switcher: Domain / Tag / Type archives ·
> Projects · Journey · About · Search — with a Results/Empty/Loading state toggle on archives + search;
> desktop + mobile frames; theme toggle). Built bodies: `ArchiveBody` (domain/tag/type),
> `ProjectsBody`, `JourneyBody`, `AboutBody`, `SearchBody`. All reuse `SiteHeader` + `SiteFooter`.

---

### Screen: Domain archive  (route: /[section]/[category])
- **Layout:** SiteHeader → `max-w-[1080px] mx-auto px-5 pt-8 pb-14`: breadcrumb → domain intro →
  count+sort bar → PostCard grid. SiteFooter.
- **Component tree:**
  - **SiteHeader** — `active` = the section (e.g. `a-plus`).
  - **ArchiveList(domain)** → `components/site/archive-list.tsx` (Library §34): h1 (category) + `<cert>
    · Domain x.0` (mono) + **official-objective blurb** (`text-base muted max-w-[70ch]`) + **coverage
    indicator chip** (filled brand check circle + "Covered · N posts · 1 of 4 covered A+ domains").
  - **count+sort bar**: result count (`font-mono text-xs`) + Sort `select` (Newest). `border-b`.
  - **PostCard grid** → `post-card.tsx` ×n, `flex-wrap basis-[330px]`.
- **States:** **results** (shown) · **empty** (dashed-border card + lucide `file` + "No posts here
  yet" + "Browse all posts" link — honest when a domain has no write-up) · **loading** (skeleton card
  grid, `sbPulse`). 
- **Typography:** h1 `text-3xl/600`; objective `text-base`; meta/count/exam mono.
- **Icons:** `check`, `file`, `chevron-down`, `arrow-right`.
- **Data:** category + parent cert/domain + official objective text; posts filtered by
  `section`+`category`; coverage count from the domain's published-post tally.
- **A11y:** landmarks; coverage chip conveys state by icon **and** text; logical order.
- **Dev notes:** **Server Component** (filtered list); sort/empty/loading handled server-side or via a
  thin client island. Coverage tally from frontmatter (DESIGN-HANDOFF Q1).

---

### Screen: Tag hub  (route: /tags/[tag])
- **Layout:** identical shell; intro is the tag variant.
- **Component tree:**
  - **ArchiveList(tag)** → §34: `#tag` h1 (`font-mono text-brand text-3xl`) + cross-cert **progression
    chips** ("A+ router basics → Net+ ACLs & zones → Sec+ architecture", lucide `arrow-right` between)
    — tells the "one concept deepens across the three certs" story · then count+sort + PostCard grid.
  - posts span all three certs; each card's crumb shows its `section · category`.
- **States:** results / empty / loading (as domain).
- **Typography:** `#tag` mono brand 3xl; progression chips mono 11px in pills.
- **Data:** all posts carrying the tag; the 3-step progression is editorial copy per featured tag
  (optional field) — falls back to just the grid if absent.
- **Dev notes:** Server Component; `/tags/[tag]` static-generated from the tag set.

---

### Screen: Type archive  (route: /types/[type])
- **Layout:** identical shell; intro is the type variant — leans on the **type badge system**.
- **Component tree:**
  - **ArchiveList(type)** → §34: brand-outline **type chip** (`lab`, mono, `border-brand text-brand`)
    + h1 ("Lab write-ups") + one-line blurb · count+sort + PostCard grid (all same type).
- **States:** results / empty / loading.
- **Data:** posts filtered by `type`; one of the 9 type values.
- **Dev notes:** Server Component; `/types/[type]` static from the type enum.

---

### Screen: Projects  (route: /projects)
- **Layout:** SiteHeader → intro (h1 + blurb) → ProjectCard grid (`flex-wrap basis-[460px]`) →
  SiteFooter.
- **Component tree:**
  - **ProjectCard** ×n → `project-card.tsx` (case-study form): brand-outline `project` chip + crumb +
    **status dot** (Shipped `--chart-2` / In-progress muted) · title `text-xl/600` · excerpt · **metric
    chips** (value `font-mono text-brand` + label, e.g. "47 hosts", "12→3 criticals") · footer with
    **Repo** (github glyph) + **Demo** (play) + date, `border-t`.
- **States:** populated (mix of Shipped + In-progress shown) · hover `border-brand` · loading skeleton
  · empty (no projects yet).
- **Typography:** h1 `text-2xl/600`; metric values mono brand; meta mono.
- **Icons:** `github` glyph, `play`, `external-link`.
- **Data:** project-type posts with goal/status/metrics/repoUrl/demoUrl; metrics visible at the card
  level so results are scannable without opening.
- **A11y:** metric values paired with labels; repo/demo are discernible links.
- **Dev notes:** Server Component; repo/demo are external links.

---

### Screen: Journey  (route: /journey)
- **Layout:** SiteHeader → intro → **NowBlock** → **JourneyTimeline (Milestones)** → **weekly journal**
  list → SiteFooter.
- **Component tree:**
  - **NowBlock** → `components/site/now-block.tsx` (Library §35): "Now" pulse-dot label + current
    focus (h2 + paragraph) + 3 inline stats (`font-mono text-2xl text-brand`: hours/wk, last test, posts).
  - **JourneyTimeline** → `components/site/journey-timeline.tsx` (Library §36): vertical rail
    (`border-l border-border`, `pl-7`); each milestone = dot (filled `bg-brand` for pass/ship/start;
    hollow `border-border` for **target/future**) + date (mono) + **tag pill** (Target dashed / Shipped
    `--chart-2` tint / Started muted) + title (future = muted) + note. Newest-first, ending at "Started
    StudyBlog".
  - **weekly journal** → compact PostCards (`type=journal`): journal chip + week + meta + title +
    excerpt, vertical stack.
- **States:** populated; future/target milestone (hollow dot, muted title); loading (skeleton rail).
- **Typography:** h1 `text-2xl/600`; Now stats mono 24px brand; milestone titles `text-[17px]/600`;
  dates/tags mono.
- **Icons:** none required beyond `arrow-right` (journal link).
- **Data:** milestones (exam passes, project ships, starts, the booked target) + the Now snapshot +
  recent `journal` posts.
- **A11y:** timeline is an ordered list semantically; dot state echoed by the tag text.
- **Dev notes:** Server Component; Now snapshot from a small site-config/MDX singleton.

---

### Screen: About  (route: /about)
- **Layout:** SiteHeader → two-column `flex-wrap gap-10`: story `article` (`basis-[440px]`) +
  sticky identity aside (`basis-[280px] top-20`). Mobile stacks (story first).
- **Component tree:**
  - **Story** → `.prose`-style narrative (h1 `text-3xl/600 text-balance`, lede `text-lg`, h2 sections,
    body `text-[17px] leading-[1.75]`): the from-zero story + "why a public study log" + "the plan".
  - **AboutIdentity** → `components/site/about.tsx` (Library §37): avatar (initials) + name/handle +
    **identity links** (GitHub / LinkedIn / RSS as bordered rows with `external-link`, hover
    `border-brand text-brand`) — must match the footer's set (single source). + **Quick facts** card
    (Currently / Goal / Tools / Certs; mono keys).
- **States:** static; link hover/focus.
- **Typography:** h1 `text-3xl/600`; section h2 `text-xl/600`; body `text-[17px]`; facts keys mono.
- **Icons:** `github` glyph, `linkedin` glyph, `rss`, `external-link`.
- **Data:** bio prose (CMS singleton) + identity links from site config (shared with footer) + facts.
- **A11y:** landmarks; identity links labelled; avatar has alt/initials.
- **Dev notes:** Server Component; identity links imported from one site-config source (DESIGN-HANDOFF Q5).

---

### Screen: Search  (route: /search)
- **Layout:** SiteHeader → h1 → search `input` (brand ring) → two-column `flex-wrap gap-6`: facet
  aside (`basis-56`) + results column (`basis-[440px]`). SiteFooter. Mobile: facets in a `sheet`.
- **Component tree:**
  - **SearchInput** → big `input` (lucide `search` + `esc` hint), brand focus ring.
  - **Facets** → `components/site/search-facets.tsx`: **Section / Type / Tag** groups of toggle chips
    (badge outline; selected `bg-brand/12 text-brand border-[brand 30%]` + `aria-pressed`).
  - **Results** → result rows (`bg-card border-border rounded-lg`): type chip + `section · category`
    crumb + date + title + **matched snippet** (`text-muted-foreground`, `…` around the hit).
  - command palette (⌘K) — same index, optional surface (DESIGN-HANDOFF Q3).
- **States:** **results** (count `font-mono` + active-filter count) · **empty** ("No results for
  '<q>'" + clear-filters hint + **popular tags**) · **loading** (skeleton rows + skeleton count) ·
  initial (recent/popular before typing).
- **Typography:** input 16px; result title `text-base/600`; snippet `text-[13.5px]`; counts/dates mono;
  facet labels mono-uppercase.
- **Icons:** `search`, `arrow-right`.
- **Data:** build-time JSON index over posts (title/excerpt/body/tags/section/type); facets filter it.
- **A11y:** input labelled; facet chips `aria-pressed`; results region `aria-live="polite"`;
  empty state actionable.
- **Dev notes:** **Client island** — controlled input (debounced) + facet state over the static index;
  no server round-trip for queries (DESIGN-HANDOFF Q3). Facets reflect to URL params for shareability.

---

## Build order (Discovery — Phase C from DESIGN-HANDOFF §3)
1. `ArchiveList` (domain/tag/type variants + empty/loading) → the 3 archive routes (dep: PostCard).
2. `Projects` index (dep: ProjectCard).
3. `NowBlock` + `JourneyTimeline` → Journey.
4. About (`.prose` + AboutIdentity).
5. `SearchInput` + Facets + results + command palette → Search (dep: build-time index, PostCard).

## Open questions (carried — see DESIGN-HANDOFF §5)
- Q1 coverage source · Q3 search index + ⌘K surface · Q5 identity-links single source · Q7
  latest-post / pagination counts (archives paginate at?) · plus: **featured-tag progression copy** —
  is the A+→Net+→Sec+ blurb a per-tag optional frontmatter field, or editorial-only on select tags?
