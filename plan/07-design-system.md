# 07 — Design System

shadcn/ui (new-york) on **Tailwind v4** (CSS-first), matching the reference project's mechanics. The
visual goal: **clean, professional, credible, fast** — this is a portfolio piece a hiring manager
skims, so legibility and polish beat flourish. Reading comfort (long study posts) and code rendering
are first-class.

---

## 1. shadcn/ui setup (`components.json`)
```jsonc
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "css": "app/globals.css", "config": "", "baseColor": "neutral", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components", "ui": "@/components/ui",
    "lib": "@/lib", "utils": "@/lib/utils", "hooks": "@/hooks"
  }
}
```
- `tailwind.config: ""` — **no `tailwind.config.js`** (v4 is CSS-first).
- `lib/utils.ts` exports `cn()` = `twMerge(clsx(...))`.
- Add primitives with `pnpm dlx shadcn@latest add button card badge input ...` (CLI pinned as a dep,
  per reference). The CLI may drop a throwaway demo route — delete it.

### Optional premium registries (env already has keys)
`.env.local` carries `SHADCNBLOCKS_*` and `SHADCNSTUDIO_*`. If used, wire the private registries in
`components.json` and replicate the reference's `scripts/block-vendor/vendor-blocks.mjs` (it maps
`SHADCNSTUDIO_EMAIL/LICENSE_KEY` → `EMAIL/LICENSE_KEY`, calls the local `shadcn` binary, strips
`npm_config_*` to dodge a pnpm 10 Node-version error). **Optional** — the core UI can be built from
free shadcn primitives; pull blocks only for landing/marketing sections if desired.

## 2. Tailwind v4 (`app/globals.css`)
CSS-first config; no JS config file. Structure (mirrors reference):
```css
@import "tailwindcss";
@import "tw-animate-css";

/* Load-bearing: keep Tailwind from compiling quoted class fragments out of content/markdown/manifests */
@source not "../content/**";
@source not "**/*.md";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* map shadcn semantic tokens → brand vars; define fonts, radii, custom --color-* utilities */
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
}

:where(:root) {
  /* brand tokens in oklch; repoint shadcn tokens (--background, --foreground, --primary, ...) */
}
.dark { /* dark palette */ }

@layer base { /* body type, focus rings, heading rhythm */ }
@layer components { /* .prose tweaks, callouts, code blocks, badges */ }
```
- **`@source not` exclusions are mandatory** — without them Tailwind scans Markdown/manifests and
  emits broken rules (a real bug hit in the reference).
- Define **custom utilities** with `@utility` (e.g. `@utility container`, `@utility section-y`).

## 3. Typography & fonts
A study/tech blog reads better with a clean sans for UI + an excellent reading face for prose + a mono
for code. Load via `next/font/google` in `app/layout.tsx` (self-hosted, no layout shift):
- **UI / headings:** Inter (or Geist) → `--font-sans`.
- **Long-form prose:** Inter works; or pair a serif (e.g. Source Serif / Newsreader) for article body
  to aid long reading — optional.
- **Code:** JetBrains Mono (or Geist Mono) → `--font-mono`.

> Keep it to **two families** for performance/cohesion (the reference uses a single family site-wide).
> Decide UI-sans + code-mono first; add a reading serif only if desired.

## 4. Rendered Markdown — the `.prose` container
Post bodies are sanitized HTML (`02-architecture.md` §4.1) wrapped in a styled container. Use
Tailwind's typography conventions or hand-rolled `@layer components` rules to style: headings with
anchor links (from `rehype-slug`/`autolink`), readable measure (~68ch), tables, blockquotes,
**callout** boxes (info/warn/tip — author writes them as blockquote conventions or fenced directives),
and **code blocks** with Shiki theme + copy button. Ensure:
- Code blocks scroll horizontally on mobile; inline code is visually distinct.
- Heading anchors are keyboard-focusable.
- Images (`next/image`) never collapse — **always give `fill` images an explicit height container**
  (a reference gotcha: a `fill` image inside an `items-center` flex column collapses to 0).

## 5. Component inventory
**`components/ui/`** (shadcn primitives): button, card, badge, input, textarea, select, dropdown-menu,
dialog, sheet, tabs, tooltip, separator, avatar, skeleton, sonner (toasts), progress, table, switch,
label, popover, command (for search).

**`components/site/`** (public composites):
- `site-header.tsx` (nav: the 3 certs + Journey + Projects + About + search), `site-footer.tsx`
- `post-card.tsx`, `post-meta.tsx` (date/updated/reading-time/type badge)
- `coverage-bar.tsx` + `coverage-checklist.tsx` (the signature tracker)
- `toc.tsx` (sticky table of contents), `prose.tsx` (renders sanitized HTML)
- `tag-pill.tsx`, `section-hub.tsx`, `domain-archive.tsx`, `project-card.tsx`
- `journey-timeline.tsx`, `now-block.tsx`, `prev-next.tsx`, `related-posts.tsx`
- `search-form.tsx` (uses `<Form>` from `next/form`)

**`components/admin/`**:
- `post-editor.tsx` (Markdown textarea + live server preview), `metadata-panel.tsx`
  (section/category/type/tags/exam/cover/slug/status), `tag-input.tsx` (create-on-the-fly),
  `media-picker.tsx` (R2 upload + library), `coverage-gaps.tsx`, `publish-bar.tsx`.

## 6. Icons & motion
- **Icons:** `lucide-react`.
- **Motion:** `motion` (Framer Motion successor) — use **sparingly** (subtle fades/hover), respect
  `prefers-reduced-motion`. Avoid animation that delays content for a credibility-first blog.

## 7. Dark mode
Class-based dark mode (`@custom-variant dark`), toggle in the header, persisted; default to system.
Ensure code themes and coverage bars have dark variants.

## 8. Accessibility (WCAG AA)
- Root layout: `<html lang="en">`, single `<main id="main">`, skip-link to `#main`,
  `<body suppressHydrationWarning>` (extensions inject attributes — intentional, per reference).
- Visible focus rings; AA contrast on text and on badges/bars; alt text required on uploads
  (the media table stores `alt`); keyboard-navigable menus/dialogs (Radix handles most).
- Headings in order; landmarks (`header`/`nav`/`main`/`footer`).

## 9. Brand direction (starting point — owner can adjust)
Neutral base (`baseColor: neutral`) + one confident accent. A restrained **"terminal/blueprint"**
accent (a single saturated blue or green) signals "tech" without gimmick. Keep surfaces calm so code
and diagrams pop. Define accents as `--color-*` brand utilities in `@theme` so they’re reusable
(badges, links, coverage bars, active nav). Decide exact palette during Phase 4 polish; the structure
above is what matters for the build.
