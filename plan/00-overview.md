# 00 — Overview & Vision

## One-liner

A fast, single-author blog where one person publicly documents their study journey toward
**CompTIA A+ → Security+ (→ Network+)**, organized so the material is easy to review *and* easy for
a hiring manager to skim as proof of work.

## Who this is for

The author is a **career-changer transitioning into IT** (background outside tech), living near
**Fort Meade, MD** — the densest cleared-IT job market in the US. He is studying for CompTIA certs
while working long hours, and is building a **portfolio of security projects** in parallel. Context
comes from the broader career plan in `/home/nero/Clients/Cousin`.

**Study sequence & timeline (drives the content roadmap):**

| Cert | Role in his plan | Rough target |
|------|------------------|--------------|
| **A+** (Core 1 220-1201 + Core 2 220-1202) | Entry credential; two exams | ~Oct 2026 |
| **Security+** (SY0-701) | The DoD 8570/8140 IAT-II **gate** that unlocks cleared roles | ~Dec 2026 |
| **Network+** (N10-009) | Optional / later for his path (not required for cleared help-desk) | After Sec+ |

> Implication: **A+ and Security+ are first-class; Network+ is present but lighter.** The UI must not
> imply all three are equally far along. A per-exam progress/coverage indicator handles this honestly.

## The dual purpose (this shapes every decision)

This is **not** just a blog. It serves two audiences at once:

1. **The author, as a study/review system.** Writing a topic in his own words ("explain it back") is
   the highest-leverage way to retain it. The blog is where notes, labs, and practice-exam
   post-mortems live, searchable by concept.
2. **Interviewers, as proof of work.** A public, timestamped, steadily-updated blog is
   hard-to-fake evidence of (a) genuine learning, (b) the #1 screened soft skill — **written
   communication**, and (c) follow-through during the long gap before the first cleared paycheck.
   Each project write-up is a **pre-written STAR interview story**.

3. **Meta-bonus:** the fact that he *built this app himself* (Next.js, edge deploy, auth, a database)
   is itself a portfolio talking point. So the codebase should be clean and the build worth a
   "How I built this" write-up. ("Interviewers talk to him about his process building his projects.")

## Goals & success criteria

A build is successful when:

- **Publishing is frictionless.** Owner logs in, writes Markdown, adds taxonomy + a cover image,
  hits Publish. No redeploy, no Git commit required to publish a post.
- **The output looks credible & professional.** Clean typography, fast loads, visible publish dates,
  reading time, and a steady cadence (an archive that shows consistent shipping).
- **The material is navigable three ways:** by **cert** (A+/Net+/Sec+), by **exam domain**
  (category), and by **concept** (tags that intentionally cross certs, e.g. `firewalls`, `pki`).
- **Progress is visible & honest:** a per-exam **"% of objectives covered"** tracker, driven by which
  official domains have published posts.
- **It supports portfolio storytelling:** dedicated **project write-ups** (the vuln-management /
  GRC-STIG / detection-lab series) with a fixed, scannable structure and metrics.
- **It is cheap and low-maintenance:** runs on Cloudflare's free/near-free tier (Workers + D1 + R2),
  no servers to babysit.

## Primary user stories

**Owner (authenticated):**
- Log in securely (single account, no public sign-up).
- Create / edit / preview / save-draft / publish / unpublish a post written in Markdown.
- Assign a post to a cert **section**, an exam-domain **category**, a **type**, and **tags**.
- Upload a cover image / inline images.
- See at a glance which exam objectives still have no post (to guide what to write next).

**Reader / interviewer (public):**
- Land on a clear homepage that explains the journey and routes to the three certs.
- Browse a cert hub → drill into a domain → read a post.
- Follow a concept across certs via tags.
- Read project write-ups as standalone, polished case studies.
- See an "About / the journey" page and a progress snapshot.
- Subscribe via RSS.

## Scope

**In scope (v1, Phases 0–4):**
- Public blog + cert/domain/tag/type navigation.
- Single-owner auth + admin CMS (Markdown editor, taxonomy, image upload, draft/publish).
- Objectives coverage tracker; journey/now page; project write-up format.
- SEO (metadata, sitemap, robots, OG images), RSS, accessibility, performance.

**Out of scope at launch (candidate Phase 5 / later):**
- Multi-user / public sign-up (it is deliberately single-author).
- Public comments (moderation overhead; can add later via a vendor or Turnstile-gated form).
- Newsletter/email broadcasts (Resend is available in the stack if desired later).
- Flashcards / spaced-repetition, practice-exam analytics dashboards.
- Payments (Stripe is in the reference env but **not** used here).

## Constraints (keep it simple)

- **The author writes every word himself** — the tooling assists, it does not generate content. The
  app's job is frictionless capture + credible presentation.
- **Time-poor author.** Favor a small number of well-built features over breadth. One-post-per-week
  cadence is the realistic rhythm; the app should make that easy and visible.
- **Low budget.** Stay on Cloudflare's free/cheap tiers. No paid SaaS required to run.
- **Solo maintainer.** Conventional, well-documented patterns over clever ones.

## Tech stack (pinned to the working reference)

We deliberately mirror `kevincameron` so deployment is a known-good path. See `02-architecture.md`
for detail and `06-deployment.md` for the runbook.

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16.2.x** (App Router, RSC) + **React 19.2** |
| Language | TypeScript 5 (strict) |
| Styling | **Tailwind CSS v4** (CSS-first) + **shadcn/ui** (new-york) + `lucide-react` + `motion` |
| Hosting | **Cloudflare Workers** via **OpenNext** (`@opennextjs/cloudflare` v1.x) |
| Database | **Cloudflare D1** (SQLite) via **Drizzle ORM** (`drizzle-orm/d1`) |
| Auth | **Auth.js v5 (NextAuth)** — Credentials + JWT, single owner, `node:crypto` scrypt |
| Media | **Cloudflare R2** (uploads) + the Cloudflare `IMAGES` binding for `next/image` |
| Content | **Markdown** stored in D1, rendered server-side (`remark`/`rehype`), cached with `use cache` |
| Email (opt.) | Resend (available; only if a contact form / newsletter is added) |
| Bot defense (opt.) | Cloudflare Turnstile (only if a public form is added) |
| Package manager | **pnpm** (the repo currently has an npm lockfile — migrate in Phase 0) |
| Node | 20.9+ required by Next 16 (local is 22.x — fine) |

**Why this stack:** it is the exact, already-working toolchain of the sibling project, so the riskiest
part (Next 16 on Cloudflare via OpenNext) is de-risked. The only net-new pieces vs. the reference are
**auth**, a **multi-table content schema**, an **admin editor**, and **R2 uploads** — each researched
and specified in the files that follow.

## How the plan is organized

- **Specs `01`–`07`** are the durable design. Read them before coding; update them if a decision
  changes during the build.
- **Phases `00`–`05`** are the execution sequence with acceptance criteria.
- The **doc-reading discipline** (`README.md` → Golden rules) is mandatory: before implementing any
  Next.js feature, read the matching page under `node_modules/next/dist/docs/`. Exact paths are cited
  throughout `02-architecture.md`.
