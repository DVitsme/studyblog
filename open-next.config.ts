import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Phase 0: no incremental cache configured yet (mirrors the reference project's starting point).
// Phase 2/3 will add an R2 incremental cache + D1 tag cache override here, plus the matching
// bindings in wrangler.jsonc, once R2 is provisioned. See plan/06-deployment.md §1.
export default defineCloudflareConfig({});
