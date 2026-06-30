# StudyBlog — Error & Not-Found Pages (Handoff)

> Handoff blocks for the 404 and error-boundary pages, exact format from
> `components-tech-and-handoff-spec.md`. Mockup: `StudyBlog Error Pages.dc.html` (404 / Error-boundary
> switcher · theme · desktop + mobile). Body: `ErrorPagesBody.dc.html` (`variant: notFound | error`).
> Token-named; both themes via `.dark`. Reuses `SiteHeader` + `SiteFooter`.

---

### Screen: Not found (404)  (file: app/not-found.tsx)
- **Layout:** SiteHeader → centered column (`flex-1 grid place-items-center text-center
  max-w-[620px] mx-auto px-5 py-18`) → SiteFooter. Renders for any unmatched route + manual
  `notFound()` calls (e.g. unknown slug/tag/category).
- **Component tree:**
  - **SiteHeader** — `active` = none.
  - **ErrorState(404)** → `NEW: components/site/error-state.tsx` (variant `notFound`): mono kicker
    "Page not found" (`text-brand uppercase`) · big `404` (`font-mono text-[92px]/600`) · h1
    ("This page wandered off the syllabus.") `text-3xl/600 text-balance` · body `text-lg muted
    max-w-[52ch]` · actions: `Button{primary}` "Back to home" (`/`) + `Button{ghost}` "Browse the
    archive" (lucide `home`) · **helpful links** list (`/`, `/journey`, `/security-plus`, `/search`)
    as bordered rows (mono path in brand + label + `arrow-right`), hover `border-brand`.
- **Typography:** `404` mono 92px; h1 Inter `text-3xl/600`; body `text-lg`; link paths/labels mono+sans.
- **Icons:** `home`, `arrow-right`.
- **States:** single static state; link rows hover/focus (brand).
- **A11y:** `<main>` landmark; h1 present; focusable links; AA contrast both themes; correct **HTTP
  404** status (App Router sets it for `not-found`).
- **Dev notes:** **Server Component** (static). Next.js renders this for `notFound()` + unmatched
  routes. The helpful-links set is site-config (same source as nav/footer).

---

### Screen: Error boundary (500)  (file: app/error.tsx — and nested segment error.tsx)
- **Layout:** identical centered shell. Catches runtime render errors in its route segment.
- **Component tree:**
  - **ErrorState(error)** → same `error-state.tsx` (variant `error`): kicker "Something broke" · big
    `500` · h1 ("That didn't go to plan.") · body (logged, try again, digest) · actions:
    `Button{primary}` **"Try again"** → calls `reset()` + `Button{ghost}` "Back to home" · **digest
    panel** (`bg-muted border-border rounded-lg`): `digest: <error.digest> · <route>` mono + Copy
    button + "report it" link.
- **Typography:** as 404; digest mono `text-xs`.
- **Icons:** `home`, `copy`, (optional `rotate-cw` on Try again).
- **States:** default; Try-again hover/focus; copy default/copied (toast).
- **A11y:** `role="alert"` on the heading region; Try-again is a real button with discernible name;
  digest is selectable text.
- **Dev notes:** **Client Component** (required — `error.tsx` must be `'use client'` and receives
  `{ error, reset }`). "Try again" = `reset()`; show `error.digest` (never the raw stack) in the
  panel; "report it" links to the issue/report channel. A **global-error.tsx** (root) reuses the same
  ErrorState for the rare case the root layout throws (must render its own `<html><body>`).

---

## Component addendum — ErrorState  → add to Component-Library-Sheet.md
**ErrorState** — `components/site/error-state.tsx`  *(built)*
- **Props:** `variant:'notFound'|'error'`, `error?` (digest/route for the error variant), `reset?` (cb).
- **Composition:** mono kicker + big mono code (`404`/`500`, `text-[92px]/600`) + h1
  (`text-3xl/600 text-balance`) + body (`text-lg muted max-w-[52ch]`) + action row (primary + ghost) +
  variant tail (notFound → helpful-links list; error → digest panel + report link).
- **Tokens:** centered, `text-balance`; primary `bg-primary`; links/paths `text-brand`; panels
  `bg-muted`/`bg-card border-border rounded-lg`.
- **States:** notFound (static, link hover `border-brand`) · error (Try-again hover/focus, copy
  copied). **Responsive:** actions + links wrap on `sm`; unchanged otherwise.
- **Maps to:** new file; uses shadcn `button`. **Dev:** notFound = Server; error = Client (`reset`).

## Screen index addition (DESIGN-HANDOFF §2 · Public)
| Not found | `app/not-found.tsx` | ✅ `StudyBlog Error Pages.dc.html` | SiteHeader · ErrorState(404) · SiteFooter |
| Error boundary | `app/error.tsx` (+ `global-error.tsx`) | ✅ `StudyBlog Error Pages.dc.html` | SiteHeader · ErrorState(error, reset) · SiteFooter |
