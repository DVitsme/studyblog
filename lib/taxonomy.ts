// Client-safe taxonomy constants (no server-only deps). Mirrors the D1 schema enums
// and the cert sections. Source of truth for the model: plan/05-content-taxonomy.md.

export const POST_TYPES = [
  "concept",
  "cram",
  "lab",
  "troubleshooting",
  "practice-exam",
  "study-guide",
  "journal",
  "project",
  "resources",
] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  concept: "Concept",
  cram: "Cram sheet",
  lab: "Lab",
  troubleshooting: "Troubleshooting",
  "practice-exam": "Practice exam",
  "study-guide": "Study guide",
  journal: "Journal",
  project: "Project",
  resources: "Resources",
};

export const SECTION_SLUGS = ["a-plus", "security-plus", "network-plus", "journey"] as const;
export type SectionSlug = (typeof SECTION_SLUGS)[number];

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
