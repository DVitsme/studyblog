import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "@/lib/auth/password";

// A well-formed decoy hash (16-byte salt, 32-byte key) used to keep authorize() timing
// constant when the email is wrong or the owner hash is unset (prevents user enumeration).
const DECOY_HASH = `scrypt:${Buffer.alloc(16).toString("base64url")}:${Buffer.alloc(32).toString("base64url")}`;

// Thrown when the per-IP login rate limit is exceeded; the `code` lets the login action show a
// distinct message (see app/login/actions.ts).
class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

// Lazy/async config factory: runs per-request so we can read secrets from the Cloudflare
// env. Under OpenNext, Worker secrets are NOT on process.env — they live on
// getCloudflareContext().env. getCloudflareContext() is called ONLY inside the factory,
// never at module top level. `{ async: true }` also makes it safe during static generation.
// See plan/04-auth.md.
export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const ownerEmail = (env.AUTH_OWNER_EMAIL ?? "").trim().toLowerCase();

  return {
    trustHost: true, // required behind Cloudflare's proxy (else UntrustedHost)
    secret: env.AUTH_SECRET, // Worker secret; passed explicitly (process.env is empty on Workers)
    session: { strategy: "jwt" }, // Credentials => jwt only (also the no-adapter default)
    pages: { signIn: "/login" },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials, request) => {
          // Throttle per client IP BEFORE scrypt runs — closes the CPU-exhaustion vector on every
          // path (the login action's signIn AND a direct POST to the credentials callback both land
          // here). Per-colo + eventually consistent, which matches per-colo Worker CPU. See docs/auth.md.
          const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
          const { success } = await env.AUTH_RATE_LIMITER.limit({ key: `login:${ip}` });
          if (!success) throw new RateLimitedSignin();

          const email = String(credentials?.email ?? "").trim().toLowerCase();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;
          // Constant-time: always run scrypt (against a decoy when the email is wrong or the
          // owner hash is unset) so response time doesn't reveal the owner's login email.
          const emailOk = ownerEmail.length > 0 && email === ownerEmail;
          const pwOk = verifyPassword(password, env.AUTH_OWNER_HASH || DECOY_HASH);
          if (!emailOk || !pwOk) return null;
          // Single owner: a valid session IS the owner. -> AuthError "CredentialsSignin" on null.
          return { id: "owner", email, name: "Owner" };
        },
      }),
    ],
  };
});
