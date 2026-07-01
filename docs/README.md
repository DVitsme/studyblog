# Architecture & Patterns Handbook

This folder is the **map** of the codebase. Read these ~6 docs instead of the ~40 source files: they
explain *what the moving parts are, why they're built this way, and where the canonical code lives* —
enough to extend the app or **reuse it as a template for a new Next.js-on-Cloudflare project**.

> Audience: a developer (or a future Claude) who has never seen this repo. Every doc names the
> **canonical files** for its pattern so you can jump straight to the source when you need detail.

## What this app is

A **single-author blog + admin CMS** (StudyBlog — one person documenting a CompTIA study journey),
running entirely on **Cloudflare Workers**. One owner logs in and writes Markdown posts; everyone else
reads the rendered, statically-fast public pages. There is no multi-user system by design.

The interesting part for reuse isn't the blog — it's the **stack integration**: Next.js 16 App Router
(RSC + Server Actions) compiled to a Cloudflare Worker via OpenNext, backed by D1 (SQLite) through
Drizzle, with single-owner Auth.js, and server-side Markdown/Shiki rendering that stays under the
Workers size + startup limits. Those integrations have sharp edges; this handbook records the ones
that cost real time to solve.

## The stack (versions matter — this is "not the Next.js you know")

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2** App Router, RSC, Turbopack | Server Components by default; Server Actions for mutations |
| UI | **React 19.2**, **Tailwind CSS v4** (CSS-first `@theme`), **shadcn/ui** (new-york) | React 19 shape: ref-as-prop, `data-slot`, unified `radix-ui` pkg |
| Runtime | **Cloudflare Workers** via **@opennextjs/cloudflare** (OpenNext) | NOT the Node/Vercel runtime — workerd. No Node middleware. |
| Data | **D1** (SQLite) + **Drizzle ORM** | Per-request client; migrations in `migrations/` |
| Auth | **Auth.js v5** (`next-auth@5-beta`), Credentials, single owner | JWT sessions; scrypt password hashing; **no `proxy.ts`** |
| Content | **unified/remark/rehype** + **Shiki** (JS engine, **vendored grammars**) | Rendered server-side to sanitized HTML |
| Validation | **zod v4** | Note v4 API differences (see data doc) |
| Icons/misc | lucide-react **1.x** (renamed icons), next-themes, sonner | |

## Read in this order

1. **[architecture.md](./architecture.md)** — the runtime model (RSC → Worker → D1), request lifecycle,
   why there's no middleware, and the file layout. *Start here.*
2. **[auth.md](./auth.md)** — the single-owner Auth.js pattern: layout + DAL + per-action gate, scrypt,
   and login rate-limiting.
3. **[data-and-content.md](./data-and-content.md)** — Drizzle-on-D1 (per-request client, queries,
   **atomic `db.batch` mutations**) and the **Markdown/Shiki pipeline** (vendored grammars, sanitize-early).
4. **[admin-cms.md](./admin-cms.md)** — the admin UI patterns: AdminShell, **Server Actions + zod +
   `requireOwner`**, and the Markdown editor with a **Route-Handler live preview**.
5. **[deployment-and-gotchas.md](./deployment-and-gotchas.md)** — how to build/deploy to Workers
   (the `--no-autoconfig` fix), secrets/bindings, and the catalogue of hard-won gotchas.

## The 5 things most likely to bite you (full list in the gotchas doc)

1. **Deploy silently no-ops** unless you run `wrangler deploy --no-autoconfig` (wrangler ≥4.101
   auto-delegates to OpenNext and short-circuits the upload). `pnpm deploy` already encodes this.
2. **Shiki drags all ~250 grammars** (15 MB worker) if you import `shiki`/`@shikijs/rehype`. We import
   `@shikijs/core` + **vendored grammars** + a hand-rolled rehype transformer. An ESLint rule guards it.
3. **No `proxy.ts`/middleware** — OpenNext doesn't support Next 16 Node middleware, so auth is gated in
   the `/admin` layout + a DAL + every Server Action. Don't add middleware for auth.
4. **D1 has no interactive transactions** — multi-statement mutations use `db.batch([...])` for atomicity.
5. **lucide-react 1.x renamed icons** — `CircleCheck` not `CheckCircle`, `EllipsisVertical` not
   `MoreVertical`, etc. Verify names against `node_modules/lucide-react` before importing.

## Reusing this as a template

Keep: the OpenNext + wrangler config, the auth pattern (`auth.ts` + `lib/auth/`), the per-request DB
client (`lib/db/`), the Shiki pipeline (`lib/content/`), the AdminShell + Server-Action patterns, the
ESLint guard, and `pnpm deploy`. Swap: the D1 schema (`lib/db/schema.ts` + `migrations/`), the taxonomy
(`lib/taxonomy.ts`), the site identity (`lib/site.ts`), and the design tokens (`app/globals.css`).
First-run setup for a new project is in **[deployment-and-gotchas.md](./deployment-and-gotchas.md)**.

> The `plan/` folder holds the original phased build plan + the full design handoff (mockups, component
> specs). This `docs/` folder is the *post-build* distillation — trust `docs/` for how it actually works.
