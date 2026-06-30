import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

// Per-request Drizzle client. NEVER a module-level singleton: Workers bindings (env.DB)
// only exist inside the request context, and a shared client throws "Cannot perform I/O
// on behalf of a different request". Construction is effectively free. See plan/03-data-model.md §5.
//
// In per-request paths (Server Components / Route Handlers / Server Actions) the sync
// getCloudflareContext() works. For build-time/SSG reads use getCloudflareContext({ async: true }).
export function getDb() {
  const { env } = getCloudflareContext();
  if (!env.DB) throw new Error("D1 binding `DB` is not configured (see wrangler.jsonc).");
  return drizzle(env.DB, { schema });
}

export type DB = ReturnType<typeof getDb>;
