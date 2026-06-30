# StudyBlog — Stage 2 Handoff Specs (Post page + Project write-up)

> Per-screen blocks in the exact format from `components-tech-and-handoff-spec.md`. Components
> referenced by name; full specs in `Component-Library-Sheet.md` (v3). Token-named, no arbitrary
> values. Both themes via `.dark`; both breakpoints noted per element.

---

### Screen: Post page  (route: /posts/[slug])
- **Layout:** SiteHeader (sticky) → `<div max-w-[1040px] mx-auto px-5 pt-7 pb-14 flex gap-12
  items-start>` → `<article flex-1 min-w-0 max-w-[720px]>` + sticky `<aside flex-[0_0_200px]
  sticky top-[84px]>` (TOC). SiteFooter. On `sm`/`md` the aside is hidden and an inline collapsible
  "On this page" (`<details>`) appears above the prose.
- **Component tree:**
  - **SiteHeader** — `active:'a-plus'`.
  - **Article header** — breadcrumb (`font-mono text-xs`, current `text-foreground`); **PostMeta**
    (`post-meta.tsx`: type chip + `Published <date>` + `· <n> min read`, all `font-mono text-xs
    muted`); h1 `text-4xl/600 tracking-tight text-balance`; lede `text-lg muted`; **cover**
    (`aspect-[16/7] rounded-lg border border-border`, `next/image` from R2, alt required).
  - **TOC** → `components/site/toc.tsx`. props: `items:{label,href,active}[]`. tokens: container
    `border-l border-border`; item `pl-3.5 text-[13px]`; **active** `text-brand border-l-2
    border-brand font-medium`. states: active vs idle; scroll-spy updates active (client). responsive:
    desktop sticky aside; `sm`/`md` → `<details>` disclosure inline. a11y: `<nav aria-label="On this
    page">`, current `aria-current`.
  - **Prose** → `components/site/prose.tsx` (`.prose`) — see Library §19. Renders MDX: paragraphs,
    h2/h3 with anchor links, ordered/unordered lists, inline `code`, fenced **code blocks** (header
    bar w/ lang label + copy button, `bg-secondary`, mono 13.5px, token-colored via `--brand` /
    `--foreground` / `--muted-foreground`), **tables** (overflow-x wrap, `bg-muted` mono uppercase
    th, `border-t border-border` rows), **callout/aside** (brand-tinted `bg`, brand `border`, lucide
    icon — no left-bar). states: code copy default/copied; table horizontal scroll on `sm`.
  - **Tags** → `tag-pill.tsx` ×n, above a `border-t`.
  - **PrevNext** → `components/site/prev-next.tsx`: two Cards (← prev / next →) within the domain.
    responsive `flex-wrap basis-60`. states: hover `border-brand`.
  - **RelatedPosts** → `components/site/related-posts.tsx`: 3 compact `post-card`s, `flex-wrap
    basis-[200px]`.
  - **SiteFooter**.
- **Typography:** h1 Inter `text-4xl/600`; prose h2 `text-2xl/600`, h3 `text-xl/600`; body Inter
  `text-[17px] leading-[1.75]`; lede `text-lg`; code / meta / TOC / table cells → JetBrains Mono.
- **Icons (lucide):** `search`, `sun`/`moon`, `menu`, `copy` (+`check` when copied), `lightbulb`/`info`
  (callout), `link` (heading anchor), `arrow-left`/`arrow-right`.
- **Images:** cover 16:9 (rendered 16:7 crop) via `next/image` from R2; alt text required.
- **Data:** the "Subnetting Without Tears" post — `type=concept`, `section=A+`, `category=Networking`,
  `tags=[subnetting,tcp-ip,ipv4]`, dates/reading-time; body = sample (heading, 4-step list, code
  block, CIDR table, tip callout). TOC derived from h2 ids. Related/prev-next from same category.
- **A11y:** landmarks `header/main(article)/aside/footer`; heading hierarchy h1→h2→h3 with anchor ids;
  brand focus ring; AA contrast both themes; `prefers-reduced-motion`; copy-button has `aria-label`.
- **Dev notes:** `page.tsx` + MDX render are Server Components; client islands = header toggle/menu,
  **TOC scroll-spy**, **copy-code button**. Code highlighting = Shiki at build (open Q2).

---

### Screen: Project write-up  (route: /posts/[slug], type=project)
*(Same shell + components as Post page; this is the `type==='project'` variant — adds the at-a-glance
card; everything else is inherited.)*
- **Layout:** identical to Post page (article + sticky TOC). The **AtAGlanceCard** sits between the
  lede and the prose; TOC aside gains a "View the repo" link below the list.
- **Component tree (deltas only):**
  - **SiteHeader** — `active:'security-plus'` (+ Projects highlighted).
  - **AtAGlanceCard** → `NEW: components/site/at-a-glance.tsx` (Library §20). props: `project{ goal,
    stack[], duration, status, metrics:{value,label}[], repoUrl, demoUrl }`. composition: label "AT A
    GLANCE" + status pill (`--chart-2` dot, "Shipped · 1 week") · **key-metric tiles** (`flex-wrap
    basis-[150px]`, value `font-mono text-2xl/600 text-brand`, label `text-xs muted`) · meta rows
    (Goal / Stack / Duration — mono key `flex-[0_0_76px]`) · **repo/demo buttons** (repo =
    `Button{primary}` + github glyph, demo = `Button{secondary}` + play). states: hover/focus on
    links; metrics empty → hide tile row. responsive: metric tiles + buttons wrap on `sm`.
  - **Prose** — same `.prose`, here with a bash code block (scan + triage) and a before/after
    severity table; "Lesson" callout for the "what broke" aside.
  - **TOC** — plus a trailing `external-link` "View the repo" CTA.
  - PrevNext → previous/next **project**; RelatedPosts → related write-ups.
- **Typography:** h1 Inter `text-[38px]/600`; metric values `font-mono text-2xl/600 text-brand`; meta
  keys `font-mono text-[11px] uppercase`; rest inherits Post page.
- **Icons (lucide):** adds `github` glyph (inline path), `play` (demo), `external-link`,
  `alert-circle`/`info` (lesson callout), `copy`.
- **Images:** optional architecture diagram (note `data-om-raster` if HTML/CSS-built); cover optional.
- **Data:** the "Vulnerability Management" project sample — goal, stack, duration/status, metrics
  (47 hosts · 12→3 criticals · 92% highs), repo + demo links; body code + triage table (Critical
  12→3, High 38→3, Medium 64→40) + WinRM lesson callout. `tags=[siem,incident-response,
  vulnerability-management]`.
- **A11y:** at-a-glance is a `<section aria-label="Project at a glance">`; metric values paired with
  text labels (not number-only); buttons are real links with discernible names; AA contrast.
- **Dev notes:** Server Component; `type==='project'` frontmatter switches in the at-a-glance card.
  Same client islands as Post page.

---

## Build order (Stage 2 → next)
Prose + TOC + PostMeta + PrevNext + RelatedPosts ship the generic post page; the project variant is a
frontmatter switch adding AtAGlanceCard. Next: Projects index `/projects`, Journey, About; then Search
and the admin register.

## Open questions (carried + new)
- Q2 **Syntax highlighting** — confirm Shiki at build (RSC-friendly) so code blocks ship as static
  token spans (as mocked) with zero client JS.
- Q8 **TOC depth** — h2 only (used here) or h2+h3? h3 nesting indents one level.
- Q9 **Copy-code + anchor-link** are the only prose interactions — confirm both are client islands;
  everything else static.
