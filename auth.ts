import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "@/lib/auth/password";

// A well-formed decoy hash (16-byte salt, 32-byte key) used to keep authorize() timing
// constant when the email is wrong or the owner hash is unset (prevents user enumeration).
const DECOY_HASH = `scrypt:${Buffer.alloc(16).toString("base64url")}:${Buffer.alloc(32).toString("base64url")}`;

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
        authorize: async (credentials) => {
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
