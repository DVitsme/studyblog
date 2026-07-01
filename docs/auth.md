# Auth (single-owner)

There is **one** user — the owner. No user table, no sign-up, no roles: **any valid session IS the
owner.** Auth is Auth.js v5 (`next-auth@5-beta`) with a Credentials provider and JWT sessions.

Canonical files: `auth.ts` (config), `lib/auth/dal.ts` (the gate), `lib/auth/password.ts` (hashing),
`app/login/` (form + action), `app/api/auth/[...nextauth]/route.ts` (handlers).

## Config factory (`auth.ts`)

`NextAuth(async () => {...})` is an **async factory** so it can read Worker secrets from
`await getCloudflareContext({ async: true })` (secrets aren't on `process.env` on Workers; the async
form is also safe during static generation). Key settings: `trustHost: true` (required behind
Cloudflare's proxy), `secret: env.AUTH_SECRET`, `session.strategy: "jwt"` (forced with Credentials),
`pages.signIn: "/login"`.

## Password hashing (`lib/auth/password.ts`)

`node:crypto` **scrypt**, stored as `scrypt:<saltB64url>:<hashB64url>`. `verifyPassword` is
constant-time (`timingSafeEqual`, with a length check). The owner's hash is the `AUTH_OWNER_HASH`
secret. To (re)generate one, run `hashPassword(plaintext)` from that module.

**Anti-enumeration:** `authorize()` **always** runs scrypt — against a well-formed `DECOY_HASH` when
the email is wrong or the hash is unset — so response timing never reveals the owner's email. It
returns `null` on any mismatch (email or password), which Auth.js surfaces as a generic
`CredentialsSignin` error. Don't add "user not found" vs "wrong password" branches.

## The gate: `requireOwner()` (`lib/auth/dal.ts`) — and why there's no middleware

```ts
export const requireOwner = cache(async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
});
```

OpenNext doesn't support Next 16 Node middleware, so **there is no `middleware.ts`/`proxy.ts`.** The
boundary is defense-in-depth:
1. `app/admin/layout.tsx` calls `requireOwner()` → gates the whole `/admin` tree.
2. **Every** admin Server Action calls `requireOwner()` **first, outside any `try/catch`** — it gates by
   throwing `NEXT_REDIRECT`, and a naive catch would swallow that and run unauthenticated. (If you must
   wrap it, call `unstable_rethrow` first.)
3. The preview Route Handler checks the session itself and returns **401** (not a redirect) for non-owners.

`cache()` (React) dedupes the `auth()` call within a request. This layout+DAL+per-action model — not
middleware — is the pattern to reuse on this stack.

## Login rate limiting (CPU-exhaustion guard)

scrypt is deliberately expensive and runs on **every** login attempt (including the decoy). Without a
limit, an attacker can force repeated scrypt runs → Worker CPU/cost exhaustion. Mitigation uses the
**native Cloudflare Workers Rate Limiting binding** (GA):

- **Binding** (`wrangler.jsonc`): `ratelimits: [{ name: "AUTH_RATE_LIMITER", namespace_id: "1001",
  simple: { limit: 5, period: 60 } }]` — 5 attempts / 60 s. `period` must be **10 or 60**.
  `namespace_id` is an arbitrary id (**no resource to provision** — portable to a clone). Re-run
  `pnpm cf-typegen` after adding it (`CloudflareEnv` gains `AUTH_RATE_LIMITER: RateLimit`).
- **Check** (`auth.ts`, at the **top of `authorize`, before scrypt**):
  ```ts
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.AUTH_RATE_LIMITER.limit({ key: `login:${ip}` });
  if (!success) throw new RateLimitedSignin();   // CredentialsSignin subclass, code = "rate_limited"
  ```
  Placed in `authorize` (not the Server Action) because it's the single choke point that **both** the
  login action's `signIn` and a direct `POST /api/auth/callback/credentials` funnel through. `request`
  is the standard inbound `Request` (Auth.js passes it as `authorize`'s 2nd arg); `CF-Connecting-IP` is
  the edge-set client IP (don't trust `X-Forwarded-For`).
- **Key = per-IP** (`login:<ip>`), not per-IP+email — the email is attacker-controlled (one valid
  value), so per-IP+email lets an attacker split buckets by rotating the email.
- **Caveat:** limits are **per-colo and eventually consistent** (best-effort throttling, not a global
  counter). That's fine here — Worker CPU is itself per-colo, so it protects exactly the right resource.
- **Surfacing** (`app/login/actions.ts`): the thrown `RateLimitedSignin` arrives as an `AuthError` with
  `type === "CredentialsSignin"` and `code === "rate_limited"`, so the action shows "Too many attempts…"
  vs the generic "Invalid email or password." Fallback if the code doesn't propagate: the generic
  message (no info leak).

## Login flow

`components/admin/login-card.tsx` (`useActionState`) → `login` action → `signIn("credentials", {
redirectTo: "/admin" })`. On success `signIn` throws `NEXT_REDIRECT` (not an `AuthError`), so the
action's catch **re-throws** it and the redirect happens; only `AuthError` is mapped to a form message.
The button stays in "Signing in…" until the redirect (state never resolves on success).

## Setup for a clone

Set three Worker secrets (mirror in `.dev.vars` for local): `AUTH_SECRET` (random), `AUTH_OWNER_EMAIL`,
`AUTH_OWNER_HASH` (`scrypt:…` from `hashPassword`). Add the `ratelimits` binding + `pnpm cf-typegen`.
The `AUTH_RATE_LIMITER` binding is **required** by `authorize` — keep it in `wrangler.jsonc`.
See [deployment-and-gotchas.md](./deployment-and-gotchas.md) for the full checklist.
