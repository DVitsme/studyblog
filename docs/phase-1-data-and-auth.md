# Phase 1 — Data layer + single-owner auth

**Goal:** the D1 schema migrated + seeded, and the single owner able to log in to a gated `/admin`. No
content UI yet — just the secure shell + data layer. **Landed in `db218a5` "Phase 1: D1 data layer
(Drizzle) + single-owner auth (Auth.js v5)".** Plan: `plan/phases/01-data-and-auth.md` (+ `03-data-model`,
`04-auth`, `05-content-taxonomy`).

> Reconciled against the plan by a git-verified pass. For the deep patterns see
> [data-and-content.md](./data-and-content.md) (Drizzle/D1) and [auth.md](./auth.md).

## What Phase 1 established (vs. what Phase 2 later touched)

Phase 1 is remarkably stable: after `db218a5`, **only 6 of its files changed** — `auth.ts` (rate limit),
`lib/db/queries.ts` (admin queries), `app/admin/page.tsx` (real dashboard), `app/admin/layout.tsx`
(AdminShell), `app/login/page.tsx` (LoginCard), `app/login/actions.ts` (rate_limited message).
**Everything else** — the schema, migrations, seed, DB client, taxonomy, `password.ts`, `dal.ts`,
`auth.ts`'s core, the `[...nextauth]` route, `logout`, `cloudflare-secrets.d.ts`, `drizzle.config.ts` —
is byte-identical to Phase 1.

## What landed

### Data model (`lib/db/schema.ts`)

Six tables: **sections** (cert; PK `slug`) → **domains** (exam objective; `domain_ref` unique, FK→sections,
index `(section_slug, sort)`) → **posts** (Markdown in `body_md`; `slug` unique; FK→sections + nullable
FK→domains; 4 indexes incl. `(status, published_at)`; **CHECK constraints** on `type` + `status`) →
**tags** (`slug` unique) / **post_tags** (composite PK, both FKs **ON DELETE CASCADE**) → **media**
(PK `key`). Booleans + timestamps are `integer` modes (timestamps = **Unix seconds**, default
`unixepoch()`). `relations()` + exported row types (`Post`, `NewPost`, …). Enums come from
`lib/taxonomy.ts` (imported by a **relative** path so drizzle-kit resolves it during `db:generate`).

### Migrations & seed

- **`0000_boring_risque.sql`** — creates the 6 tables + indexes (posts **without** CHECKs).
- **`0001_light_blonde_phantom.sql`** — the **CHECK-constraint migration**: SQLite can't
  `ALTER … ADD CHECK`, so drizzle-kit emits the 12-step table rebuild (create `__new_posts` with
  `posts_type_chk` + `posts_status_chk`, copy, drop, rename, recreate indexes).
- **`db/seed-domains.sql`** — idempotent `INSERT OR IGNORE`: **4 sections** (`a-plus`, `security-plus`,
  `network-plus`, `journey`) + **19 official domains** (A+ Core1 ×5, Core2 ×4, Net+ ×5, Sec+ ×5).
  Tags are intentionally **not** seeded (owner-extensible vocabulary).

### DB access & queries

`lib/db/index.ts` — `getDb()` = per-request `drizzle(getCloudflareContext().env.DB, { schema })`
(never a module singleton). Phase 1 shipped **three** reads: `listSections`, `listDomains(exam)`, and
`coverageByExam()` (the signature coverage metric; two aggregates run via `Promise.all`). The rest of
`queries.ts` is Phase 2.

### Auth (single owner)

- `lib/auth/password.ts` — scrypt (`N=16384,r=8,p=1`, `KEYLEN=32`), format
  **`scrypt:<saltB64url>:<hashB64url>`**, `timingSafeEqual`, **fail-closed** length check.
- `auth.ts` — NextAuth **async config factory** reading Worker secrets from
  `getCloudflareContext({ async: true }).env`; Credentials + JWT, `trustHost: true`; a `DECOY_HASH` so
  `authorize` runs scrypt **constant-time** even on a wrong email (anti-enumeration). "Any valid session
  IS the owner" — no `role`, no jwt/session callbacks.
- `lib/auth/dal.ts` — `requireOwner()` (`import "server-only"`, `cache()`, redirect to `/login`).
- Gated `/admin` layout + a placeholder dashboard (reads `coverageByExam`); `logout` action.
- `app/api/auth/[...nextauth]/route.ts` (`export const { GET, POST } = handlers`), login page/action
  (`useActionState` + `AuthError`), `cloudflare-secrets.d.ts` (secret **names** only: `AUTH_SECRET`,
  `AUTH_OWNER_EMAIL`, `AUTH_OWNER_HASH`, + optional `AUTH_URL`/`AUTH_TRUST_HOST`). Deps added:
  `next-auth 5.0.0-beta.31` (pinned) + `zod ^4.4.3`.

## Plan vs. what landed (deviations)

| Plan said | Reality | Note |
|---|---|---|
| A `proxy.ts` for the `/admin` redirect (referenced in `04-auth` §1/§3/§10 + acceptance) | **No `proxy.ts`/middleware exists** | OpenNext 1.20 can't run Next-16 Node middleware; gate is layout+DAL+action. `phases/01`+§5 say "NO proxy.ts (Verified)", but a few residual plan mentions remain |
| scrypt `scrypt$salt$hash` (base64), keylen = `expected.length` | **`scrypt:…:…` (base64url)**, fixed `KEYLEN=32`, fail-closed | Original design had a truncation weakness; Phase 1 hardened it **and updated the plan** in the same commit ("code wins") |
| `authorize` returns `{ role: "owner" }` + jwt/session callbacks propagate it; DAL checks `role` | **No role plumbing** | Deliberate: single owner ⇒ any session is the owner |
| Constant-time not specified (plan short-circuited on wrong email) | **`DECOY_HASH` + always-run scrypt** | Security improvement beyond the plan (anti-enumeration) |
| Wire forms with `useFormStatus` | Uses `useActionState`'s `pending` | `useFormStatus` unused anywhere |
| `lib/db/queries/` (directory) | `lib/db/queries.ts` (file) | Cosmetic |
| Coverage supports a weighted variant | Unweighted (distinct-covered ÷ total) only | Weighted toggle deferred |
| Enum CHECKs from the start | Split: `0000` tables, **`0001` adds CHECKs** | Deliberate second migration |

## Hardening & decisions worth keeping (the Phase-1 stress test found & fixed these)

1. **No `proxy.ts` on OpenNext** — it breaks the Workers build; auth boundary is layout + DAL + every action.
2. **Constant-time `authorize` + `DECOY_HASH`** — timing can't reveal the owner's email.
3. **Fail-closed `verifyPassword`** — reject a malformed/wrong-length stored hash before comparing.
4. **DB-level CHECK constraints** (migration `0001`) — belt-and-suspenders beyond the TS enums.
5. **`server-only` in the DAL** — the gate can never be bundled to the client.
6. **`requireOwner()` in every admin entry point** — layout, page (self-verifies), and every Server
   Action (they're public POST endpoints — don't trust the layout alone).
7. **Per-request `getDb()`** — never a singleton (Workers "I/O across requests" error).
8. **`Promise.all`** for the two coverage aggregates.
9. **Async factory reads secrets from the CF context**, not `process.env` (empty on Workers);
   `trustHost: true`; `next-auth` pinned exact.

Setup (secrets, migrate, seed) is in [deployment-and-gotchas.md](./deployment-and-gotchas.md);
the auth flow in depth is in [auth.md](./auth.md).
