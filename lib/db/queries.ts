import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { getDb } from "./index";
import { domains, posts, postTags, sections, tags } from "./schema";
import type { PostStatus, PostType } from "../taxonomy";

export async function listSections() {
  const db = getDb();
  return db.select().from(sections).where(eq(sections.active, true)).orderBy(asc(sections.sort));
}

export async function listDomains(exam: string) {
  const db = getDb();
  return db.select().from(domains).where(eq(domains.exam, exam)).orderBy(asc(domains.sort));
}

// Domains of a section — the editor's Category select (filtered by the chosen Section).
export async function listDomainsBySection(sectionSlug: string) {
  const db = getDb();
  return db
    .select()
    .from(domains)
    .where(eq(domains.sectionSlug, sectionSlug))
    .orderBy(asc(domains.sort));
}

// All domains (small set) — passed to the editor so the Category select filters by section client-side.
export async function listAllDomains() {
  const db = getDb();
  return db
    .select({ id: domains.id, name: domains.name, sectionSlug: domains.sectionSlug, exam: domains.exam })
    .from(domains)
    .orderBy(asc(domains.sectionSlug), asc(domains.sort));
}

export async function listTags() {
  const db = getDb();
  return db.select({ name: tags.name, slug: tags.slug }).from(tags).orderBy(asc(tags.name));
}

export async function countPosts(): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(posts);
  return Number(row?.n ?? 0);
}

export type ExamCoverage = { exam: string; covered: number; total: number };

/**
 * Per-exam objectives coverage: distinct official domains that have >= 1 published post,
 * over total domains. The signature "% covered" feature. See plan/03-data-model.md §10.
 */
export async function coverageByExam(): Promise<ExamCoverage[]> {
  const db = getDb();

  const [totals, covered] = await Promise.all([
    db
      .select({ exam: domains.exam, total: sql<number>`count(*)` })
      .from(domains)
      .groupBy(domains.exam),
    db
      .select({ exam: domains.exam, covered: sql<number>`count(distinct ${domains.id})` })
      .from(domains)
      .innerJoin(posts, and(eq(posts.domainId, domains.id), eq(posts.status, "published")))
      .groupBy(domains.exam),
  ]);

  const coveredByExam = new Map(covered.map((r) => [r.exam, Number(r.covered)]));
  return totals.map((t) => ({
    exam: t.exam,
    total: Number(t.total),
    covered: coveredByExam.get(t.exam) ?? 0,
  }));
}

export type CoverageGap = {
  domainRef: string;
  name: string;
  exam: string;
  sectionSlug: string;
  sectionName: string;
};

/** Inverse of coverage: official domains with NO published post — "write next" (Stage4 CoverageGaps). */
export async function coverageGaps(limit = 6): Promise<CoverageGap[]> {
  const db = getDb();
  const publishedCount = sql<number>`count(case when ${posts.status} = 'published' then 1 end)`;
  return db
    .select({
      domainRef: domains.domainRef,
      name: domains.name,
      exam: domains.exam,
      sectionSlug: domains.sectionSlug,
      sectionName: sections.name,
    })
    .from(domains)
    .innerJoin(sections, eq(sections.slug, domains.sectionSlug))
    .leftJoin(posts, eq(posts.domainId, domains.id))
    .groupBy(domains.id)
    .having(sql`${publishedCount} = 0`)
    .orderBy(asc(domains.sectionSlug), asc(domains.sort))
    .limit(limit);
}

export type DashboardStats = { drafts: number; published: number; thisWeek: number };

/** Dashboard StatCards: draft/published counts + posts touched in the last 7 days. */
export async function dashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  const weekAgoUnix = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
  const [row] = await db
    .select({
      drafts: sql<number>`count(case when ${posts.status} = 'draft' then 1 end)`,
      published: sql<number>`count(case when ${posts.status} = 'published' then 1 end)`,
      thisWeek: sql<number>`count(case when ${posts.updatedAt} >= ${weekAgoUnix} then 1 end)`,
    })
    .from(posts);
  return {
    drafts: Number(row?.drafts ?? 0),
    published: Number(row?.published ?? 0),
    thisWeek: Number(row?.thisWeek ?? 0),
  };
}

export type AdminPostRow = {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
  type: PostType;
  sectionSlug: string;
  sectionName: string;
  updatedAt: Date;
  publishedAt: Date | null;
};

const adminPostColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  status: posts.status,
  type: posts.type,
  sectionSlug: posts.sectionSlug,
  sectionName: sections.name,
  updatedAt: posts.updatedAt,
  publishedAt: posts.publishedAt,
} as const;

/** Recent posts for the dashboard (most-recently-updated first). */
export async function recentPosts(limit = 5): Promise<AdminPostRow[]> {
  const db = getDb();
  return db
    .select(adminPostColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .orderBy(desc(posts.updatedAt))
    .limit(limit);
}

export type PostFilter = { status?: PostStatus; section?: string; type?: PostType; q?: string };

/** Posts-list table, server-filtered by the URL params (status/section/type/search). */
export async function listPostsAdmin(filter: PostFilter = {}): Promise<AdminPostRow[]> {
  const db = getDb();
  const conds = [];
  if (filter.status) conds.push(eq(posts.status, filter.status));
  if (filter.section) conds.push(eq(posts.sectionSlug, filter.section));
  if (filter.type) conds.push(eq(posts.type, filter.type));
  if (filter.q) conds.push(like(posts.title, `%${filter.q}%`));
  return db
    .select(adminPostColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(posts.updatedAt));
}

export type EditablePost = typeof posts.$inferSelect & { tags: string[] };

/** A single post plus its tag names, for the editor. */
export async function getPostForEdit(id: number): Promise<EditablePost | null> {
  const db = getDb();
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return null;
  const tagRows = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(eq(postTags.postId, id));
  return { ...post, tags: tagRows.map((t) => t.name) };
}
