import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Phase 2 adds the R2/media hostname here once uploads land (see plan/06-deployment.md).
    remotePatterns: [{ protocol: "https", hostname: "*.r2.cloudflarestorage.com" }],
  },
  // NOTE: `cacheComponents: true` is intentionally deferred to Phase 3, when `use cache`
  // is actually implemented and can be tested. See plan/02-architecture.md §5.
};

export default nextConfig;

// Make Cloudflare bindings available during `next dev` (OpenNext).
initOpenNextCloudflareForDev();
