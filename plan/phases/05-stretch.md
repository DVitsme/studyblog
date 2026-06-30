# Phase 5 — Stretch (post-launch enhancements)

Ship Phases 0–4 first. These are independent enhancements — pick by value to the **dual purpose**
(study retention + interview proof), within the simplicity/cost constraints in `00-overview.md`.

---

## ⭐ Practice Exam Tracking (DESIGNED — implement first if pulling any stretch forward)

A new public proof-of-work artifact (a score-trend chart) + an admin log-entry flow. **Fully designed.**

> **UI source of truth:** `plan/design/handoff/design/PracticeExams-Handoff.md` + `StudyBlog Practice
> Exams.dc.html` (`PracticeExamBody` public · `PracticeExamAdminBody` admin).

**Data model — `practice_attempts` (append-only, one row per attempt):**
`id` · `exam_code` (`a-plus-core-1|a-plus-core-2|security-plus|network-plus`) · `test_name` ·
`provider` · `date` (ISO) · `score_percent` (0–100) · optional `scaled_score` ("765/900") ·
`questions_correct`/`questions_total` · `duration_minutes` · `weakest_domain` · `notes`. Add to
`lib/db/schema.ts` + a migration (`03-data-model.md` workflow). A static **`EXAM_META`** map holds per
exam: label, **pass cut score** (A+ 675 / Security+ 750 / Network+ 720 of 900 — Q14) and the official
domain list (reused for the `weakest_domain` select — Q16). Store **% (required) + scaled (optional)**
— chart uses % (Q15).

**Public `/journey/practice-scores`** (lives under Journey): `CertTabs` (A+ plots Core 1 + Core 2) →
`StatCards`×4 (latest / best / attempts / trend Δ) → **`ScoreTrendChart`** `components/site/score-trend-chart.tsx`
(server-rendered **SVG** line chart: `--chart-*` series + dashed pass line at the cut score, markers,
legend; empty / single-point states) → `AttemptsTable` (date / test+provider / exam / score / Δ vs
previous / weakest domain). Server Component (pure projection of the attempts); `CertTabs` is a small
client island. No client charting lib needed.

**Admin `/admin/practice-exams/new` · `/[id]/edit`**: `AdminShell` gains a **Practice exams** nav item.
`PracticeForm` `components/admin/practice-form.tsx` (client): exam `select` (required) → test name +
provider (create-on-the-fly) → **date picker** (shadcn `calendar`+`popover`) → score % → optional
section (scaled, questions, time, **weakest domain** `select` from `EXAM_META[exam].domains`, notes) →
Save / Save & add another. `RecentAttempts` list with edit/delete. On save, append a row; the public
chart/table re-derive. Guard with `requireOwner()`.

> Reinforces the study loop (weak-domain → "study/write next", cross-linking to the coverage system)
> and gives interview-grade "visible improvement" proof. High value, moderate effort.

---

## Other high-value items (study + interview)
- **"How I built this" project post** + a clean public GitHub repo (the app itself is a portfolio
  artifact). Low effort — could fold into Phase 4 content.
- **Flashcards / spaced repetition.** A `cram`-type post declares Q/A pairs (a `flashcards` JSON
  column or Markdown convention); render a study widget; optional localStorage SRS.
- **Full-text search via D1 FTS5.** Upgrade Phase 3's `LIKE` search to a ranked FTS5 virtual table.
- **⌘K command palette** (shadcn `command`) as a second search surface alongside `/search`.

## Engagement / reach
- **Newsletter** (Resend + `@react-email/components`, both in the reference stack): "new post"
  broadcast, double opt-in, CAN-SPAM footer, Turnstile-gated subscribe form.
- **Comments** — Turnstile-gated `comments` table with owner moderation, or a vendor (giscus). Defer.
- **Syndication helper** — one-click copy canonical + cross-post to dev.to/LinkedIn from admin.

## Authoring quality-of-life
- **Scheduled publishing** (`published_at` future + a cron Worker / DO alarm).
- **Draft preview links** (signed, time-limited).
- **Revision history** (`post_revisions` table; diff/restore).
- **Autosave** (Q11: debounce cadence + "saved 2h ago" provenance) and presigned R2 uploads via
  `aws4fetch` for large media.

## Ops / trust
- **Cloudflare Web Analytics** (free, cookieless) — traffic proof for interviews.
- **Cloudflare Access** in front of `/admin` as edge defense-in-depth (`04-auth.md` §11).
- **Backups:** scheduled `wrangler d1 export` + R2 lifecycle.

## Selection guidance
If pulling stretch work forward, do **(1) Practice Exam Tracking** (designed, high proof-of-work value),
then **(2) flashcards/SRS**, then **(3) the "How I built this" post + repo**. They maximize study
retention and interview proof with the least ongoing maintenance.
