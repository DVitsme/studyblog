# 04 — Authentication

**Single owner. No public sign-up.** Auth.js v5 (NextAuth) + Credentials provider + **JWT sessions**
+ **no database adapter**. Owner credential lives in Worker secrets; password verified with
`node:crypto.scrypt`. Authoritative checks happen in the `/admin` layout, the DAL, and every Server
Action — `proxy.ts` is only an optimistic redirect.

> Background research: Auth.js v5 + Credentials forces JWT (DB sessions aren't an option), so the
> adapter's tables are dead weight for one user. bcrypt/argon2 native addons don't load on Workers;
> pure-JS argon2 blows the CPU budget; Web-Crypto PBKDF2 is capped at 100k iterations — **native
> `node:crypto.scrypt` under `nodejs_compat` is the right primitive.**

---

## 1. Pieces & file map

| File | Role |
|------|------|
| `auth.ts` | `NextAuth(...)` → `{ handlers, auth, signIn, signOut }` (async config factory — §3) |
| `app/api/auth/[...nextauth]/route.ts` | `export const { GET, POST } = handlers` (no `runtime="edge"`) |
| `proxy.ts` | optimistic `/admin` redirect (Node runtime; was `middleware.ts`) |
| `app/admin/layout.tsx` | **authoritative gate**: `await auth()` → `redirect('/login')` |
| `lib/auth/dal.ts` | `requireOwner()` server-only helper used by actions/handlers |
| `lib/auth/password.ts` | `hashPassword` / `verifyPassword` (scrypt) |
| `app/login/page.tsx` + login action | sign-in form + `signIn('credentials', …)` |

## 2. Secrets (Wrangler) & how they’re read

| Name | Where | Purpose |
|------|-------|---------|
| `AUTH_SECRET` | **secret** | JWT signing (`npx auth secret` to generate) |
| `AUTH_OWNER_EMAIL` | secret or `vars` | the one allowed login email |
| `AUTH_OWNER_HASH` | **secret** | `scrypt:<salt>:<hash>` string (base64url; generated once locally) |
| `AUTH_URL` | `vars` | canonical origin (e.g. `https://studyblog.example.com`) |
| `AUTH_TRUST_HOST` | `vars` = `"true"` | **required on Workers** (not auto-detected like Vercel/CF-Pages) |

Set them:
```bash
npx wrangler secret put AUTH_SECRET        # paste `npx auth secret` output
npx wrangler secret put AUTH_OWNER_HASH    # paste the scrypt:... string (see §4)
npx wrangler secret put AUTH_OWNER_EMAIL   # or put in wrangler.jsonc "vars"
# local dev: same keys in .dev.vars (gitignored)
```

> **OpenNext reliability nuance (important):** OpenNext only *guarantees* `process.env` is populated
> from Next `.env` files — dashboard/Wrangler **secrets** are reliably available via
> `getCloudflareContext().env`. So read auth secrets from the Cloudflare context and pass them
> explicitly into `NextAuth` (the **async config factory**, §3), rather than assuming
> `process.env.AUTH_SECRET`. This is the robust pattern for this stack.

## 3. `auth.ts` — async config factory

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "@/lib/auth/password";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext({ async: true });   // reliable secret access
  const OWNER_EMAIL = (env.AUTH_OWNER_EMAIL ?? "").toLowerCase();

  return {
    secret: env.AUTH_SECRET,
    trustHost: true,                       // REQUIRED on Workers
    session: { strategy: "jwt" },          // REQUIRED by Credentials
    pages: { signIn: "/login" },
    providers: [
      Credentials({
        credentials: { email: {}, password: {} },
        authorize: async (creds) => {
          const email = String(creds?.email ?? "").trim().toLowerCase();
          const password = String(creds?.password ?? "");
          if (!email || !password) return null;
          if (email !== OWNER_EMAIL) return null;
          if (!verifyPassword(password, env.AUTH_OWNER_HASH ?? "")) return null;
          return { id: "owner", email, name: "Owner", role: "owner" };  // null ⇒ rejected
        },
      }),
    ],
    callbacks: {
      authorized: ({ auth }) => !!auth?.user,        // used if proxy wraps `auth`
      jwt: ({ token, user }) => { if (user) (token as any).role = "owner"; return token; },
      session: ({ session, token }) => { (session.user as any).role = (token as any).role; return session; },
    },
  };
});
```

`app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;       // do NOT set runtime = "edge"
```

## 4. Password hashing — `lib/auth/password.ts` (scrypt, Workers-safe)

> Format is **`scrypt:<saltB64url>:<hashB64url>`** (colon delimiter + base64url — no `$`/`+`/`=`, so it
> drops verbatim into `.dev.vars` and `wrangler secret put`). `lib/auth/password.ts` is canonical; if
> this snippet drifts, the code wins.

```ts
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const PARAMS = { N: 16384, r: 8, p: 1 } as const;   // ~16 MB, under workerd's 32 MB maxmem
const KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(password, salt, KEYLEN, PARAMS);
  return `scrypt:${salt.toString("base64url")}:${dk.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64url");
  const expected = Buffer.from(hashB64, "base64url");
  if (expected.length !== KEYLEN) return false; // reject malformed/truncated hashes (fail closed)
  const actual = scryptSync(password, salt, KEYLEN, PARAMS);
  return timingSafeEqual(actual, expected);
}
```

**Generate the hash once** (locally, Node — keep `N=16384` so it matches the Worker):
```bash
node -e "const{scryptSync,randomBytes}=require('node:crypto');const p=process.argv[1];const s=randomBytes(16);process.stdout.write('scrypt:'+s.toString('base64url')+':'+scryptSync(p,s,32,{N:16384,r:8,p:1}).toString('base64url'))" 'YOUR-STRONG-PASSPHRASE'
```
Paste the output as `AUTH_OWNER_HASH`. Use a long passphrase (single-user; scrypt cost is fine).

## 5. NO `proxy.ts` on OpenNext — gate in the layout (verified Phase 1)

> **`@opennextjs/cloudflare` (through 1.20.1) does not support Next 16 Node middleware.** A `proxy.ts`
> — even `export { auth as proxy }` — **breaks the Workers build** (`Node.js middleware is not
> currently supported` / `async_hooks`). This project ships **no `proxy.ts`**; the §6 layout + DAL is
> the authoritative boundary (Next's own docs call proxy "not for Authentication" anyway). The block
> below is the pattern for **non-Workers targets only** — do not add it here.

```ts
export { auth as proxy } from "@/auth";     // Auth.js v5 + Next 16 proxy convention
export const config = { matcher: ["/admin/:path*"] };
```
- Next 16: **proxy runs on the Node runtime; do not set a `runtime` option** (it throws).
- Proxy reads the session **cookie** to fast-redirect anonymous users away from `/admin`. It is
  **not** the security boundary — Next’s own docs warn proxy is "not for Authentication," and a
  `matcher` that excludes a path also skips Server Functions on it. The real gate is the layout + DAL.

## 6. Authoritative gate — `/admin` layout + DAL

`lib/auth/dal.ts`:
```ts
import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const requireOwner = cache(async () => {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") redirect("/login");
  return session.user;            // minimal DTO; never leak raw rows
});
```

`app/admin/layout.tsx`:
```ts
import { requireOwner } from "@/lib/auth/dal";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();           // authoritative check; cached per request
  return <section className="admin">{children}</section>;
}
```

## 7. Protect EVERY mutation (Server Actions / Route Handlers)

Server Actions are **public POST endpoints** even if never imported — a page/layout gate does **not**
protect them. Re-verify at the top of each:
```ts
"use server";
import { requireOwner } from "@/lib/auth/dal";
export async function savePost(input: FormData) {
  await requireOwner();                 // ← mandatory in every admin action
  // ...validate (zod) → write via Drizzle → updateTag('post-<id>') / revalidateTag('posts','max')
}
```
Same for the R2 upload route handler (`06-deployment.md` §5): check `requireOwner()` before accepting
bytes. Validate inputs with `zod`; return minimal results.

## 8. Login page + action

`app/login/page.tsx` renders a small client form posting to a Server Action:
```ts
"use server";
import { signIn } from "@/auth";
export async function login(_prev: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (e) {
    // next-auth throws a redirect on success; surface only real auth errors
    if ((e as any)?.type === "CredentialsSignin") return { error: "Invalid email or password." };
    throw e;
  }
}
```
Wire with `useActionState(login, null)` (from `react`) + `useFormStatus` for the pending state. Sign
out via a `signOut()` action in the admin header.

## 9. Optional: 401/403 interrupts
If you want distinct unauthorized/forbidden pages, enable `experimental: { authInterrupts: true }`
and use `unauthorized()`/`forbidden()` + `app/unauthorized.tsx`/`app/forbidden.tsx`
(`02-architecture.md` §6). For one role, the `redirect('/login')` approach in §6 is enough — skip for
v1.

## 10. Gotchas checklist
- [ ] `trustHost: true` set (Workers isn’t auto-trusted) — else callback-URL errors.
- [ ] `AUTH_SECRET` present at **runtime** via `getCloudflareContext().env` (async factory).
- [ ] **Never** `runtime = "edge"` on the auth route, proxy, or any admin route.
- [ ] Secrets in `.dev.vars` for local; `wrangler secret put` for prod; `deploy -- --keep-vars` so a
      deploy doesn’t wipe dashboard vars (`06-deployment.md` §6).
- [ ] Every admin action/handler calls `requireOwner()` first.
- [ ] Password hash generated with the **same scrypt params** used at verify (`N=16384`).
- [ ] `session.strategy = "jwt"` (Credentials can’t use DB sessions).
- [ ] Confirm the installed `next-auth` v5 tag at install time (it has been on a long beta line);
      pin the version and re-check the `proxy`/`handlers` API against `authjs.dev`.

## 11. Defense-in-depth (optional, free)
For a single admin you may *also* front `/admin` and `/api/auth` with a **Cloudflare Access** policy
(Zero Trust, free <50 users) so requests are gated at the edge before hitting the Worker. Belt-and-
suspenders; not required. (Don’t replace NextAuth with it — the app still needs the owner session.)
