import { defineConfig } from "drizzle-kit";

// Generate-only: `drizzle-kit generate` emits SQL into ./migrations (a local schema diff,
// no DB connection), then `wrangler d1 migrations apply` applies the top-level .sql files.
// `out` MUST equal wrangler.jsonc `migrations_dir`. drizzle-kit also writes meta/_journal.json
// + snapshots here — keep them committed; wrangler ignores non-.sql files. See plan/06-deployment.md §3.
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
  out: "./migrations",
});
