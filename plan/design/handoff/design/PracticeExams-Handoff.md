# StudyBlog — Practice Exam Tracking (Handoff)

> A new public proof-of-work artifact + admin entry flow. Mockup: `StudyBlog Practice Exams.dc.html`
> (Public chart / Admin log-entry switcher · theme · desktop + mobile). Bodies:
> `PracticeExamBody.dc.html` (public) + `PracticeExamAdminBody.dc.html` (admin). Token-named; both
> themes via `.dark`. Chart uses the `--chart-*` ramp + `--brand`.

---

## 0. Data shape (decided)

**One row per attempt** — a flat, append-only `PracticeAttempt` record. This is the recommended shape;
everything on both screens derives from it.

```ts
type PracticeAttempt = {
  id: string;
  examCode: 'a-plus-core-1' | 'a-plus-core-2' | 'security-plus' | 'network-plus'; // which exam
  testName: string;        // e.g. "Dion Practice Test 3"           (required)
  provider: string;        // "Jason Dion · Udemy" | "Professor Messer" | "CompTIA CertMaster" | …
  date: string;            // ISO date (yyyy-mm-dd) — shadcn date picker  (required)
  scorePercent: number;    // 0–100, the pasted score                     (required)
  // --- optional, richer proof of work (recommended, all nullable) ---
  scaledScore?: string;    // "765/900"  (CompTIA 100–900 scale)
  questionsCorrect?: number;
  questionsTotal?: number;
  durationMinutes?: number;
  weakestDomain?: string;  // ties to the exam's official domains → "study next" signal
  notes?: string;
};
```

**Derived per cert/exam (computed, not stored):**
- `passPercent` per exam = the real CompTIA cut score as a % of 900 — **A+ 675/900 (75%)**,
  **Security+ 750/900 (83%)**, **Network+ 720/900 (80%)**. Drives the chart's dashed pass line. Keep
  this in a small static `EXAM_META` map (label + passScaled + domains), not on every row.
- Stats (latest, best, attempts, trend Δ), the trend series, and the table all derive from the
  attempt list filtered by cert.

**Why this shape:** append-only rows are trivial to log from the admin form, the chart/table are pure
projections of them, and the optional fields add interview-grade depth (scaled score, weakest domain,
time) without complicating the required path (exam + test + date + score).

**Additional fields I added beyond the ask (recommended, all optional):** `provider`, `scaledScore`,
`questionsCorrect/Total`, `durationMinutes`, `weakestDomain`, `notes`. `weakestDomain` is the most
valuable — it connects practice results back to the domain-coverage system ("write/study next").

---

### Screen: Practice scores (public)  (route: /journey/practice-scores)
- **Layout:** SiteHeader → `max-w-[1080px] mx-auto px-5 pt-8 pb-14`: breadcrumb → intro → **cert tabs**
  → stat cards → **trend chart** → **attempts table** → footnote. SiteFooter. Lives under Journey.
- **Component tree:**
  - **CertTabs** → shadcn `tabs` (A+ / Security+ / Network+); A+ plots two lines (Core 1 + Core 2).
  - **StatCards** ×4 → `stat-card.tsx` (reused from admin §33): Latest score · Best score (brand/
    `--chart-2` if ≥ pass) · Attempts · Trend Δ (`--chart-2` up / `--destructive` down).
  - **ScoreTrendChart** → `NEW: components/site/score-trend-chart.tsx`: inline **SVG line chart**.
    y-axis 50–100% gridlines (mono labels); **dashed pass line** at the exam cut score; one
    **polyline per examCode** colored from the `--chart-*` ramp (Core 1 `--chart-1`, Core 2
    `--chart-2`, Sec+ `--chart-3`, Net+ `--chart-4`); circle markers (`fill var(--card)` stroke chart
    color); x-axis = attempt dates; legend (per-exam swatch + pass-line key). Shared date axis across
    a cert's exams so points align in time. **States:** ≥2 points → trend line; 1 point → single
    marker; **0 → empty state** ("No practice tests logged yet").
  - **AttemptsTable** → shadcn `table`: Date · Practice test (+ provider) · Exam (mono chip) · Score
    (% `font-mono`, `--chart-2` if ≥ pass, + scaled below) · **Δ vs previous same-exam attempt**
    (`--chart-2`/`--destructive`/`—`) · Weakest domain. Horizontal scroll on narrow.
  - footnote explaining the 100–900 scale + pass line.
- **Token/viz:** chart strokes `--chart-1…4`; pass line + grid `var(--muted-foreground)`/`var(--border)`;
  markers `var(--card)`. No new colors. Mark the SVG `data-om-raster` for PPTX export.
- **States:** populated (A+/Sec+) · empty (Net+ "just started") · (loading → skeleton chart + rows).
- **A11y:** chart has an accessible `<title>`/`<desc>` + the table is the text-equivalent (never
  color-only — scores are labelled); tabs keyboard-navigable; AA contrast both themes.
- **Responsive:** SVG scales via `viewBox` (`width:100%`); stat cards + legend wrap; table scrolls-x
  on mobile.
- **Dev notes:** **Server Component** — chart + table are pure projections of the attempts (build-time
  or request-time from the store). Only CertTabs is a tiny client island. Render the SVG server-side
  (no client charting lib needed); if you prefer a lib, Recharts/visx with the same tokens is fine.

---

### Screen: Log a practice test (admin)  (route: /admin/practice-exams/new · /[id]/edit)
- **Layout:** AdminShell (now has a **Practice exams** nav item) → page header (h1 + "View public
  chart") → two columns: **entry form** (`basis-[380px]`) + **Recent attempts** list (`basis-[300px]`).
- **Component tree:**
  - **AdminShell** — `active:'practice'` (nav item added: lucide `bar-chart-2`).
  - **PracticeForm** → `NEW: components/admin/practice-form.tsx`:
    - **Which exam** `select` (required) — the 4 examCodes.
    - **Practice test name** `input` (required) + **Provider** `select` (create-on-the-fly allowed).
    - **Date taken** → **shadcn date picker** (required): `button` trigger (`calendar` icon + formatted
      date) opening a `popover` `calendar` (month nav + day grid, selected day `bg-brand
      text-brand-foreground`). *(mockup shows the popover open.)*
    - **Score %** number `input` (required, paste the score) with `%` suffix.
    - **Optional** (dashed-divider section): Scaled score, Questions correct/total, Time spent,
      **Weakest domain** `select` (options = the chosen exam's official domains), Notes `textarea`.
    - Actions: `Button{primary}` "Save attempt" + `Button{secondary}` "Save & add another".
  - **RecentAttempts** → compact list (score `font-mono` + test + `exam · date` + row-action
    `dropdown-menu`: Edit / Delete).
- **States:** default · focus (brand ring) · **required-field** validation (error `border-destructive`
  + helper) · date-picker open/closed · provider/weakest-domain create · saving (spinner) · saved
  (`sonner` toast). Category-style dependency: **Weakest-domain options depend on the selected exam**.
- **Token/register:** admin density — `h-9` controls, `text-sm` labels, brand only on primary action,
  the date picker's selected day, and required asterisks.
- **A11y:** labelled inputs; required marked; date picker keyboard-operable (Radix calendar); toast
  on save.
- **Responsive:** form fields wrap to single column; date popover anchors to trigger; Recent list
  drops below the form on `sm`.
- **Dev notes:** **Client component** — controlled form state, the **date picker** (`react-day-picker`
  via shadcn `calendar` + `popover`), provider/weakest-domain comboboxes, and submit. On save, append a
  `PracticeAttempt` row; the public chart/table re-derive. Weakest-domain `select` is repopulated from
  `EXAM_META[examCode].domains` when the exam changes.

## Screen index additions (DESIGN-HANDOFF §2)
| Practice scores | `/journey/practice-scores` | ✅ `StudyBlog Practice Exams.dc.html` | SiteHeader · CertTabs · StatCards · ScoreTrendChart · AttemptsTable · SiteFooter |
| Practice exams (admin) | `/admin/practice-exams/new` · `/[id]/edit` | ✅ `StudyBlog Practice Exams.dc.html` | AdminShell(practice) · PracticeForm(date-picker) · RecentAttempts |

## Component addendum — add to Component-Library-Sheet.md
- **ScoreTrendChart** — `components/site/score-trend-chart.tsx` *(built)*: SVG line chart, `--chart-*`
  series + dashed pass line, `viewBox` responsive, markers, legend; empty/single-point states; Server.
- **PracticeForm** — `components/admin/practice-form.tsx` *(built)*: the log-entry form incl. shadcn
  date picker (`calendar`+`popover`); exam→weakest-domain dependency; client. `EXAM_META` static map
  holds per-exam label/passScaled/domains.
- **AdminShell** — gains a 4th nav item **Practice exams** (`active:'practice'`).

## Open questions
- Q14 **Exam cut scores** — confirm A+ 675 / Sec+ 750 / Net+ 720 (of 900) for the pass lines, and
  whether to show the pass line as scaled or % (mockup shows both).
- Q15 **Score input** — store percent, scaled, or both? (Form captures % required + scaled optional;
  chart uses %.) 
- Q16 **Weakest-domain source** — reuse the same domain lists that power CoverageChecklist so practice
  weak spots can cross-link to "write/study next"?
