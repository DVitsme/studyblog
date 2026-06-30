# StudyBlog — Design-to-Development Handoff Plan

> How every StudyBlog screen will be delivered, from Stage 1 on, so the developer (Claude Code) can
> build it **1:1** in the target stack with no reinterpretation. This plan is a standing contract;
> the per-stage deliverables below conform to it every time.

**Stack we design into (from `components-tech-and-handoff-spec.md`):** Next.js 16 App Router + RSC ·
Tailwind v4 (CSS-variable tokens) · shadcn/ui "new-york" + Radix + lucide-react · fonts via
`next/font` (Inter `--font-sans`, JetBrains Mono `--font-mono`) · dark mode = `.dark` class on
`<html>`.

---

## The five commitments

### (a) A per-screen "Handoff Spec" block for every screen
Every screen I design ships with the exact Markdown block defined in the tech file — same field order,
no omissions:

```
### Screen: <name>  (route: /...)
- Layout: max-width, grid/columns, section order, page gutter, vertical rhythm (Tailwind classes).
- Component tree: nested list of components. For each:
    • maps to: <shadcn primitive and/or target file path, or "NEW: components/.../x.tsx">
    • variant/props: e.g. PostCard{ featured?: boolean }
    • tokens/classes: the Tailwind utilities used (colors, spacing, radius, type)
    • states: default / hover / focus / active / disabled / loading(skeleton) / empty / error
    • responsive: behavior at sm / md / lg (what stacks, hides, reflows)
- Typography: per text element → font (sans/mono), size (text-*), weight, leading.
- Icons: lucide names.
- Images: aspect ratio + where (cover, avatar); R2 via next/image.
- Data: which content-model fields feed which element (from content-ia-and-samples.md).
- A11y: landmarks, focus order, aria, contrast notes, reduced-motion.
- Dev notes: Server vs Client components; interaction logic.
```

One block per screen, delivered alongside the visual, in the same stage.

### (b) A running Component Library sheet
`Component-Library-Sheet.md` (v1 starts in this stage, see that file). Each reusable component is
specified **once** — variants, props, token/Tailwind classes, all states, shadcn primitive + target
file path — and **reused by reference** in screen handoff blocks. Each stage I *extend* the sheet
(append new components, bump version) rather than re-specifying shared pieces. Screen blocks say
"PostCard (see Library §)", not a full re-spec.

### (c) Token / Tailwind class names only — no arbitrary values
All styling is named by the tokens in `design-tokens.md`, referenced as Tailwind classes:
`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`,
`bg-secondary`, `border-border`, `ring-ring`, `text-brand`, `bg-brand`, `text-brand-foreground`,
`bg-destructive`, plus `rounded-sm/md/lg/xl`, the Tailwind type scale (`text-xs`…`text-5xl`), and the
4px spacing scale. **No arbitrary hex, no `[…]` values, no bespoke CSS.** Charts/data-viz use
`--brand` + the `--chart-1…5` ramp only.
*(The visual artifacts are authored with inline styles bound to the **exact OKLCH token values**, so
what you see is pixel-true; this sheet and every handoff block name the corresponding Tailwind class
so the styling drops into the repo verbatim.)*

### (d) Each component mapped to its shadcn primitive and/or target file path
Every component names its origin:
- a **shadcn primitive** by name (`button`, `card`, `badge`, `input`, `select`, `tabs`, `dialog`,
  `sheet`, `progress`, `table`, `command`, …), and/or
- a **target file path** from the tech file (`components/site/post-card.tsx`,
  `components/site/coverage-bar.tsx`, `components/admin/post-editor.tsx`, …), or
- `NEW: components/site/<x>.tsx` when none exists, flagged explicitly.

Reuse a shadcn component wherever one exists before inventing an equivalent.

### (e) Both light + dark, and both mobile + desktop
Every screen is delivered in **light and dark** (the foundations artifact carries a working theme
toggle; screen mockups show both) and at **mobile and desktop** breakpoints, with the responsive
behavior (what stacks / hides / reflows at `sm` / `md` / `lg`) written in the handoff block. Mobile is
designed first, then scaled up.

---

## Per-screen deliverable, every stage
For each screen in scope:
1. **Visual** — light + dark, mobile + desktop, real sample content from `content-ia-and-samples.md`
   (never lorem ipsum), built as React/Tailwind-translatable inline-token markup.
2. **Handoff Spec block** — the structure in (a).
3. **Component Library sheet** — extended with any new/changed components.
4. **Build order + open questions** for the developer.

## Accessibility baseline (applies to every screen, asserted in each block)
Semantic landmarks (`header`/`nav`/`main`/`footer`) · visible focus = brand ring
(`ring-2 ring-brand` with offset) · WCAG AA contrast in both themes · alt text on all imagery ·
logical focus order · `prefers-reduced-motion` respected (motion is subtle and optional, never blocks
content).

## Server vs client boundary (design supports the RSC-first target)
Layouts are designed to be mostly static / server-rendered. Interactivity is isolated to small client
islands, each flagged in handoff "Dev notes": theme toggle, mobile menu (`sheet`), search input
(`command`), copy-code button, tabs, and the admin editor + metadata panel. Everything else is a
Server Component.

## Proposed build order (screens, Stage 1+)
1. App shell — `site-header`, `site-footer`, theme provider, fonts. (Unblocks every page.)
2. **Home `/`** — progress snapshot (coverage bars ×3), latest posts, 3 cert cards, featured project.
3. **Cert hub** `/security-plus` — intro + coverage checklist + latest posts (template for all 3).
4. **Post page** `/posts/[slug]` — prose, TOC, post-meta, prev/next, related; project write-up variant.
5. **Projects** `/projects` · **Journey** `/journey` (timeline + Now block) · **About**.
6. **Search** `/search` · **archives** (domain / type / tag).
7. **Admin** (separate visual register) — login, dashboard + coverage-gaps, posts table, editor + live
   preview + metadata panel, media.

## Open questions for the developer / product owner
1. **Coverage source of truth** — is domain→post coverage computed at build time from MDX
   frontmatter (`section`/`category`), or stored? Affects whether `coverage-bar` is pure Server.
2. **Syntax highlighting** — Shiki at build time (RSC-friendly) vs client highlighter? Recommend Shiki.
3. **Search** — client-side index (e.g. over a generated JSON) or a server route? `command` palette
   vs full `/search` page, or both?
4. **Images / R2** — confirmed `next/image` loader + remote pattern for the R2 bucket; what cover
   aspect ratio is canonical (proposing 16:9)?
5. **Reading time / dates** — computed in frontmatter pipeline? Confirm "Updated" vs "Published"
   display rule.
