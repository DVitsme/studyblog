# StudyBlog — Component Library Sheet · v5 (Stage 3 complete)

> **Changelog** — v5: promoted the last public composites to built — §35 NowBlock, §36 JourneyTimeline,
> §37 AboutIdentity, §38 SearchFacets/SearchInput (ArchiveList §34 already built). Every screen in the
> product now has a delivered mockup. v4 (Stage 4): admin register §25–§33. v3 (Stage 2): §19–§24.
> v2 (Stage 1): §15–§18. v1 (Stage 0): §1–§14.

> One spec per reusable component: **variants · props · token/Tailwind classes · all states · shadcn
> primitive and/or target file path**. Screen handoff blocks reference these by name instead of
> re-specifying. Extended each stage; this is the Stage-0 baseline (foundations + public kit).
>
> **Token rule:** every class below is a real Tailwind token class from `design-tokens.md` — no
> arbitrary values. Both themes covered by the `.dark` class strategy (no per-component dark code
> beyond the semantic tokens, which already flip).

**Conventions used in this sheet**
- Radius: `rounded-sm` = radius−4 · `rounded-md` = radius−2 · `rounded-lg` = radius (0.625rem) ·
  `rounded-xl` = radius+4. Buttons/inputs default `rounded-md`; cards `rounded-lg`.
- Focus (all interactive): `outline-none focus-visible:ring-2 focus-visible:ring-brand
  focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
- Fonts: `font-sans` (Inter) everywhere except code, dates/reading-time chips, type badges, and small
  technical labels → `font-mono` (JetBrains Mono).

---

## 1. Button — `shadcn: button` · `components/ui/button.tsx`
**Variants:** `primary` (default) · `secondary` · `ghost` · `link`.
**Props:** `variant: 'primary'|'secondary'|'ghost'|'link'` · `size: 'sm'|'default'|'icon'` ·
`disabled?` · `asChild?`.
**Tokens/classes:**
- primary → `bg-primary text-primary-foreground rounded-md h-9 px-4 text-sm font-medium`
- secondary → `bg-secondary text-secondary-foreground border border-border rounded-md h-9 px-4`
- ghost → `bg-transparent text-foreground rounded-md h-9 px-3`
- link → `text-brand underline-offset-4 hover:underline` (used for inline links)
- icon → `h-9 w-9 p-0`
**States:** default · hover (`primary hover:opacity-90`, `secondary/ghost hover:bg-accent`) ·
focus (brand ring) · active · disabled (`opacity-50 pointer-events-none`) · loading (spinner +
`disabled`).
**Responsive:** unchanged; icon-only variant used in tight headers on `sm`.

## 2. Badge — `shadcn: badge` · `components/ui/badge.tsx`
**Variants:** `default` · `secondary` · `outline` · `brand` · `destructive`.
**Props:** `variant`.
**Tokens/classes:** `rounded-full text-xs font-semibold px-2.5 py-0.5`; default `bg-primary
text-primary-foreground` · secondary `bg-secondary text-secondary-foreground` · outline
`border border-border text-foreground` · brand `bg-brand text-brand-foreground` · destructive
`bg-destructive text-white`.
**States:** static (non-interactive); when used as a filter toggle, add focus ring + `aria-pressed`.

## 3. Type chip (post type) — `shadcn: badge (outline)` · used in `post-card.tsx` / `post-meta.tsx`
**Purpose:** the post **type** axis as a mono chip. Values: `concept · cram · lab · troubleshooting ·
practice-exam · study-guide · journal · project · resources`.
**Tokens/classes:** `font-mono text-xs font-medium px-2 py-0.5 rounded-sm border border-border
text-muted-foreground bg-background`. Restrained — monochrome, not color-coded (credibility over
flash).
**States:** static; clickable on archives → links to `/types/[type]` (hover `text-brand`).

## 4. Tag pill — `NEW: components/site/tag-pill.tsx`
**Props:** `tag: string` · `href`.
**Tokens/classes:** `font-mono text-xs px-2.5 py-1 rounded-full bg-secondary
text-secondary-foreground`, rendered as `#tag`.
**States:** default · hover (`bg-accent text-brand`) · focus (brand ring). Links to `/tags/[tag]`.

## 5. Input / Select / Textarea — `shadcn: input · select · textarea`
**Tokens/classes (shared):** `bg-background border border-input rounded-md text-sm text-foreground
h-9 px-3` (textarea: `min-h-16 py-2`, no fixed height). Placeholder `text-muted-foreground`.
**Input with leading icon:** lucide `search` at `text-muted-foreground` (used by `search-form`).
**Select:** trigger as above + lucide `chevron-down`; menu = `popover` surface (raised elevation).
**States:** default · focus (brand ring) · disabled (`opacity-50`) · invalid (`border-destructive`,
error text `text-destructive text-sm`).
**Responsive:** full-width within form column on `sm`.

## 6. Tabs — `shadcn: tabs` (Radix)
**Props:** `defaultValue` · `value` · list of `{value,label}`.
**Tokens/classes:** list = `bg-muted rounded-md p-1`; trigger active = `bg-background text-foreground
shadow-sm rounded-sm`; idle = `text-muted-foreground`. `text-sm font-medium px-3 py-1.5`.
**States:** active · inactive · hover · focus (brand ring); keyboard nav via Radix.

## 7. Card — `shadcn: card` · `components/ui/card.tsx`
**Tokens/classes:** `bg-card text-card-foreground border border-border rounded-lg`. Padding `p-5`/`p-6`.
**Elevation:** flat + hairline by default; **raised** (`shadow-sm`/`shadow-md`) reserved for
popover/dropdown/dialog/command only — never resting cards.
**Slots:** header / title (`text-lg font-semibold tracking-tight`) / description
(`text-sm text-muted-foreground`) / content / footer.

## 8. PostCard — `components/site/post-card.tsx`
**Props:** `post: { type, section, category, title, excerpt, publishedAt, readingTime, slug }` ·
`featured?: boolean`.
**Composition:** Card › [Type chip + crumb `section · category` (`text-xs text-muted-foreground`)] ·
title (`text-lg font-semibold tracking-tight text-balance`) · excerpt
(`text-sm text-muted-foreground`, clamp 2–3) · PostMeta footer.
**Tokens/classes:** `bg-card border border-border rounded-lg p-4/5`; hover `border-brand`.
**States:** default · hover (border→brand, whole card is the link) · focus (brand ring) ·
loading (`skeleton`) · `featured` = wider span + larger title.
**Responsive:** grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap-4`.
**Data:** all four content axes; meta from `publishedAt`/`updatedAt`/`readingTime`.

## 9. PostMeta — `components/site/post-meta.tsx`
**Tokens/classes:** `font-mono text-xs text-muted-foreground`, dot-separated:
`Published <date> · <n> min read` (or `Updated <date> · reference`). Type chip optional inline.
**States:** static.

## 10. ProjectCard — `components/site/project-card.tsx`
**Props:** `project: { …post, goal, stack[], duration, status, metrics[], repoUrl, demoUrl }`.
**Composition:** Card › [type chip `project` (brand outline) + crumb + status dot] · title
(`text-xl/2xl font-semibold`) · excerpt · **at-a-glance metric grid** (`grid-cols-3 gap-2.5`, each a
bordered cell: value `font-mono text-2xl font-semibold text-brand`, label
`text-xs text-muted-foreground`) · link row (repo / demo as `secondary` buttons + lucide
`external-link`). Status dot uses `--chart-2` for "Shipped".
**States:** default · hover · focus · loading (skeleton) · empty (no metrics → hide grid).
**Responsive:** metric grid `grid-cols-3` desktop → `grid-cols-1` on `sm`; links stack.
**Data:** the project sample's at-a-glance fields.

## 11. CoverageBar — `components/site/coverage-bar.tsx`  *(signature)*
**Props:** `cert: { name, exam, covered, total }` (→ `pct = covered/total`).
**Composition:** label row [`name` `text-base font-semibold` + `exam` `font-mono text-xs
text-muted-foreground`] ↔ [`<covered> of <total> domains` `text-sm text-muted-foreground` +
`<pct>%` `font-mono text-base font-semibold text-brand`] · track + fill · optional note.
**Tokens/classes:** track `bg-muted rounded-full h-2`; fill `bg-brand rounded-full` width = pct;
0% renders track only + note (`text-xs text-muted-foreground`, e.g. "Just started").
**shadcn:** may wrap `progress` (Radix) or be a plain div pair; either way brand fill.
**States:** populated · zero/empty (note) · loading (skeleton track). Motion: subtle grow-in,
disabled under `prefers-reduced-motion`.
**A11y:** `role="progressbar"` + `aria-valuenow/min/max`; never color-only — % label always present.

## 12. CoverageChecklist — `components/site/coverage-checklist.tsx`  *(signature)*
**Props:** `domains: { domain, postCount, done }[]` · `exam`.
**Composition:** header [title + `exam` mono + "x of y domains · z%"] · rows: status icon
(done = lucide `check` in a `bg-brand text-brand-foreground` filled circle; empty = hollow circle
`border-border`) + domain name (`text-sm`; empty = `text-muted-foreground`) + post count
(`font-mono text-xs text-muted-foreground`), `border-b border-border` between rows.
**States:** done row · empty row · all-empty (cert just started) · loading (skeleton rows).
**A11y:** status conveyed by icon + text, not color alone.

## 13. SiteHeader — `components/site/site-header.tsx`
**Composition:** wordmark `study` + `blog` (brand) in `font-mono font-semibold` · nav (A+,
Security+, Network+, Journey, Projects, About) · search button (lucide `search`) · theme toggle
(lucide `sun`/`moon`).
**Tokens/classes:** `bg-card border-b border-border`; nav item `text-sm text-muted-foreground
rounded-sm px-2.5 py-1.5`; **active** = `text-brand bg-brand/10 font-medium`.
**States:** nav default/hover/active · focus rings · sticky on scroll
(`bg-background/85 backdrop-blur`).
**Responsive:** full nav `md+`; on `sm` collapses to wordmark + search + menu (lucide `menu`) →
opens `sheet`.
**Dev notes:** Client island (theme toggle, mobile `sheet`, search trigger); rest server-rendered.

## 14. SiteFooter — `components/site/site-footer.tsx`
**Composition:** wordmark + one-line mission · identity links (GitHub, LinkedIn, RSS) in
`font-mono text-sm text-muted-foreground` (hover `text-brand`).
**Tokens/classes:** `bg-card border-t border-border`. **States:** link hover/focus.
**Responsive:** row on desktop → stacked on `sm`.

---

## 15. CertCard — `NEW: components/site/cert-card.tsx`  *(Stage 1)*
**Purpose:** navigational summary card per cert on Home. **Props:** `cert: { name, exam, covered,
total, postCount, href }` (→ `pct`).
**Composition:** name (`text-base/600`) + exam (`font-mono text-xs muted`) · big `pct`
(`font-mono text-3xl/600 text-brand`) + `covered of total domains` · thin 4px progress line
(`bg-muted` track, `bg-brand` fill) · footer: post count (`font-mono text-xs muted`) + `Explore`
(`text-brand` + `arrow-right`).
**Tokens/classes:** `bg-card border border-border rounded-lg p-[18px]`; hover `border-brand`. Whole
card is the link to the cert hub.
**States:** default · hover (border→brand) · focus (brand ring) · zero (`postCount=0` → "No posts
yet", fill width 0) · loading (skeleton).
**Responsive:** `flex-1 basis-60` in a wrap row → 3-up `lg`, 1-up `sm`.

## 16. CrossCertCard — `NEW: components/site/cross-cert.tsx`  *(Stage 1)*
**Purpose:** honest at-a-glance of all three certs (sidebar on a cert hub); flags the current cert
"You are here". **Props:** `certs: {name,covered,total}[]` · `currentSlug`.
**Composition:** title + caption · per cert: name (`text-sm`; current `font-medium text-foreground`,
others `muted`) + `%` (`font-mono text-brand`) + 6px bar (`bg-muted`/`bg-brand`) + tag
(`text-xs`; current `text-brand` "You are here · x of y", others muted).
**Tokens/classes:** `bg-card border border-border rounded-lg p-5`.
**States:** current vs other rows · zero (Net+ → "Just started · 0 of 5"). Static.

## 17. HomeHook — `NEW: components/site/home-hook.tsx`  *(Stage 1)*
**Purpose:** the from-zero hook on Home (no hero illustration). **Props:** static / CMS singleton.
**Composition:** mono kicker (`text-brand uppercase`) · h1 (`text-4xl/600 tracking-tight
text-balance`) · lede (`text-lg muted`, `max-w-[72ch]`) · `Button{primary}` + `Button{ghost}` w/
`arrow-right` · mono meta line (started / post count / current focus).
**States:** button hover/focus. **Responsive:** buttons wrap `sm`.

## 18. SectionHub (Intro) — `components/site/section-hub.tsx`  *(Stage 1)*
**Purpose:** cert-hub intro header. **Props:** `cert: {name, exam, covered, total, description}`.
**Composition:** breadcrumb (`font-mono text-xs`) · h1 (`text-3xl/600`) + exam chip (`badge outline`,
brand border, mono) · description (`text-[17px] muted max-w-[68ch]`) · overall **CoverageBar** in a
Card + honest one-liner.
**States:** populated / skeleton. **Responsive:** title row wraps `sm`.

## lucide icons used so far
`search` · `sun` · `moon` · `menu` · `chevron-down` · `arrow-right` · `arrow-left` · `check` ·
`circle` · `external-link` · `copy` · `link` · `lightbulb` · `info` · `alert-circle` · `play` ·
`github` (inline glyph).

---

## 19. Prose (`.prose`) — `components/site/prose.tsx`  *(Stage 2 · the reading surface)*
**Purpose:** rendered-Markdown container; the core reading experience. **Props:** `children` (MDX).
**Measure & rhythm:** wrapped in `max-w-[720px]` (~68ch); body `text-[17px] leading-[1.75]
text-foreground`, paragraphs `mb-5`.
**Element specs (token-named):**
- **p** — `text-[17px] leading-[1.75] mb-5`.
- **h2** — `text-2xl/600 tracking-tight mt-10 mb-3.5 scroll-mt-[90px]`, with a leading anchor
  `<a href=#id>` — `font-mono text-muted-foreground` hover `text-brand` (the `#`). h3 — `text-xl/600
  mt-7 mb-2.5`.
- **ul/ol** — `pl-[22px] leading-[1.7]`, `li mb-2`.
- **inline code** — `font-mono text-[0.875em] bg-muted px-1.5 py-0.5 rounded-sm`.
- **code block** — outer `border border-border rounded-lg overflow-hidden`; header bar `bg-muted
  border-b border-border` (lang label `font-mono text-xs muted` + **copy button**); `pre bg-secondary
  p-4 overflow-x-auto`, `font-mono text-[13.5px] leading-[1.75]`. **Highlighting** via Shiki at build:
  keywords/commands `text-brand`, literals `text-foreground`, comments `text-muted-foreground`.
- **table** — `overflow-x-auto border border-border rounded-lg`; `thead bg-muted` th `font-mono
  text-[11px] uppercase tracking-wide muted`; rows `border-t border-border`; numeric cells `font-mono`,
  positive deltas `text-brand`.
- **callout/aside** — `flex gap-3 bg-[color-mix(brand 7%/card)] border border-[color-mix(brand
  25%/border)] rounded-lg p-4`, lucide icon in `text-brand`. **No left-accent bar** (deliberately
  avoids the rounded-card-with-left-border trope).
**States:** code copy default/copied; table scroll on narrow; links hover `text-brand`.
**A11y:** semantic heading order; anchor ids; `prefers-reduced-motion`; copy button `aria-label`.

## 20. AtAGlanceCard — `NEW: components/site/at-a-glance.tsx`  *(Stage 2 · project variant)*
**Purpose:** scannable proof-of-work summary at the top of a `type=project` post — the interview
centerpiece. **Props:** `project:{ goal, stack[], duration, status, metrics:{value,label}[], repoUrl,
demoUrl }`.
**Composition:** header ["AT A GLANCE" `font-mono text-xs uppercase muted` + status pill (`--chart-2`
dot)] · **key-metric tiles** (`flex-wrap`, each `flex-1 basis-[150px] border border-border
rounded-md p-3.5`, value `font-mono text-2xl/600 text-brand`, label `text-xs muted`) · meta rows
(Goal / Stack / Duration; key `font-mono text-[11px] uppercase flex-[0_0_76px]`, value `text-sm`) ·
buttons: repo `Button{primary}` + github glyph, demo `Button{secondary}` + `play`.
**Tokens/classes:** Card `bg-card border-border rounded-lg p-[22px]`.
**States:** default; metrics empty → hide tile row; button hover/focus.
**Responsive:** metric tiles + buttons wrap on `sm`.

## 21. TOC — `components/site/toc.tsx`  *(Stage 2)*
**Props:** `items:{label,href,active}[]`. **Desktop:** sticky aside `top-[84px]`, `border-l
border-border`; item `pl-3.5 text-[13px]`; active `text-brand border-l-2 border-brand font-medium`.
**Mobile:** `<details>` "On this page" disclosure above prose.
**States:** active (scroll-spy, client) vs idle. **A11y:** `<nav aria-label>`, `aria-current` on active.

## 22. PostMeta — `components/site/post-meta.tsx`  *(promoted from §9)*
Mono chip row: type chip + `Published <date>` / `Updated <date>` + `· <n> min read` (or `reference`).
`font-mono text-xs text-muted-foreground`. Used on post header, cards, project header.

## 23. PrevNext — `components/site/prev-next.tsx`  *(Stage 2)*
Two Cards within the current domain/series (← prev / next →). `flex-wrap basis-60`; label `font-mono
text-[11px] muted`, title `text-[15px]/600`; next is right-aligned. Hover `border-brand`.

## 24. RelatedPosts — `components/site/related-posts.tsx`  *(Stage 2)*
3 compact `post-card`s (`flex-wrap basis-[200px]`): type chip + title + mono meta. Selected by shared
tag/category.

## Not yet specified (added in later stages)
`journey-timeline` · `now-block` · `about` identity · `search-form` (full page facets) — spec'd in
`DESIGN-HANDOFF.md` §1.3, mockups pending.

---

## ADMIN REGISTER (Stage 4)

> Denser, utilitarian; same tokens. **Brand reserved for primary actions, active nav, and status
> only.** Flat + hairline surfaces; raised shadow only on `dropdown-menu`/`dialog`/`sheet`. All
> client/server boundaries flagged. Mockup: `StudyBlog Admin.dc.html`.

## 25. AdminShell (sidebar) — `components/admin/admin-shell.tsx`  *(built)*
**Props:** `active:'dashboard'|'posts'|'media'`, `children`/page-header (slotted in code).
**Composition:** wordmark + "admin" pill · nav (Dashboard / Posts`19` / Media) active `text-brand
bg-brand/10` + lucide icon brand-tinted · "View live site" · owner avatar + Sign out (lucide
`log-out`). `flex-[0_0_224px] bg-card border-r border-border`.
**Mobile:** sidebar → sticky topbar (wordmark + `menu` → `sheet` drawer holding the nav).
**States:** nav active/idle/hover; focus rings.

## 26. PublishBar — `components/admin/publish-bar.tsx`  *(built)*
**Props:** `status:'draft'|'published'`, `dirty?`, `saving?`.
**Composition:** back btn · StatusPill + saved-state mono label · right: `Preview`(ghost) + `Save
draft`(secondary) + primary (`Publish` if draft / `Update` if published). sticky `bg-background/90
backdrop-blur border-b border-border`.
**States:** clean / dirty (Save enabled + "Unsaved") / saving (spinner, disabled) / error (`sonner`).

## 27. MarkdownEditor — `components/admin/post-editor.tsx`  *(built)*
Title `input` (borderless 22px/600) + mono format toolbar (H/B/I/link/code/list, `hover:bg-accent`) +
monospace `textarea` (`font-mono text-sm leading-[1.7]`, borderless). Desktop pane `flex-1 border-r`.
**Live preview** sibling renders **Prose** (§19) from the MDX — preview === published output.
**Dev:** **client** (controlled body + debounced preview).

## 28. MetadataPanel — `components/admin/metadata-panel.tsx`  *(built)*
Collapsible right rail (`flex-[0_0_296px] bg-card`). Fields in order: **Section** `select` →
**Category** `select` (filtered by section; disabled until section) → **Type** `select` (mono value) →
**TagInput** (§29) → **Exam** (auto, read-only dashed `bg-muted` field) → **Excerpt** `textarea` →
**Cover** MediaPicker drop-zone (§32; 16:9, R2) → **Slug** (auto, editable, mono) → **Publish date**
(`calendar`). field label `text-xs/500 muted`; control `h-[34px] border-input rounded-md`.
**States:** per-field default/focus/error; category disabled-until-section. **Mobile:** "Details" tab.

## 29. TagInput — `components/admin/tag-input.tsx`  *(built)*
Tokenized field: TagPill chips (`#tag` + remove `x`) + inline mono `input`; Enter-to-create,
autocomplete over existing tags. `border-input rounded-md`, wraps.
**States:** focus, suggestion-open, duplicate/max (error). **Dev:** **client**.

## 30. CoverageGaps — `components/admin/coverage-gaps.tsx`  *(built)*
Dashboard widget: empty domains as "write next" rows (hollow circle + domain + cert + `Write →`
brand). Inverse of CoverageChecklist data. row hover `bg-accent`. **States:** populated / all-covered
(empty celebratory) / loading.

## 31. StatusPill — `components/admin/status-pill.tsx`  *(built)*
`published` = `bg-brand/14 text-brand`; `draft` = `bg-muted text-muted-foreground`. `font-mono
text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full`. Used in dashboard, posts
table, publish bar.

## 32. MediaPicker — `components/admin/media-picker.tsx`  *(built)*
Drop-zone: dashed `border-border` panel, lucide `upload` in `bg-brand/10` circle, label + format/size
hint. **States:** idle · **drag-over** (`border-brand bg-brand/5`) · uploading (progress) · error
(toast). Two forms: full panel (Media page) + compact (cover field in MetadataPanel). **Dev:** **client**.

## 33. PostsTable + StatCard + MediaGrid  *(built)*
- **PostsTable** — `components/admin/posts-table.tsx` (shadcn `table`): cols Title / Status (StatusPill)
  / Section / Type (mono TypeChip) / Date / actions (`more-vertical` → `dropdown-menu`: Edit /
  Duplicate / View / Delete). `thead bg-muted` mono-uppercase; rows `border-t hover:bg-accent`.
  states: results / loading (skeleton) / empty. mobile → stacked Cards. **Dev:** filters + row menu client.
- **StatCard** — `components/admin/stat-card.tsx`: mono-uppercase label + lucide icon + value
  (`font-mono text-3xl`) + sub. `flex-wrap basis-[200px]`.
- **MediaGrid** — `components/admin/media-grid.tsx`: `auto-fill minmax(190px,1fr)` (mobile 2-col)
  tiles `aspect-[4/3]` + filename/dims/size (mono) + hover overlay (Copy URL / Delete). **Dev:** client.

## 34. ArchiveList (domain/tag/type) — `components/site/archive-list.tsx`  *(built Stage 3)*
One component, three intro variants (domain: objective blurb + coverage chip; tag: `#tag` +
A+→Net+→Sec+ progression; type: brand-outline type chip) + result count/sort + PostCard grid.
**States:** results / **empty** (dashed card + "Browse all") / **loading** (skeleton grid) / error
(`sonner` + retry).

## 35. NowBlock — `components/site/now-block.tsx`  *(built Stage 3)*
**Purpose:** current-focus card on Journey. **Props:** `now:{ focus, detail, stats:{value,label}[] }`.
**Composition:** pulse-dot + "NOW" label (`font-mono text-brand uppercase`) · focus h2
(`text-lg/600`) + detail paragraph · inline stats row (value `font-mono text-2xl/600 text-brand` +
label `text-xs muted`). Card `bg-card border-border rounded-lg p-[22px]`.
**States:** static. **Responsive:** detail + stats wrap on `sm`.

## 36. JourneyTimeline — `components/site/journey-timeline.tsx`  *(built Stage 3)*
**Purpose:** milestone rail (exam passes, ships, starts, target). **Props:**
`milestones:{date,tag,kind:'pass'|'ship'|'start'|'target',title,note,done}[]`.
**Composition:** vertical rail `border-l border-border pl-7`; each item = **dot** (filled `bg-brand`
for done; hollow `border-border` for target/future) + date (mono) + **tag pill** (target = dashed
border muted; ship = `--chart-2` tint; pass/start = brand/muted) + title (`text-[17px]/600`; future =
muted) + note. Newest-first.
**States:** done vs target/future (hollow dot, muted title); loading (skeleton rail). **A11y:** ordered
list; dot state echoed in tag text (not color-only).

## 37. AboutIdentity — `components/site/about.tsx`  *(built Stage 3)*
**Purpose:** sticky identity rail on About. **Props:** `identity:{ name, handle, links:{label,href}[],
facts:{k,v}[] }`.
**Composition:** avatar (initials on `bg-secondary`) + name + handle · **link rows** (GitHub / LinkedIn
/ RSS as bordered `h-9` rows + glyph + `external-link`, hover `border-brand text-brand`) · **Quick
facts** card (mono-uppercase keys `flex-[0_0_84px]` + values). Links **must match SiteFooter** (single
site-config source). **Responsive:** sticky `top-20` desktop; stacks under story on `sm`.

## 38. SearchInput + SearchFacets — `components/site/search-form.tsx`  *(built Stage 3)*
**SearchInput:** large `input` (`h-[46px]`, lucide `search`, `esc` hint, brand focus ring).
**SearchFacets:** Section / Type / Tag groups of **toggle chips** (`font-mono text-xs` pills; selected
`bg-brand/12 text-brand border-[brand 30%]` + `aria-pressed`, idle `border-border muted`).
**Results:** rows `bg-card border-border rounded-lg p-4` (type chip + crumb + date + title + matched
snippet). **States:** results (count mono + active-filter count) / **empty** ("No results for '<q>'" +
clear + popular tags) / **loading** (skeleton rows) / initial (recent/popular).
**Dev:** **client island** — debounced controlled input + facet state over a build-time JSON index;
facets reflect to URL params; optional ⌘K `command` palette shares the index.

---
*v5 — Stage 3 complete · + NowBlock, JourneyTimeline, AboutIdentity, SearchInput/Facets. **All
product screens now have delivered mockups** (public reading + cert hubs + articles + archives +
projects + journey + about + search + full admin). Component library is feature-complete for v1;
append only for net-new features.*
