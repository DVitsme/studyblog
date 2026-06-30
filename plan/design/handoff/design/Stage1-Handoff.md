# StudyBlog — Stage 1 Handoff Specs (Home + Cert Hub)

> Per-screen blocks in the exact format from `components-tech-and-handoff-spec.md`. Components are
> referenced by name; full specs live in `Component-Library-Sheet.md` (v2). All styling is
> token-named (no arbitrary values). Both themes via `.dark`; both breakpoints noted per element.

---

### Screen: Home  (route: /)
- **Layout:** `<main>` centered `max-w-[1080px] mx-auto`, page gutter `px-5`, top `pt-10 pb-14`.
  Section order: SiteHeader → Hook → ProgressSnapshot → CertCards → FeaturedProject → LatestPosts →
  SiteFooter. Vertical rhythm `mb-12`–`mb-14` between sections. Sticky header.
- **Component tree:**
  - **SiteHeader** — maps to `components/site/site-header.tsx`. props: `active?: undefined`.
    tokens: `bg-background/85 backdrop-blur border-b border-border`. states: nav hover/active, focus
    ring, sticky. responsive: full nav `md+`; `sm` → wordmark + search + `menu`→`sheet`.
  - **Hook** (section) — maps to `NEW: components/site/home-hook.tsx`. variant/props: static content.
    tokens: kicker `font-mono text-xs uppercase tracking-wide text-brand`; h1 `text-4xl font-semibold
    tracking-tight text-balance`; lede `text-lg text-muted-foreground`; primary `Button{variant:primary}`
    + `Button{variant:ghost}` with `arrow-right`; meta `font-mono text-sm text-muted-foreground`.
    states: button hover/focus. responsive: `max-w-[72ch]`; buttons wrap on `sm`.
  - **ProgressSnapshot** → `coverage-bar.tsx` ×3 inside a Card. props: `cert{name,exam,covered,total}`.
    tokens: Card `bg-card border-border rounded-lg p-6`; track `bg-muted h-2 rounded-full`; fill
    `bg-brand`; `%` `font-mono text-brand`. states: populated / 0% (note) / skeleton. responsive:
    label row wraps on `sm`. a11y: `role=progressbar`, % always shown.
  - **CertCards** → `NEW: components/site/cert-card.tsx` ×3 (see Library §15). tokens: `bg-card
    border-border rounded-lg p-[18px]`, hover `border-brand`; `%` `font-mono text-3xl text-brand`.
    responsive: `flex flex-wrap gap-3.5`, each `flex-1 basis-60` → 3-up `lg`, 1-up `sm`.
  - **FeaturedProject** → `project-card.tsx` (Library §10), `featured` treatment. data: project sample
    (goal/stack/metrics/links). responsive: metric cells `flex-wrap basis-36` 3-up→1-up; links wrap.
  - **LatestPosts** → section heading + `View all` link + `post-card.tsx` ×4. responsive:
    `flex flex-wrap gap-3.5`, card `flex-1 basis-[440px]` → 2-up `lg`, 1-up `sm`/`md`.
  - **SiteFooter** → `site-footer.tsx`.
- **Typography:** h1 Inter `text-4xl/600`; section h2 Inter `text-2xl/600 tracking-tight`; card titles
  `text-lg/600`; body `text-sm`–`text-lg/400 leading-relaxed`; all meta/dates/exam/% → JetBrains Mono.
- **Icons (lucide):** `search`, `sun`/`moon`, `menu`, `arrow-right`, `external-link`.
- **Images:** none required on Home v1 (no hero illustration — per brief). Post covers optional later
  at 16:9 via `next/image` from R2.
- **Data:** coverage table (A+ 4/9 44%, Sec+ 3/5 60%, Net+ 0/5 0%); cert post counts; the 5 sample
  posts (4 in Latest, project featured). Fields: `type`,`section`,`category`,`title`,`excerpt`,
  `publishedAt`/`updatedAt`,`readingTime`,`slug`.
- **A11y:** landmarks `header/main/footer`; focus order header→hook CTAs→cards; brand focus ring;
  AA contrast both themes; coverage conveyed by number+bar (not color alone); `prefers-reduced-motion`
  disables bar grow-in.
- **Dev notes:** Page is a Server Component; only SiteHeader's theme toggle / mobile sheet / search
  trigger are client islands. Coverage values computed at build from post frontmatter (see open Q1).

---

### Screen: Cert Hub — Security+  (route: /security-plus)
*(Template for all three cert hubs: `/a-plus`, `/network-plus` reuse it with their own data.)*
- **Layout:** `<main>` `max-w-[1080px] mx-auto px-5 pt-8 pb-14`. Order: SiteHeader → Intro (full
  width) → two-column row → SiteFooter. Row = `flex flex-wrap gap-6 items-start`: main `flex-1
  basis-[460px]`, aside `flex-1 basis-72`. On `sm`/`md` aside drops below main.
- **Component tree:**
  - **SiteHeader** — `active: 'security-plus'` → nav item `text-brand bg-brand/10`.
  - **SectionHub / Intro** → `components/site/section-hub.tsx`. children: breadcrumb (`font-mono
    text-xs`, current crumb `text-foreground`); h1 `text-3xl/600` + exam type-chip (`badge outline`,
    brand border, `font-mono`); description `text-[17px] text-muted-foreground max-w-[68ch]`; **overall
    CoverageBar** (Card, 60%) + honest one-liner. data: cert name, exam, 3/5, 60%.
  - **CoverageChecklist** → `coverage-checklist.tsx` (Library §12), with per-row `sub` caption added
    (domain hint) + a trailing "write next" note row (`arrow-right`, names first empty domain).
    tokens: Card `bg-card border-border rounded-lg`; rows `border-b border-border py-3.5`; done icon
    `bg-brand text-brand-foreground` circle + `check`; empty `border-border` hollow circle; count
    `font-mono text-xs`. states: done / empty / all-empty / skeleton. data: 5 SY0-701 domains +
    post counts (3/5/2/0/0). a11y: status = icon + text.
  - **LatestPosts (Security+)** → heading + `All 10 posts` link + `post-card.tsx` ×5 in a vertical
    stack (`flex-col gap-3`), each with inline meta on the right. data: 1 real project sample + 4
    on-model Security+ posts across the documented domains.
  - **CrossCertCard** → `NEW: components/site/cross-cert.tsx` (Library §16): mini coverage bars for
    all three certs, current cert flagged "You are here" in brand. Makes the honest
    "further-along-on-A+/Sec+-than-Net+" story legible. data: the 3-cert coverage table.
  - **FilterCard** → wraps `search-form` facets; tag/type pills (`badge outline`, `font-mono`).
    states: idle / selected (`bg-brand/10 text-brand aria-pressed`).
  - **SiteFooter**.
- **Typography:** h1 Inter `text-3xl/600`; section h2 `text-xl/600`; domain labels `text-sm/500`
  (empty → `text-muted-foreground`); sub captions `text-xs muted`; all meta/exam/counts/% → mono.
- **Icons (lucide):** `search`, `menu`, `check`, `circle`, `arrow-right`, `external-link`, `sun`/`moon`.
- **Images:** none v1.
- **Data:** Security+ coverage (3/5, 60%), the 5-domain checklist with counts, Security+ post list,
  cross-cert table. Drives the coverage from `category` frontmatter per post.
- **A11y:** landmarks; logical order intro→checklist→posts→aside; brand focus ring; AA contrast;
  coverage status not color-only; reduced-motion disables bar animation.
- **Dev notes:** Server Component; checklist + bars computed at build from frontmatter (open Q1).
  Only header islands + facet filter are client.

---

## Build order (Stage 1 → next)
1. SiteHeader + SiteFooter + theme provider (unblocks both screens). 2. Home. 3. Cert hub template
(this Security+ build parametrized for all 3). Next stage: Post page (prose, TOC, prev/next, related)
and the project write-up variant.

## Open questions (carried from Handoff-Plan + new)
- Q1 **Coverage source** — confirm build-time computation from MDX frontmatter so `coverage-bar` /
  `coverage-checklist` stay pure Server Components.
- Q6 **Latest-posts count per surface** — Home shows 4, cert hub shows 5; confirm or set a constant.
- Q7 **Cert-hub post list layout** — vertical stack (used here) vs 2-col grid like Home? Stack keeps
  the inline meta readable; confirm.
