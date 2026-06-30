// Ambient augmentation for Worker SECRETS (from `.dev.vars` / `wrangler secret put`),
// which `wrangler types` cannot see. Merges (interface declaration merging) into the
// generated CloudflareEnv. Keep in sync with .dev.vars + production secrets. See plan/04-auth.md §2.
interface CloudflareEnv {
  AUTH_SECRET: string;
  AUTH_OWNER_EMAIL: string;
  AUTH_OWNER_HASH: string;
  AUTH_URL?: string;
  AUTH_TRUST_HOST?: string;
}

declare namespace Cloudflare {
  interface Env {
    AUTH_SECRET: string;
    AUTH_OWNER_EMAIL: string;
    AUTH_OWNER_HASH: string;
    AUTH_URL?: string;
    AUTH_TRUST_HOST?: string;
  }
}
