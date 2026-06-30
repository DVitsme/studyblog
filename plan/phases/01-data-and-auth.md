# Phase 1 — Data & Auth

**Goal:** the database schema is migrated + seeded, and the single owner can log in to a gated
`/admin`. No content UI yet — just the secure shell and the data layer.

**Outcome:** anonymous visitors are bounced from `/admin` to `/login`; correct owner credentials
reach `/admin`; sections + all exam domains exist in D1 (local and remote).

---

## Prerequisites / reading
Phase 0 complete. Read `03-data-model.md`, `04-auth.md`, and the Next docs:
`02-guides/authentication.md`, `02-guides/data-security.md`,
`01-getting-started/16-proxy.md`, `03-api-reference/03-file-conventions/proxy.md`.

## Tasks
### Data layer
1. **`lib/db/schema.ts`** — the Drizzle tables from `03-data-model.md` §5 (sections, domains, posts,
   tags, post_tags, media) with indexes/relations.
2. **Generate + apply migrations:**
   ```bash
   pnpm db:generate            # drizzle-kit → ./migrations
   pnpm db:migrate:local
   ```
3. **Seed sections + domains** — author `db/seed-domains.sql` from `05-content-taxonomy.md` §3
   (4 sections, all A+/Net+/Sec+ domains with `domain_ref` + weights). `pnpm db:seed:local`.
4. **`lib/db/index.ts`** — `getDb()` **per request** (`03-data-model.md` §5). Add `lib/db/queries/`
   with a couple of typed reads (e.g. `listSections()`, `listDomains(exam)`) to prove the client.
5. **`lib/taxonomy.ts`** — the `POST_TYPES` enum + section/type display helpers (client-safe constants).

### Auth
6. **Install + hash:** `pnpm add next-auth@5 zod` (confirm the current v5 tag). Implement
   `lib/auth/password.ts` (scrypt, `04-auth.md` §4). Generate `AUTH_OWNER_HASH` locally with the
   one-liner; generate `AUTH_SECRET` via `npx auth secret`.
7. **`.dev.vars`:** `AUTH_SECRET`, `AUTH_OWNER_EMAIL`, `AUTH_OWNER_HASH`, `AUTH_URL=http://localhost:3000`,
   `AUTH_TRUST_HOST=true`.
8. **`auth.ts`** — async config factory reading `getCloudflareContext({ async:true }).env`
   (`04-auth.md` §3): Credentials + JWT + `trustHost`, `authorize()` comparing email + `verifyPassword`.
9. **`app/api/auth/[...nextauth]/route.ts`** — `export const { GET, POST } = handlers` (no edge runtime).
10. **No `proxy.ts`** — `@opennextjs/cloudflare` 1.20.1 doesn't support Next 16 Node middleware (a
    `proxy.ts` **breaks the Workers build**). Auth is enforced in `app/admin/layout.tsx` + the DAL +
    every action (the secure boundary). See `04-auth.md` §5. *(Verified Phase 1.)*
11. **`lib/auth/dal.ts`** — `requireOwner()` (`server-only`, `cache()`, redirect to `/login`).
12. **`app/admin/layout.tsx`** — `await requireOwner()` gate + minimal admin chrome (header, sign-out
    action). **`app/admin/page.tsx`** — placeholder dashboard.
13. **`app/login/page.tsx`** — client form + `login` Server Action (`useActionState` + `useFormStatus`),
    error surfacing for `CredentialsSignin`.

### Production
14. Migrate + seed **remote** D1 (`pnpm db:migrate && pnpm db:seed`). Set prod secrets
    (`wrangler secret put AUTH_SECRET|AUTH_OWNER_HASH|AUTH_OWNER_EMAIL`); set `AUTH_URL`/`AUTH_TRUST_HOST`
    in `vars`. Redeploy with `-- --keep-vars`.

## Acceptance criteria
- [ ] `SELECT count(*) FROM domains` (local **and** remote) returns the full seeded set; sections seeded.
- [ ] `getDb()` reads work in a Server Component; no *“Cannot perform I/O on behalf of a different
      request”* error (client is per-request).
- [ ] Visiting `/admin` while signed out redirects to `/login` (proxy) **and** the layout gate also
      redirects if the cookie is forged/absent (defense in depth).
- [ ] Wrong email or wrong password → rejected with a friendly error; correct creds → `/admin`.
- [ ] Sign-out clears the session; `/admin` is gated again.
- [ ] Works in `pnpm run preview` (workerd) and in production after secrets are set.

## Risks / notes
- Verify the installed `next-auth` v5 API (`handlers`/`auth`/`signIn`) against `authjs.dev` — it has
  a long beta line; pin the version.
- If login fails only in prod: check `trustHost`, `AUTH_URL`, and that secrets are readable via
  `getCloudflareContext().env` (the async-factory pattern), not just `process.env` (`04-auth.md` §2).
- Session strategy **must** be `jwt` (Credentials can't use DB sessions).
