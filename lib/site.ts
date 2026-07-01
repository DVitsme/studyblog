// Site identity — the single source for URLs, nav, and identity links (consumed by the header,
// footer, About page, and error pages). NEXT_PUBLIC_* are inlined at build; set per environment
// (wrangler.jsonc "vars" / CI build variables). See plan/06-deployment.md §4.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyBlog";
export const SITE_DESCRIPTION =
  "Documenting the road from limited IT training to CompTIA A+, Network+, and Security+ — study notes, hands-on labs, and security project write-ups.";

// Identity links — single-sourced so the footer and About page can't drift (design handoff Q5).
// TODO(owner): fill in the real handles before launch.
export const IDENTITY = {
  github: "https://github.com/DVitsme",
  linkedin: "", // TODO: add LinkedIn profile URL
  rss: "/rss.xml",
} as const;

// Cert sections in nav order (labels). Slugs mirror lib/taxonomy SECTION_SLUGS.
export const NAV_SECTIONS = [
  { slug: "a-plus", label: "A+" },
  { slug: "security-plus", label: "Security+" },
  { slug: "network-plus", label: "Network+" },
] as const;

// Helpful links for 404 / empty states (single source — design handoff ErrorPages).
export const HELPFUL_LINKS = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "The Journey" },
  { href: "/security-plus", label: "Security+" },
  { href: "/search", label: "Search" },
] as const;
