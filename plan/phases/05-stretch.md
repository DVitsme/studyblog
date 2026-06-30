# Phase 5 — Stretch (optional, post-launch)

Ship Phases 0–4 first. These are independent enhancements — pick by value to the **dual purpose**
(study retention + interview proof). Each should stay within the simplicity/cost constraints in
`00-overview.md`.

---

## High value (study + interview)
- **"How I built this" project post** + a public, clean GitHub repo. The app itself is a portfolio
  artifact ("interviewers talk to him about his process building his projects"). Low effort, high
  payoff. *(Could fold into Phase 4 content.)*
- **Flashcards / spaced repetition.** Lightweight: a `cram`-type post can declare Q/A pairs (Markdown
  convention or a `flashcards` JSON column); render a study widget; optional localStorage SRS
  scheduling. Directly serves exam review.
- **Practice-exam analytics.** Structure `practice-exam` posts (score, per-domain breakdown) and
  chart progress over time per exam (`recharts`, already in the reference stack). Visible improvement
  = great interview story + motivation.
- **Full-text search via D1 FTS5.** Upgrade Phase 3's `LIKE` search to an FTS5 virtual table for fast,
  ranked search as content grows.

## Engagement / reach
- **Newsletter.** Resend + `@react-email/components` (both in the reference stack) for a simple
  "new post" broadcast; double opt-in; CAN-SPAM footer. Add a subscribe form (Turnstile-gated).
- **Comments.** Either a Turnstile-gated `comments` table with owner moderation, or a vendor
  (giscus/Cohost-style) to avoid moderation overhead. Defer unless wanted.
- **Syndication helper.** One-click "copy canonical + cross-post" to dev.to/LinkedIn from the admin.

## Authoring quality-of-life
- **Scheduled publishing** (`published_at` in the future + a cron Worker / DO alarm to flip status).
- **Draft preview links** (signed, time-limited URL to share a draft).
- **Revision history** (a `post_revisions` table; diff/restore).
- **Image alt-text + dimension capture** on upload (store `width`/`height`/`alt`), and optional
  `aws4fetch` **presigned uploads** for large media (keeps bytes out of the Worker).
- **MDX-from-DB** via `next-mdx-remote/rsc` *only if* posts need interactive embeds (subnet
  calculator, inline quiz) — adds JS-execution surface; gate to trusted single-author content
  (`02-architecture.md` §4.1).

## Ops / trust
- **Privacy-friendly analytics** (Cloudflare Web Analytics — free, no cookies) to show traffic in
  interviews without a heavy script.
- **Cloudflare Access** in front of `/admin` as edge-level defense-in-depth (`04-auth.md` §11).
- **Backups:** scheduled `wrangler d1 export` of the DB + R2 lifecycle/retention.
- **Error monitoring** via Workers `observability` (already enabled) + log alerts.

## Selection guidance
If forced to pick three first: **(1)** flashcards/SRS, **(2)** practice-exam analytics, **(3)** the
"How I built this" post + repo. They maximize the study-retention and interview-proof goals with the
least ongoing maintenance.
