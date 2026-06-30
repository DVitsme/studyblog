# StudyBlog — Design Tokens (attachment)

> Attach to claude.ai/design. **These are the exact production tokens already shipped in the
> codebase** (Tailwind v4 CSS variables, OKLCH). Use them verbatim — do not invent new colors,
> radii, or fonts. Every design element must map to one of these token names so the design drops into
> the codebase 1:1.

## Fonts
- **Sans / body / UI:** `Inter` (via `next/font`), exposed as `--font-sans`.
- **Mono / code / metadata chips:** `JetBrains Mono`, exposed as `--font-mono`.
- Use mono for: code blocks, inline code, the "type" badges, dates/reading-time chips, and small
  technical labels. Use sans for everything else.

## Type scale (Tailwind defaults — name these in handoff)
`text-xs` 12 · `text-sm` 14 · `text-base` 16 · `text-lg` 18 · `text-xl` 20 · `text-2xl` 24 ·
`text-3xl` 30 · `text-4xl` 36 · `text-5xl` 48. Body copy in posts: `text-base`/`text-lg` with relaxed
line-height. Headings: weight 600, `tracking-tight`, `text-balance`.

## Radii
`--radius: 0.625rem` (10px). Scale: `rounded-sm` (radius−4) · `rounded-md` (radius−2) · `rounded-lg`
(radius) · `rounded-xl` (radius+4). Cards/inputs/buttons default to `rounded-lg`/`rounded-md`.

## Spacing & layout
- Tailwind spacing scale (4px base). Content max-width ~`max-w-2xl`/`max-w-3xl` for prose,
  `max-w-6xl`/`max-w-7xl` for landing/grid layouts. Page gutter `px-6`.
- Section rhythm: generous vertical spacing (`py-16`/`py-24` on landing sections).

## Color tokens (OKLCH) — semantic, shadcn-compatible

Use the **semantic name** in designs (e.g. "card background = `bg-card`", "muted label =
`text-muted-foreground`", "accent = `text-brand`"). Both modes below are authoritative.

### Light (`:root`)
```css
--radius: 0.625rem;
--background: oklch(1 0 0);            /* page bg */
--foreground: oklch(0.145 0 0);        /* primary text */
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);           /* near-black; primary buttons */
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);          /* subtle fills */
--secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);  /* secondary text, meta */
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
--brand: oklch(0.55 0.18 255);         /* TECH BLUE — links, active nav, coverage bars, focus */
--brand-foreground: oklch(0.985 0 0);
--chart-1: oklch(0.646 0.222 41.116);
--chart-2: oklch(0.6 0.118 184.704);
--chart-3: oklch(0.398 0.07 227.392);
--chart-4: oklch(0.828 0.189 84.429);
--chart-5: oklch(0.769 0.188 70.08);
```

### Dark (`.dark`)
```css
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--card: oklch(0.205 0 0);
--card-foreground: oklch(0.985 0 0);
--popover: oklch(0.205 0 0);
--popover-foreground: oklch(0.985 0 0);
--primary: oklch(0.985 0 0);
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.269 0 0);
--accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.556 0 0);
--brand: oklch(0.7 0.15 255);          /* lighter tech blue for dark */
--brand-foreground: oklch(0.145 0 0);
--chart-1: oklch(0.488 0.243 264.376);
--chart-2: oklch(0.696 0.17 162.48);
--chart-3: oklch(0.769 0.188 70.08);
--chart-4: oklch(0.627 0.265 303.9);
--chart-5: oklch(0.645 0.246 16.439);
```

## Tailwind utility names these map to (use in designs + handoff)
`bg-background` `text-foreground` `bg-card` `text-card-foreground` `bg-muted` `text-muted-foreground`
`bg-primary` `text-primary-foreground` `bg-secondary` `border-border` `ring-ring` `text-brand`
`bg-brand` `text-brand-foreground` `bg-destructive`. Dark mode is the `.dark` class on `<html>` (class
strategy), so design every screen in both palettes.

## Hard rules for 1:1 fidelity
1. **No arbitrary hex / one-off colors.** Only the tokens above (referenced by Tailwind class name).
2. **No new fonts.** Inter + JetBrains Mono only.
3. **Accent = `--brand`** for links, active states, focus rings, and progress fills. Don't overuse it;
   it should feel deliberate.
4. **Charts/data viz** (coverage bars, practice-exam trends) use `--brand` plus the `--chart-*` ramp.
5. Borders are subtle (`border-border`); elevation is mostly flat with hairline borders, not heavy
   shadows (developer-tool aesthetic).
