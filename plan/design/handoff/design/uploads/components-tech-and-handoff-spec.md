# StudyBlog — Components, Tech Target & Handoff Spec (attachment)

> Attach to claude.ai/design. This is the **1:1 contract**: the exact stack the designs are
> implemented in, the component vocabulary to design against, and the **handoff format** every screen
> must ship with so the developer (Claude Code) can build it pixel-for-token faithfully.

## Implementation target (design *into* this)
- **Next.js 16, App Router, React Server Components.** Pages are mostly static/server-rendered;
  interactivity (theme toggle, search input, editor, mobile menu, copy-code) is isolated to small
  client components. **Favor layouts that need little client JS.**
- **Tailwind CSS v4** (utility-first, CSS variables). Express *all* styling as **Tailwind utility
  classes that reference the token names** in `design-tokens.md` (`bg-card`, `text-muted-foreground`,
  `text-brand`, `rounded-lg`, `border-border`, …). **No arbitrary hex, no bespoke CSS files.**
- **shadcn/ui, "new-york" style** + **Radix** primitives + **lucide-react** icons. Reuse shadcn
  components wherever one exists rather than inventing equivalents.
- **Fonts via `next/font`:** Inter (`--font-sans`), JetBrains Mono (`--font-mono`).
- **Dark mode:** `.dark` class on `<html>`. Design and hand off **both** light and dark.
- **Accessibility:** semantic landmarks (`header/nav/main/footer`), visible focus (brand ring), AA
  contrast, alt text, `prefers-reduced-motion`.

## Component vocabulary (map designs to these)

### shadcn primitives available (use by name)
`button` `card` `badge` `input` `textarea` `select` `dropdown-menu` `dialog` `sheet` `tabs` `tooltip`
`separator` `avatar` `skeleton` `sonner` (toast) `progress` `table` `switch` `label` `popover`
`command` (for search). If a design needs one of these, name it.

### Public composite components (target file → purpose)
- `components/site/site-header.tsx` — top nav: the 3 certs + Journey + Projects + About + search + theme toggle.
- `components/site/site-footer.tsx`
- `components/site/post-card.tsx` — list/grid card: type badge, title, excerpt, section + date + reading time.
- `components/site/post-meta.tsx` — date / updated / reading-time / type badge row (mono chips).
- `components/site/coverage-bar.tsx` — per-exam progress bar (brand fill, % label).
- `components/site/coverage-checklist.tsx` — per-domain ✓/○ rows with post counts.
- `components/site/toc.tsx` — sticky table of contents on the post page.
- `components/site/prose.tsx` — rendered Markdown container (.prose styles: headings w/ anchors, code blocks, tables, callouts).
- `components/site/tag-pill.tsx` · `components/site/project-card.tsx` · `components/site/section-hub.tsx`
- `components/site/journey-timeline.tsx` · `components/site/now-block.tsx` · `components/site/prev-next.tsx` · `components/site/related-posts.tsx`
- `components/site/search-form.tsx`

### Admin composite components
- `components/admin/post-editor.tsx` (markdown + live preview) · `metadata-panel.tsx` · `tag-input.tsx`
  · `media-picker.tsx` · `coverage-gaps.tsx` · `publish-bar.tsx`.

## REQUIRED HANDOFF SPEC — output this for every screen
For **each screen** you design, produce a short structured handoff block (Markdown) alongside the
visual, so it can be built 1:1. Use exactly these fields:

```
### Screen: <name>  (route: /...)
- Layout: max-width, grid/columns, section order, page gutter, vertical rhythm (Tailwind classes).
- Component tree: nested list of components. For each, note:
    • maps to: <shadcn primitive and/or target file path above, or "NEW: components/.../x.tsx">
    • variant/props: e.g. PostCard{ featured?: boolean }
    • tokens/classes: the Tailwind utilities used (colors, spacing, radius, type)
    • states: default / hover / focus / active / disabled / loading(skeleton) / empty / error
    • responsive: behavior at sm / md / lg (what stacks, hides, reflows)
- Typography: per text element → font (sans/mono), size (text-*), weight, leading.
- Icons: lucide names.
- Images: aspect ratio + where (cover, avatar); note they come from R2 via next/image.
- Data: which content-model fields feed which element (from content-ia-and-samples.md).
- A11y: landmarks, focus order, aria, contrast notes, reduced-motion.
- Dev notes: which parts are Server vs Client components; any interaction logic.
```

Also maintain a running **Component Library sheet** (build once in Stage 0, extend each stage): each
reusable component with its variants, props, token usage, and all states — so shared pieces (header,
card, badge, coverage bar) are specified once and reused.

## Deliverable format per stage
1. **Visuals** — light **and** dark, **mobile and desktop** frames, using the real sample content.
   Prefer building them as **React + Tailwind** (with the provided tokens) so they translate directly;
   if producing static mockups, keep all styling token-referenced.
2. **Handoff blocks** — one per screen, in the format above.
3. **Updated Component Library sheet.**
4. **Build order + open questions** for the developer.

## The 1:1 promise (why this format)
The developer implementing these (Claude Code) already has the tokens, shadcn config, and these exact
file paths in the repo. If your output names tokens by their Tailwind class, reuses the shadcn/component
vocabulary above, and ships the handoff block per screen, implementation becomes a faithful
transcription — not a reinterpretation. Optimize for that.
