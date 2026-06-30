// Site identity. NEXT_PUBLIC_* are inlined at build time, so set them per environment
// (wrangler.jsonc "vars" / CI build variables). See plan/06-deployment.md §4.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyBlog";
