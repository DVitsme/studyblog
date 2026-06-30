import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Workers-safe password hashing via node:crypto (under `nodejs_compat`).
// bcrypt/argon2 native addons don't load on Workers; pure-JS argon2 blows the CPU
// budget; Web-Crypto PBKDF2 is capped at 100k iters. Native scrypt is the right primitive.
// N=2^14 keeps memory ~16MB, safely under workerd's 32MB scrypt maxmem.
// See plan/04-auth.md §4.
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEYLEN = 32;

// Format: `scrypt:<saltB64url>:<hashB64url>`. base64url + ":" delimiter (no $ / + / = )
// keeps the stored value safe to drop verbatim into `.dev.vars` and `wrangler secret put`.
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
