# StudyBlog — Design Handoff Package (Dev-Ready, v1.0)

> **Audience:** the developer (Claude Code) implementing StudyBlog in the production repo.
> **Promise:** every component and screen below names its tokens by Tailwind class, maps to a shadcn/ui
> "new-york" primitive and/or a target file path, and is specified in **light + dark**. Implementation
> should be a faithful transcription, not a reinterpretation.
>
> **Source of truth:** `design-tokens.md` (tokens, verbatim), `content-ia-and-samples.md` (IA + sample
> content), `components-tech-and-handoff-spec.md` (stack + handoff format), `studyblog-brief.md` (voice).
> **Companion docs:** `Handoff-Plan.md`, `Stage1-Handoff.md`, `Stage2-Handoff.md`,
> `Component-Library-Sheet.md` (the running per-stage sheet).
> **Visual mockups (Design Components):** `StudyBlog Foundations.dc.html` (style tile + kit),
> `StudyBlog Screens.dc.html` (Home, Security+ hub), `StudyBlog Article.dc.html` (Post, Project).
> Archive/Projects bodies exist as DCs (`ArchiveBody`, `ProjectsBody`); Journey/About/Search are
> **spec-complete here, mockups pending** (flagged in the Screen Index).

---

## 0. Global system (applies to every screen)

**Stack:** Next.js 16 App Router + RSC · Tailwind v4 (CSS-variable tokens) · shadcn/ui "new-york" +
Radix + lucide-react · fonts via `next/font` (Inter `--font-sans`, JetBrains Mono `--font-mono`).
**Dark mode:** `.dark` class on `<html>` (class strategy). All color comes from the semantic tokens,
which flip automatically — **no per-component dark styling** beyond the tokens.

**Tokens (Tailwind classes used in this doc):** `bg-background` `text-foreground` `bg-card`
`text-card-foreground` `bg-muted` `text-muted-foreground` `bg-primary` `text-primary-foreground`
`bg-secondary` `text-secondary-foreground` `bg-accent` `border-border` `border-input` `ring-ring`
`text-brand` `bg-brand` `text-brand-foreground` `bg-destructive` `text-destructive` + `--chart-1…5`.
**Radius:** `rounded-sm` (radius−4) · `rounded-md` (radius−2) · `rounded-lg` (radius = 0.625rem) ·
`rounded-xl` (radius+4). Buttons/inputs `rounded-md`; cards `rounded-lg`; pills `rounded-full`.
**Type scale:** `text-xs`→`text-5xl` (Tailwind defaults). Body in prose `text-[17px] leading-[1.75]`;
headings weight 600, `tracking-tight`, `text-balance`. Mono for code, dates/reading-time, type chips,
small technical labels.
**Elevation:** flat + hairline `border-border` by default; `shadow-sm/md` reserved for
popover/dropdown/dialog/command/sheet only.
**Focus (every interactive element):** `outline-none focus-visible:ring-2 focus-visible:ring-brand
focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
**Motion:** subtle only (coverage-bar grow-in, skeleton pulse); all gated by
`motion-reduce:animate-none` / `prefers-reduced-motion`.
**Accent discipline:** `--brand` = links, active nav, focus rings, progress fills, key metrics. Not
decorative. Data-viz uses `--brand` + `--chart-*`.

---

## 1. Complete Component Library

> Format per entry: **maps to** (shadcn primitive / file path) · **variants/props** · **tokens** ·
> **states** · **responsive**. States legend: default · hover · focus · active · disabled · loading ·
> empty · error (only the meaningful ones listed).

### 1.1 shadcn primitives in use (install via shadcn CLI, "new-york")
`button` `card` `badge` `input` `textarea` `select` `dropdown-menu` `dialog` `sheet` `tabs` `tooltip`
`separator` `avatar` `skeleton` `sonner` (toast) `progress` `table` `switch` `label` `popover`
`command` (search). Reuse these before inventing equivalents.

### 1.2 Primitive-level components

**Button** — `components/ui/button.tsx` (shadcn `button`)
- variants: `primary`(default) `secondary` `ghost` `link`; sizes `sm | default(h-9) | icon(h-9 w-9)`.
- tokens: primary `bg-primary text-primary-foreground rounded-md h-9 px-4 text-sm font-medium`;
  secondary `bg-secondary text-secondary-foreground border border-border`; ghost
  `bg-transparent text-foreground`; link `text-brand underline-offset-4`.
- states: hover (primary `hover:opacity-90`; secondary/ghost `hover:bg-accent`); focus brand ring;
  disabled `opacity-50 pointer-events-none`; loading (spinner + disabled).

**Badge** — `components/ui/badge.tsx` (shadcn `badge`)
- variants: `default` `secondary` `outline` `brand` `destructive`. `rounded-full text-xs font-semibold
  px-2.5 py-0.5`. brand `bg-brand text-brand-foreground`; destructive `bg-destructive text-white`.

**TypeChip** — shadcn `badge`(outline) used in cards/meta
- the post **type** axis as a mono chip: `font-mono text-xs font-medium px-2 py-0.5 rounded-sm border
  border-border text-muted-foreground bg-background`. Values: `concept cram lab troubleshooting
  practice-exam study-guide journal project resources`. Monochrome by design (credibility > color).
  On `/types/[type]` the active type renders as a **brand-outline** chip (`border-brand text-brand`).

**TagPill** — `components/site/tag-pill.tsx`
- `font-mono text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground`, shown `#tag`.
- states: hover `bg-accent text-brand`; focus ring. Links to `/tags/[tag]`.

**Input / Textarea / Select** — shadcn `input` `textarea` `select`
- shared: `bg-background border border-input rounded-md text-sm text-foreground h-9 px-3`
  (textarea `min-h-16 py-2`). placeholder `text-muted-foreground`.
- states: focus brand ring; disabled `opacity-50`; **error** `border-destructive` + helper
  `text-destructive text-sm`. select trigger + lucide `chevron-down`; menu on `popover` (raised).

**Tabs** — shadcn `tabs` (Radix)
- list `bg-muted rounded-md p-1`; trigger active `bg-background text-foreground shadow-sm rounded-sm`,
  idle `text-muted-foreground`; `text-sm font-medium px-3 py-1.5`. states active/idle/hover/focus.

**Card** — `components/ui/card.tsx` (shadcn `card`)
- `bg-card text-card-foreground border border-border rounded-lg` (`p-5`/`p-6`). flat by default.

**Skeleton** — shadcn `skeleton`
- `bg-muted rounded` blocks, `animate-pulse` (`motion-reduce:animate-none`). Used in archive/search/
  card loading states.

**Avatar** — shadcn `avatar` — About page identity; `rounded-full`, fallback initials on `bg-muted`.

### 1.3 Public composite components

**SiteHeader** — `components/site/site-header.tsx`  *(built: `SiteHeader.dc.html`)*
- props: `active?: 'a-plus'|'security-plus'|'network-plus'|'journey'|'projects'|'about'`.
- tokens: `bg-card border-b border-border` (sticky `bg-background/85 backdrop-blur`); nav item
  `text-sm text-muted-foreground rounded-sm px-2.5 py-1.5`; **active** `text-brand bg-brand/10
  font-medium`; search/theme buttons `size-icon border-border`.
- states: nav default/hover/active; focus rings; sticky-on-scroll.
- responsive: full nav `md+`; `sm` → wordmark + search + `menu` → `sheet` drawer.
- dev: client island (theme toggle, mobile `sheet`, search trigger); else server.

**SiteFooter** — `components/site/site-footer.tsx`  *(built: `SiteFooter.dc.html`)*
- `bg-card border-t border-border`; identity links `font-mono text-sm text-muted-foreground`
  hover `text-brand`. responsive: row → stacked on `sm`.

**PostMeta** — `components/site/post-meta.tsx`
- mono chip row: type chip + `Published <date>` / `Updated <date>` + `· <n> min read` (or `reference`).
  `font-mono text-xs text-muted-foreground`.

**PostCard** — `components/site/post-card.tsx`
- props: `post`, `featured?`. Card › [TypeChip + `section · category` crumb] · title `text-lg/600
  text-balance` · excerpt `text-sm text-muted-foreground` (clamp 2–3) · PostMeta.
- states: hover `border-brand` (whole card is link); focus ring; loading skeleton; `featured` = wider
  span + larger title. responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

**ProjectCard** — `components/site/project-card.tsx`  *(built: `ProjectsBody.dc.html`)*
- props: `project{…post, status, metrics[], repoUrl, demoUrl}`. brand-outline `project` chip + crumb +
  status dot (`--chart-2` Shipped / `text-muted-foreground` In-progress) · title `text-xl/600` ·
  excerpt · **metric chips** (value `font-mono text-brand`) · footer repo/demo + date.
- states: hover `border-brand`; focus; loading; empty (no metrics → hide chip row).

**CertCard** — `components/site/cert-card.tsx`  *(built: `HomeBody.dc.html`)*
- props: `cert{name,exam,covered,total,postCount,href}`. big `%` `font-mono text-3xl text-brand` +
  `covered of total domains` + 4px progress line + footer (count + `Explore →`).
- states: hover `border-brand`; zero (`postCount=0` → "No posts yet", 0 fill); loading.

**CoverageBar** — `components/site/coverage-bar.tsx`  *(built: Foundations + Home)* — **signature**
- props: `cert{name,exam,covered,total}`. label row + track `bg-muted h-2 rounded-full` + fill
  `bg-brand` (width = pct) + `%` `font-mono text-brand`. May wrap shadcn `progress`.
- states: populated · zero (track only + note) · loading (skeleton). a11y `role=progressbar`
  `aria-valuenow/min/max`; % label always present (never color-only). motion: grow-in, reduce-safe.

**CoverageChecklist** — `components/site/coverage-checklist.tsx`  *(built: SecurityHubBody)* — **signature**
- props: `domains{domain,sub?,postCount,done}[]`, `exam`. rows: done = lucide `check` in `bg-brand
  text-brand-foreground` circle; empty = hollow `border-border` circle; label (`text-sm`; empty
  `text-muted-foreground`) + optional sub caption + count `font-mono text-xs`; trailing "write-next"
  note row (lucide `arrow-right`). a11y: status by icon **and** text.

**CrossCertCard** — `components/site/cross-cert.tsx`  *(built: SecurityHubBody)*
- props: `certs[]`, `currentSlug`. mini bars for all 3 certs; current flagged "You are here" in brand.
  Makes the honest A+/Sec+ > Net+ story legible. states: current vs other; zero (Net+).

**SectionHub (cert-hub intro)** — `components/site/section-hub.tsx`  *(built: SecurityHubBody)*
- props: `cert{name,exam,covered,total,description}`. breadcrumb · h1 `text-3xl/600` + exam chip
  (badge outline, brand border, mono) · description `max-w-[68ch]` · overall CoverageBar + honest line.

**HomeHook** — `components/site/home-hook.tsx`  *(built: HomeBody)*
- mono kicker `text-brand uppercase` · h1 `text-4xl/600 text-balance` · lede `text-lg
  max-w-[72ch]` · `Button{primary}` + `Button{ghost}` · mono meta line. No hero illustration (brief).

**TOC** — `components/site/toc.tsx`  *(built: PostArticleBody)*
- props: `items{label,href,active}[]`. desktop sticky aside `top-[84px] border-l border-border`; item
  `pl-3.5 text-[13px]`; **active** `text-brand border-l-2 border-brand font-medium`. mobile →
  `<details>` "On this page". states active (scroll-spy, client) vs idle. a11y `nav aria-label` +
  `aria-current`.

**Prose (`.prose`)** — `components/site/prose.tsx`  *(built: Post + Project)* — **the reading surface**
- wrapper `max-w-[720px]` (~68ch); p `text-[17px] leading-[1.75] mb-5`; h2 `text-2xl/600 tracking-tight
  mt-10 scroll-mt-[90px]` + anchor `#` (`font-mono text-muted-foreground` hover `text-brand`); h3
  `text-xl/600`; lists `pl-[22px] leading-[1.7]`; inline code `font-mono text-[0.875em] bg-muted
  px-1.5 py-0.5 rounded-sm`; **code block** outer `border border-border rounded-lg`, header `bg-muted`
  (lang label + copy button), `pre bg-secondary p-4 font-mono text-[13.5px]` with Shiki tokens
  (`text-brand` keywords, `text-foreground` literals, `text-muted-foreground` comments); **table**
  `overflow-x-auto border border-border rounded-lg`, `thead bg-muted` mono-uppercase th, rows
  `border-t border-border`, positive deltas `text-brand`; **callout** `flex gap-3
  bg-[color-mix(brand 7% / card)] border-[color-mix(brand 25% / border)] rounded-lg p-4` + lucide icon
  `text-brand` (**no left-accent bar** — avoids the slop trope).
- states: code copy default/copied; table horizontal scroll on narrow.

**AtAGlanceCard** — `components/site/at-a-glance.tsx`  *(built: ProjectArticleBody)* — project variant
- props: `project{goal,stack[],duration,status,metrics[],repoUrl,demoUrl}`. label + status pill ·
  metric tiles (value `font-mono text-2xl text-brand`) · meta rows (mono keys) · repo `Button{primary}`
  + demo `Button{secondary}`. states: default; empty metrics → hide tiles. responsive: tiles+buttons wrap.

**PrevNext** — `components/site/prev-next.tsx`  *(built: Post + Project)*
- two Cards within current domain/series (← prev / next →); hover `border-brand`. responsive wrap.

**RelatedPosts** — `components/site/related-posts.tsx`  *(built: Post + Project)*
- 3 compact PostCards selected by shared tag/category.

**ArchiveList (domain/tag/type)** — `components/site/archive-list.tsx`  *(built: `ArchiveBody.dc.html`)*
- one component, three intro variants:
  - **domain** (`/[section]/[category]`): title + `<cert> · Domain x.0` + official-objective blurb +
    coverage indicator chip (`✓ Covered · N posts`).
  - **tag** (`/tags/[tag]`): `#tag` title (`font-mono text-brand`) + A+→Net+→Sec+ progression chips.
  - **type** (`/types/[type]`): brand-outline type chip + blurb.
- shared: result count (`font-mono`) + sort control; PostCard grid `flex-wrap basis-[330px]`.
- **states:** results · **empty** (dashed-border card, lucide `file`, message + "Browse all" link) ·
  **loading** (skeleton card grid) · error (toast via `sonner` + inline retry).

**SearchForm + results** — `components/site/search-form.tsx` (+ shadcn `command` for the ⌘K palette)
*(spec-complete; mockup pending)*
- input (lucide `search`, `bg-background border-input`) + **facets**: Section / Type / Tag as toggle
  chips (badge outline; selected `bg-brand/10 text-brand aria-pressed`) — desktop left rail, mobile
  `sheet`. results = vertical list of result rows (title + matched-snippet + PostMeta + type chip).
- **states:** results (count `font-mono`) · **empty** ("No results for '<q>'" + clear-filters + popular
  tags) · **loading** (skeleton rows) · initial (recent/popular). dev: client island (controlled
  input + facet state, debounced over a build-time JSON index — see Q3).

**JourneyTimeline + NowBlock** — `components/site/journey-timeline.tsx` · `now-block.tsx`
*(spec-complete; mockup pending)*
- **NowBlock**: card "Now" + current focus (studying cert, target exam date, hours/wk, next domain).
  `bg-card border-border rounded-lg`; label `font-mono text-brand uppercase`.
- **JourneyTimeline**: vertical rail (`border-l border-border`); milestone dots — filled `bg-brand`
  for passes/ships, hollow `border-border` for upcoming; each entry date (`font-mono text-xs`) + title
  + note. Below: weekly **journal** entries as compact PostCards (`type=journal`).
- states: populated; future/target (hollow dot, muted); loading skeleton rail.

**AboutIdentity** — `components/site/about.tsx`  *(spec-complete; mockup pending)*
- two-col (desktop): story prose (`.prose`, from-zero narrative) + identity card (Avatar + name/handle
  + GitHub/LinkedIn `Button`s + "currently / tools / certs-in-progress" facts). mobile stacks.
  Identity links **must match** the footer's (single source — see Q5).

### 1.4 Admin composite components (different visual register — utilitarian; spec-only)

> Admin is authenticated, denser, and plainer than the public site. Same tokens, more `table`/`form`
> primitives, less brand accent (brand reserved for primary actions + status). All spec-only this
> package — no mockups yet; flagged for a dedicated admin stage.

**PublishBar** — `components/admin/publish-bar.tsx` — sticky top action bar: status pill
(`draft` = secondary badge / `published` = brand badge) + `Save draft`(secondary) + `Publish`(primary)
+ `Preview`. states: clean/dirty (dirty → enabled Save + "Unsaved" hint), saving (loading), error (toast).

**PostEditor** — `components/admin/post-editor.tsx` — two-pane: Markdown `textarea` (left) + live
`.prose` preview (right); mobile = tabs (Write / Preview). Reuses **Prose** for the preview.

**MetadataPanel** — `components/admin/metadata-panel.tsx` — collapsible right rail: Section `select` →
Category `select` (filtered by section) → Type `select` → **TagInput** (multi, create-on-the-fly) →
Exam (auto, read-only) → Excerpt `textarea` → Cover `MediaPicker` drop-zone → Slug (auto, editable) →
Publish date. states: per-field default/focus/error; category disabled until section chosen.

**TagInput** — `components/admin/tag-input.tsx` — tokenized input (TagPill chips + remove `x`),
`command`-style suggestions, Enter-to-create. states: focus, suggestion-open, max, duplicate (error).

**MediaPicker** — `components/admin/media-picker.tsx` — drag-and-drop drop-zone + uploaded-image grid
(R2). states: idle / drag-over (`border-brand bg-brand/5`) / uploading (progress) / error.

**CoverageGaps** — `components/admin/coverage-gaps.tsx` — dashboard widget listing empty domains
("Security Architecture — 0 posts → write next"), each a link to a pre-filled new post. Reuses the
coverage data behind CoverageChecklist.

**Admin dashboard cards / posts table** — shadcn `card` + `table`: Drafts(2) / Published(17) /
This-week(1) stat cards; posts `table` filterable by status/section/type (row hover `bg-muted`,
status badge, row actions `dropdown-menu`). states: loading (skeleton rows), empty (no posts).

**Login** — `components/admin/login` (uses `card` + `input` + `label` + `button`): single-owner
email + password, no sign-up. states: default / invalid (error helper) / submitting.

---

## 2. Screen Index

> ✅ = visual mockup delivered · ✱ = spec-complete, mockup pending. Each links to its Handoff Spec.

### Public
| Screen | Route | Mockup | Component tree (top-level) | Handoff |
|---|---|---|---|---|
| Home | `/` | ✅ `StudyBlog Screens.dc.html` | SiteHeader · HomeHook · CoverageBar×3 · CertCard×3 · ProjectCard(featured) · PostCard×4 · SiteFooter | `Stage1-Handoff.md` |
| Cert hub | `/security-plus` (+ `/a-plus`, `/network-plus`) | ✅ `StudyBlog Screens.dc.html` | SiteHeader · SectionHub(+CoverageBar) · CoverageChecklist · PostCard×n · CrossCertCard · SiteFooter | `Stage1-Handoff.md` |
| Post page | `/posts/[slug]` | ✅ `StudyBlog Article.dc.html` | SiteHeader · PostMeta · cover · TOC · Prose · TagPill×n · PrevNext · RelatedPosts · SiteFooter | `Stage2-Handoff.md` |
| Project write-up | `/posts/[slug]` (type=project) | ✅ `StudyBlog Article.dc.html` | …Post page + AtAGlanceCard | `Stage2-Handoff.md` |
| Domain archive | `/[section]/[category]` | ✅ `ArchiveBody.dc.html` | SiteHeader · ArchiveList(domain) · SiteFooter | `Stage3-Handoff.md` |
| Tag hub | `/tags/[tag]` | ✅ `ArchiveBody.dc.html` | SiteHeader · ArchiveList(tag) · SiteFooter | `Stage3-Handoff.md` |
| Type archive | `/types/[type]` | ✅ `ArchiveBody.dc.html` | SiteHeader · ArchiveList(type) · SiteFooter | `Stage3-Handoff.md` |
| Projects | `/projects` | ✅ `ProjectsBody.dc.html` | SiteHeader · ProjectCard×n · SiteFooter | `Stage3-Handoff.md` |
| Journey | `/journey` | ✅ `JourneyBody.dc.html` | SiteHeader · NowBlock · JourneyTimeline · journal PostCard×n · SiteFooter | `Stage3-Handoff.md` |
| About | `/about` | ✅ `AboutBody.dc.html` | SiteHeader · Prose(story) · AboutIdentity · SiteFooter | `Stage3-Handoff.md` |
| Search | `/search` | ✅ `SearchBody.dc.html` | SiteHeader · SearchInput · SearchFacets · result rows · SiteFooter | `Stage3-Handoff.md` |

### Admin (denser register — built; mockup `StudyBlog Admin.dc.html`)
| Screen | Route | Mockup | Component tree |
|---|---|---|---|
| Login | `/login` | ✅ | LoginCard (Card · Input×2 · Button) · default + error states |
| Dashboard | `/admin` | ✅ | AdminShell · StatCard×3 · RecentPosts · CoverageGaps |
| Posts list | `/admin/posts` | ✅ | AdminShell · FilterBar · PostsTable · dropdown-menu actions |
| Editor | `/admin/posts/new` · `/admin/posts/[id]/edit` | ✅ | AdminShell · PublishBar · MarkdownEditor · LivePreview(Prose) · MetadataPanel(TagInput, MediaPicker) · draft+published |
| Media | `/admin/media` | ✅ | AdminShell · MediaPicker · MediaGrid |

Full admin specs: `Stage4-Handoff.md` + Component Library `Component-Library-Sheet.md` §25–§33.

---

## 3. Build order (grouped to build phases)

**Phase A — Shared layout + design system (unblocks everything)**
1. Tokens + `globals.css` (already shipped) → `next/font` Inter + JetBrains Mono → ThemeProvider
   (`.dark` class + toggle).
2. shadcn primitives (§1.1) installed.
3. `SiteHeader`, `SiteFooter` → app `layout.tsx`. *(deps: ThemeProvider, primitives)*
4. Leaf components: `PostMeta`, `TypeChip`/`badge`, `TagPill`, `CoverageBar`, `CoverageChecklist`.
   *(deps: primitives only)*

**Phase B — Public reading pages**
5. `PostCard`, `ProjectCard`, `CertCard` *(dep: PostMeta, TypeChip, CoverageBar)*.
6. `Prose` + `TOC` + `PrevNext` + `RelatedPosts` → **Post page** *(dep: §A, PostCard)*.
7. `AtAGlanceCard` → **Project write-up** (type switch on Post page).
8. `HomeHook` + `CrossCertCard` + `SectionHub` → **Home** and **Cert hub** *(dep: CoverageBar/Checklist,
   CertCard, PostCard, ProjectCard)*.

**Phase C — Archives & discovery**
9. `ArchiveList` (domain/tag/type variants, incl. empty/loading) → the 3 archive routes
   *(dep: PostCard)*.
10. `Projects` index *(dep: ProjectCard)*; `JourneyTimeline` + `NowBlock` → **Journey**; **About**
    (`Prose` + `AboutIdentity`).
11. `SearchForm` + results + `command` palette → **Search** *(dep: build-time index, PostCard)*.

**Phase D — Admin (separate register)**
12. `Login` → auth.
13. Dashboard (stat cards + `CoverageGaps` + posts table) *(dep: coverage data)*.
14. `PostEditor` + `MetadataPanel` + `TagInput` + `MediaPicker` + `PublishBar` → editor
    *(dep: Prose for preview, R2 for media)*.
15. Posts list table · Media grid.

**Cross-phase dependencies:** Prose is reused by both the Post page and the admin editor preview —
build it once in Phase B. CoverageBar/Checklist data feeds Home, cert hubs, and admin CoverageGaps —
centralize the coverage computation (Q1).

---

## 4. Token / Primitive audit

**Result: PASS.** Every screen uses only the `design-tokens.md` tokens (referenced by Tailwind class)
and the named shadcn primitives. Both light + dark are specified throughout (single `.dark` flip; no
hard-coded colors in components).

**Verified token usage:** all surfaces `bg-background`/`bg-card`/`bg-muted`/`bg-secondary`; all text
`text-foreground`/`text-muted-foreground`; accent strictly `--brand` (links, active nav, focus rings,
coverage fills, key metrics); data-viz `--brand` + `--chart-*`; borders `border-border`/`border-input`;
radii from the `--radius` scale; fonts Inter + JetBrains Mono only.

**New items introduced (add to the system deliberately):**
1. **`--brand` tint utilities** — used `bg-brand/10` (active nav, selected facets) and
   `color-mix(in oklch, var(--brand) 7%/25%, …)` for the prose **callout** background/border. These
   are derived from `--brand`, not new colors. *Recommendation:* add `--brand-subtle` (≈ brand @ 8%)
   and `--brand-border` (≈ brand @ 25%) tokens so callouts/active states don't rely on inline
   `color-mix`. Until then, Tailwind `/opacity` on `bg-brand`/`border-brand` is the fallback.
2. **Status colors via `--chart-2`** — "Shipped" status dot uses `--chart-2` (the green ramp slot),
   not a new token. In-progress uses `text-muted-foreground`. *Confirm `--chart-2` is the intended
   "success" hue, or add a semantic `--success` if status will recur.*
3. **Skeleton pulse + coverage grow-in** keyframes — `animate-pulse` is built into Tailwind; the
   coverage grow-in is a one-off `scaleX` keyframe. *Add a single `@keyframes coverage-grow` to
   globals; gate both with `motion-reduce`.*
4. **Device/browser chrome** in the mockups (phone bezel, traffic-light bar) is **artifact-only** — it
   is NOT part of the product and uses throwaway neutrals. Do not implement.
5. **No new fonts, no arbitrary hex, no bespoke CSS files** were introduced anywhere. ✅

---

## 5. Open questions / decisions for the developer

1. **Coverage source of truth** — compute domain→post coverage at build time from MDX frontmatter
   (`section`/`category`)? This keeps `CoverageBar`/`CoverageChecklist`/`CoverageGaps` pure Server
   Components. *(Recommended.)*
2. **Syntax highlighting** — Shiki at build time (RSC-friendly, zero client JS, matches the mocked
   token spans) vs a client highlighter. *(Recommend Shiki.)*
3. **Search** — client-side index over a generated JSON (debounced) vs a server route; and do we ship
   both the `/search` page **and** a `command` (⌘K) palette? *(Recommend JSON index + both surfaces.)*
4. **Images / R2** — confirm `next/image` loader + remote pattern for the R2 bucket; canonical cover
   aspect ratio (proposing **16:9**, rendered 16:7 on the post header). Alt text required everywhere.
5. **Identity links single-source** — GitHub/LinkedIn/RSS appear in SiteFooter and AboutIdentity;
   store once (site config) and import in both. Confirm the RSS feed is in scope for v1.
6. **Brand-tint tokens** — adopt `--brand-subtle` / `--brand-border` (audit §4.1) so callouts +
   active states are token-named rather than inline `color-mix`?
7. **Latest-posts counts** — Home shows 4, cert hub 5; archives paginate at? Set constants.
8. **TOC depth** — h2 only (current) or h2 + h3 (one indent level)?
9. **Reduced motion** — confirm global `motion-reduce` strategy (mockups disable coverage grow-in +
   skeleton pulse under `prefers-reduced-motion`).
10. **Admin auth** — single-owner credentials store / session strategy (out of design scope, flagged
    so the editor + login wire up cleanly).

---

*Handoff package v1.0 · consolidates Stage 0–3. Public reading pages, cert hubs, articles, archives,
and projects are delivered as visual Design Components; Journey / About / Search and the full admin
register are spec-complete here and queued for their mockups. Everything above is token-named, mapped
to shadcn primitives + target file paths, and specified in light + dark.*
