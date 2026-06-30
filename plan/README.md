# StudyBlog — Build Plan

This folder is the **complete, phased plan** for building StudyBlog: a single-author blog that
documents one person's journey from limited IT training to passing **CompTIA A+, Network+, and
Security+** — and doubles as an interview-ready portfolio piece.

It was assembled from primary research: a teardown of the working reference project
(`/home/nero/Clients/NextJs/kevincameron`), the locally-bundled Next.js 16 docs, the official
CompTIA exam objectives, the Auth.js + Cloudflare Workers compatibility landscape, and the broader
career plan in `/home/nero/Clients/Cousin`.

> **Status:** Planning complete. No application code written yet. The current repo is a stock
> `create-next-app` scaffold (Next 16.2.9 + React 19 + Tailwind v4).

---

## How to use this plan

1. **Read `00-overview.md` first** — the why, who, and what.
2. **Read the spec files (`01`–`07`)** before touching code. They are the source of truth for
   architecture, data, auth, content model, and design.
3. **Execute the `phases/` files in order.** Each phase has explicit **acceptance criteria** — do
   not advance until they pass.
4. **Obey the doc-reading discipline (below)** on every coding task.

## ⚠️ Golden rules (this is NOT the Next.js you remember)

The repo runs **Next.js 16**, deployed to **Cloudflare Workers via OpenNext** with **D1 (SQLite)**.
Several things differ from pre-16 muscle memory and from generic Node. Internalize these:

| Rule | Why |
|------|-----|
| **Read `node_modules/next/dist/docs/` before writing Next code.** Start with `01-app/02-guides/upgrading/version-16.md`. | `AGENTS.md` mandates it; v16 has breaking changes. |
| **`middleware.ts` → `proxy.ts`** (root-level), and it is **Node-runtime only** (no `edge`). | v16 rename. Auth uses it for *optimistic* redirects only. |
| **`cookies()`, `headers()`, `params`, `searchParams` are async** — always `await`. | Sync shims removed in v16. |
| **Never set `runtime = "edge"`.** OpenNext runs everything on the Node runtime. | Edge is unsupported on this target. |
| **D1 / R2 / KV are object bindings** — read via `getCloudflareContext().env.*`, **not** `process.env`. | `process.env` only holds string vars/secrets. |
| **No native bcrypt/argon2.** Hash passwords with `node:crypto.scrypt` + `timingSafeEqual`. | Native addons don't load on Workers. |
| **Stripe/webhook/crypto on Workers needs the async/fetch variants.** | Sync Node crypto variants silently fail. |
| **`pnpm run deploy`**, never `pnpm deploy`. | pnpm's built-in `deploy` shadows the script. |
| **Tailwind v4 is CSS-first** (`@theme` in `globals.css`, no `tailwind.config.js`). | v4 model. `@source not` exclusions are load-bearing. |
| **Re-verify auth + ownership inside every Server Action / Route Handler.** | They are public POST endpoints even if never imported. |

## File index

### Specs (the "what" and "why" — stable reference)
| File | Contents |
|------|----------|
| `00-overview.md` | Vision, audience, goals, scope, success criteria, tech-stack summary. |
| `01-product-spec.md` | Information architecture, page inventory, features, post types, admin & reader UX. |
| `02-architecture.md` | System architecture, runtime model, folder structure, rendering & caching strategy, the v16 conventions cheat-sheet. |
| `03-data-model.md` | D1 schema, Drizzle ORM models, relations, indexes, migrations, slug strategy. |
| `04-auth.md` | Auth.js v5 single-user design, scrypt hashing, proxy + DAL pattern, secrets, code patterns. |
| `05-content-taxonomy.md` | Cert sections, exam-domain categories (with `domainRef` codes + weights), tag vocabulary, post types, seed data. |
| `06-deployment.md` | Cloudflare/OpenNext/D1/R2/KV runbook, `wrangler.jsonc`, `open-next.config.ts`, env & secrets, image uploads, custom domain. |
| `07-design-system.md` | shadcn/ui + Tailwind v4 setup, theme tokens, typography, component inventory, accessibility. |

### Phases (the "how" and "when" — execution order)
| Phase | File | Goal |
|-------|------|------|
| 0 | `phases/00-foundation.md` | Repo hygiene, npm→pnpm, Cloudflare/OpenNext/D1 wiring, "hello world" deploy. |
| 1 | `phases/01-data-and-auth.md` | D1 schema + Drizzle + migrations + seed; Auth.js single-user login; guarded `/admin`. |
| 2 | `phases/02-content-crud.md` | Admin editor (CRUD/draft/publish), Markdown render pipeline, R2 image uploads, taxonomy management. |
| 3 | `phases/03-public-site.md` | Public blog: home, cert hubs, category/tag/type archives, post page, coverage tracker, journey timeline, search. |
| 4 | `phases/04-polish-seo-launch.md` | SEO (metadata/sitemap/robots/OG), RSS, design polish, performance, a11y, launch checklist. |
| 5 | `phases/05-stretch.md` | Optional: flashcards/spaced repetition, practice-exam analytics, newsletter, comments. |

## Current exam versions (factual baseline — verified mid-2026)

> The old A+ **220-1101/1102 retired Sep 2025**. Build against the current versions:

- **A+** — Core 1 **220-1201** + Core 2 **220-1202** ("V15", launched Mar 2025)
- **Network+** — **N10-009**
- **Security+** — **SY0-701** (watch for **SY0-801**, draft, tentative GA ~Nov 2026 — the data model pins an `exam` version per post so a future version slots in cleanly)
