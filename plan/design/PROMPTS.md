# StudyBlog — Staged Prompts for claude.ai/design

Copy each stage's prompt (the fenced block) into **claude.ai/design**, in order. The goal: designs
that translate **1:1** into our Next.js 16 + Tailwind v4 + shadcn (new-york) codebase, each shipping a
**developer handoff** that Claude Code uses to build it faithfully.

## How to use this

1. **Attach these 4 files** (from `plan/design/attachments/`) at the start of your claude.ai/design
   chat — they are the source of truth:
   - `studyblog-brief.md` — product, audience, voice, brand
   - `design-tokens.md` — exact colors/fonts/radii (use verbatim)
   - `content-ia-and-samples.md` — pages + real sample content (no lorem ipsum)
   - `components-tech-and-handoff-spec.md` — stack + the required handoff format
2. **Run the stages in order.** Stage 0 establishes the design language + component kit + the handoff
   *plan*; Stages 1–4 design the screens; Stage 5 consolidates the dev-ready package.
3. **If you start a new chat per stage** (to avoid running out of room), re-attach the 4 files **and
   paste the "Component Library sheet"** claude.ai/design produced in Stage 0 so shared pieces stay
   consistent.
4. **After each stage**, save the output (visuals + handoff blocks + updated Component Library sheet)
   and bring it back here — **Claude Code implements it in the repo 1:1**. (Designs may run ahead of
   the build: Stages 0–3 feed build Phase 3 "public site"; Stage 4 feeds build Phase 2 "admin".)

---

## STAGE 0 — Kickoff: design language, component kit & the handoff plan

> Attach: all 4 files.

```
You are the lead product designer for "StudyBlog." Read the four attached files carefully — they are
the source of truth for the product, the exact design tokens, the content, and the technical stack
you must design into. We will design the site in stages; this is Stage 0.

Two jobs in this stage:

1) DESIGN FOUNDATIONS. Establish the visual language and a reusable component kit, using the attached
   design tokens VERBATIM (Inter + JetBrains Mono; the OKLCH semantic colors; the radii; the tech-blue
   --brand accent). Deliver, in both LIGHT and DARK:
   - A style tile: color usage, type scale in context, spacing rhythm, elevation/border style.
   - A core component kit styled as shadcn/ui "new-york": buttons (primary/secondary/ghost), badges
     (incl. the post "type" chips in mono), cards, inputs/select/textarea, tabs, the site header & footer,
     a post card, a tag pill, and the signature coverage bar + coverage checklist.
   Use the real sample content from the content file (no placeholder text).

2) THE DESIGN-TO-DEVELOPMENT HANDOFF PLAN. Before we design screens, write a short PLAN describing how
   you will deliver every subsequent screen so a developer (Claude Code) can build it 1:1 in our stack.
   It must commit to: (a) producing the per-screen "Handoff Spec" block defined in the tech file for
   every screen; (b) maintaining a running "Component Library sheet" (each reusable component with its
   variants, props, token/Tailwind classes, and all states) that you start now and extend each stage;
   (c) naming all styling by the provided token / Tailwind class names (no arbitrary values); (d)
   mapping each component to the shadcn primitive and/or the target file path listed in the tech file;
   (e) delivering both light+dark and mobile+desktop. 

Output: the foundations (light+dark), the Component Library sheet (v1), and the written handoff plan.
Prefer building as React + Tailwind using the tokens so it translates directly. Ask me any blocking
questions before proceeding.
```

---

## STAGE 1 — Home + Cert Hub (the shared public shell)

> Attach: all 4 files (+ paste the Stage 0 Component Library sheet if this is a new chat).

```
Stage 1 of StudyBlog. Using the foundations and Component Library from Stage 0 (and the attached
files), design the two highest-traffic public pages, reusing the header, footer, post card, badges,
and coverage components you already established. Light + dark, mobile + desktop, real sample content.

Screens:
1) HOME (/): a credible, content-first landing — a concise "from zero to CompTIA" hook (no hero
   illustration), a PROGRESS SNAPSHOT using the per-cert coverage bars (A+ 44%, Security+ 60%,
   Network+ 0% — see the sample data), a "latest posts" list using post cards, the three cert cards,
   and one featured project. It must read as a serious engineer's blog, not a SaaS marketing page.
2) CERT HUB (/security-plus): the section intro, the per-domain COVERAGE CHECKLIST (✓/○ + post counts
   from the sample data), and the latest Security+ posts. Make the honest "further along on A+/Sec+
   than Net+" story legible.

For EACH screen, also output the Handoff Spec block (exact format in the tech file) and update the
Component Library sheet with any new/changed components. Keep everything token-named and mapped to the
shadcn primitives / target file paths.
```

---

## STAGE 2 — Post page + Project write-up variant (the reading core)

> Attach: all 4 files (+ Component Library sheet if new chat).

```
Stage 2 of StudyBlog. Design the article experience — the most important pages for both studying and
interviews. Reuse the established shell and components. Light + dark, mobile + desktop, real content
(use the "Subnetting Without Tears" concept post and the "Vulnerability Management" project from the
content file, including the sample body with a heading, a syntax-highlighted code block, a table, and
a callout).

Screens:
1) POST PAGE (/posts/[slug]): title + post-meta row (mono date / updated / reading-time / type badge),
   optional cover image, a sticky TABLE OF CONTENTS, the prose body (excellent reading typography ~68ch,
   styled headings with anchor links, code blocks, tables, callouts/asides, inline code), tags,
   prev/next within the domain, and related posts. Design the prose styles thoroughly — this is where
   readers spend their time.
2) PROJECT WRITE-UP variant (a post where type = project): same shell, plus the "at-a-glance" card
   (goal, stack, duration, status, key metrics like "47 hosts → 3 criticals") and prominent repo /
   demo links. This is the interview centerpiece — make the results and proof-of-work scannable.

Output the Handoff Spec block per screen + update the Component Library sheet (esp. the prose/.prose
spec, TOC, at-a-glance card). Token-named, mapped to shadcn/target files.
```

---

## STAGE 3 — Archives, discovery & narrative pages

> Attach: all 4 files (+ Component Library sheet if new chat).

```
Stage 3 of StudyBlog. Design the discovery and narrative pages, reusing existing components (post
cards, tag pills, coverage pieces, header/footer). Light + dark, mobile + desktop, real content.

Screens:
1) DOMAIN ARCHIVE (/[section]/[category]) — posts in one exam domain, with the official-objective
   blurb and a small coverage indicator.
2) TAG HUB (/tags/[tag]) — one concept across all three certs (e.g. "firewalls"), with a short intro
   on how the concept deepens A+ → Net+ → Sec+.
3) TYPE ARCHIVE (/types/[type]) — e.g. all "lab" posts; lean on the type badge system.
4) PROJECTS (/projects) — the project write-ups as case-study cards (metrics + repo link visible).
5) JOURNEY (/journey) — a milestone timeline (exam passes, project ships) + a "Now" block (current
   focus) + the weekly journal entries.
6) ABOUT (/about) — the from-zero story and consistent identity links (GitHub/LinkedIn).
7) SEARCH (/search) — a text input + facet filters (section, type, tag) and a results list; show empty
   and results states.

Output the Handoff Spec per screen + update the Component Library sheet. Include empty/loading states
for the archives and search. Token-named, mapped to shadcn/target files.
```

---

## STAGE 4 — Admin / CMS (utilitarian register)

> Attach: all 4 files (+ Component Library sheet if new chat).

```
Stage 4 of StudyBlog. Design the single-author admin. This is a different register from the public
site — denser, utilitarian, tool-like — but still using the same tokens and shadcn components. Light +
dark, mobile + desktop. Use the admin data shapes in the content file.

Screens:
1) LOGIN (/login) — minimal: email + password, single owner, no sign-up; show the error state.
2) DASHBOARD (/admin) — cards for Drafts / Published / "this week", a recent-posts list, and the
   COVERAGE GAPS widget (empty domains → "write next").
3) POST EDITOR (/admin/posts/new and /edit) — a Markdown editor with LIVE PREVIEW (side-by-side on
   desktop, toggle on mobile), a top publish bar (Save draft / Publish / status pill), and a
   collapsible metadata side-panel (Section → Category (filtered) → Type → Tags (multi, create-on-the-
   fly) → Exam → Excerpt → Cover image drop zone → Slug → Publish date). Show draft vs published states.
4) POSTS LIST (/admin/posts) — a filterable table (status, section, type) with row actions.
5) MEDIA (/admin/media) — an uploaded-image grid with copy-URL / delete.

Output the Handoff Spec per screen + update the Component Library sheet (editor, metadata-panel,
tag-input, media-picker, publish-bar, coverage-gaps). Token-named, mapped to shadcn/target files.
Keep interactive bits (editor, preview, tag input, drop zone) clearly flagged as client components.
```

---

## STAGE 5 — Consolidated dev-ready handoff package

> Attach: all 4 files (+ all Component Library sheets / handoff blocks from Stages 0–4 if new chat).

```
Final stage for StudyBlog. Consolidate everything into a single DEV-READY HANDOFF PACKAGE that Claude
Code will implement 1:1, with no design reinterpretation needed. Produce:

1) The COMPLETE Component Library: every reusable component (public + admin) with its variants, props,
   token/Tailwind classes, all states (default/hover/focus/active/disabled/loading/empty/error), and
   its target file path + shadcn mapping. Resolve any inconsistencies across stages.
2) A SCREEN INDEX: each screen with its route, its component tree, and a link to its Handoff Spec.
3) A BUILD ORDER recommendation grouped to match our build phases (shared layout + components first;
   public reading pages; archives; admin), noting dependencies between components.
4) A TOKEN/PRIMITIVE AUDIT: confirm every screen uses only the provided tokens and the named shadcn
   primitives; list any place you had to introduce something new and why (so we can add it to the
   system deliberately).
5) OPEN QUESTIONS / decisions for the developer.

Deliver it as structured Markdown so it can be dropped into the repo as the design handoff doc. Both
light + dark must be specified throughout.
```

---

## After claude.ai/design returns

Bring the **handoff blocks + Component Library sheet** back into this repo (e.g. drop them in
`plan/design/handoff/`) and tell Claude Code to implement a given stage. Because the designs are
token-named and mapped to our shadcn primitives and file paths, implementation is a faithful
transcription into `components/site/*`, `components/admin/*`, and the `app/` routes — the 1:1 goal.
