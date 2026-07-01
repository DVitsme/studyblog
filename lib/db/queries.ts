import { and, asc, desc, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import { getDb } from "./index";
import { domains, media, posts, postTags, sections, tags } from "./schema";
import type { Post, ProjectMeta } from "./schema";
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

export async function listMedia() {
  const db = getDb();
  return db.select().from(media).orderBy(desc(media.createdAt));
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
  if (filter.q) {
    // Escape LIKE metacharacters so a literal "100%" search doesn't match everything.
    const esc = filter.q.replace(/[\\%_]/g, (c) => `\\${c}`);
    conds.push(sql`${posts.title} like ${`%${esc}%`} escape '\\'`);
  }
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

// ============================================================================
// PUBLIC READS (Phase 3) — every query below is scoped to published posts.
// Read at request time via the per-request getDb(); pages layer caching on top
// (ISR + revalidate-on-publish), so these stay plain data functions.
// See plan/phases/03-public-site.md.
// ============================================================================

const PUBLISHED = eq(posts.status, "published");

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: PostType;
  sectionSlug: string;
  sectionName: string;
  domainName: string | null;
  coverImageKey: string | null;
  readingMinutes: number | null;
  publishedAt: Date | null;
  updatedAt: Date;
  featured: boolean;
};

// Shared projection for cards/lists: post ⨝ section, left ⨝ domain (the "category").
const postCardColumns = {
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  type: posts.type,
  sectionSlug: posts.sectionSlug,
  sectionName: sections.name,
  domainName: domains.name,
  coverImageKey: posts.coverImageKey,
  readingMinutes: posts.readingMinutes,
  publishedAt: posts.publishedAt,
  updatedAt: posts.updatedAt,
  featured: posts.featured,
} as const;

export type PublicPostFilter = {
  section?: string;
  type?: PostType;
  tagSlug?: string;
  domainId?: number | null;
  q?: string;
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest";
};

// WHERE conditions shared by the list + count queries (so pagination stays consistent).
// The tag filter uses a correlated EXISTS so a multi-tag post never fans out into dup rows.
function publicConds(f: PublicPostFilter) {
  const conds = [PUBLISHED];
  if (f.section) conds.push(eq(posts.sectionSlug, f.section));
  if (f.type) conds.push(eq(posts.type, f.type));
  if (f.domainId != null) conds.push(eq(posts.domainId, f.domainId));
  if (f.tagSlug) {
    conds.push(
      sql`exists (select 1 from ${postTags} pt inner join ${tags} t on t.id = pt.tag_id
          where pt.post_id = ${posts.id} and t.slug = ${f.tagSlug})`,
    );
  }
  if (f.q) {
    // Plain substring filter for the /posts facet bar (NOT the ranked /search — that's FTS5).
    const esc = f.q.replace(/[\\%_]/g, (c) => `\\${c}`);
    const like = `%${esc}%`;
    conds.push(
      sql`(${posts.title} like ${like} escape '\\' or coalesce(${posts.excerpt}, '') like ${like} escape '\\')`,
    );
  }
  return conds;
}

/** The flexible published-posts list behind /posts, archives, hubs, and home. */
export async function listPublishedPosts(f: PublicPostFilter = {}): Promise<PostCardData[]> {
  const db = getDb();
  const order = f.sort === "oldest" ? asc(posts.publishedAt) : desc(posts.publishedAt);
  let q = db
    .select(postCardColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .leftJoin(domains, eq(domains.id, posts.domainId))
    .where(and(...publicConds(f)))
    .orderBy(order, desc(posts.id))
    .$dynamic();
  if (f.limit != null) q = q.limit(f.limit);
  if (f.offset != null) q = q.offset(f.offset);
  return q;
}

/** Count matching the same filter — drives "Load older" pagination. */
export async function countPublishedPosts(f: PublicPostFilter = {}): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(posts).where(and(...publicConds(f)));
  return Number(row?.n ?? 0);
}

/** All published slugs — for generateStaticParams / sitemap. */
export async function listPublishedSlugs(): Promise<string[]> {
  const db = getDb();
  const rows = await db.select({ slug: posts.slug }).from(posts).where(PUBLISHED);
  return rows.map((r) => r.slug);
}

export type PublicPost = Post & {
  sectionName: string;
  domainName: string | null;
  domainRef: string | null;
  tags: { name: string; slug: string }[];
};

/** A single published post + section/domain names + tags, for /posts/[slug]. Null if not published. */
export async function getPublishedPostBySlug(slug: string): Promise<PublicPost | null> {
  const db = getDb();
  const [row] = await db
    .select({
      post: posts,
      sectionName: sections.name,
      domainName: domains.name,
      domainRef: domains.domainRef,
    })
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .leftJoin(domains, eq(domains.id, posts.domainId))
    .where(and(eq(posts.slug, slug), PUBLISHED))
    .limit(1);
  if (!row) return null;
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(eq(postTags.postId, row.post.id))
    .orderBy(asc(tags.name));
  return {
    ...row.post,
    sectionName: row.sectionName,
    domainName: row.domainName,
    domainRef: row.domainRef,
    tags: tagRows,
  };
}

export type PostLink = { slug: string; title: string };

/** Prev/next within the same domain (falls back to section) by publish order — the post footer. */
export async function prevNextForPost(post: {
  id: number;
  sectionSlug: string;
  domainId: number | null;
  publishedAt: Date | null;
}): Promise<{ prev: PostLink | null; next: PostLink | null }> {
  const db = getDb();
  const pub = post.publishedAt ?? new Date();
  const scope = post.domainId != null ? eq(posts.domainId, post.domainId) : eq(posts.sectionSlug, post.sectionSlug);
  const [prev] = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(and(PUBLISHED, scope, ne(posts.id, post.id), lt(posts.publishedAt, pub)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);
  const [next] = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(and(PUBLISHED, scope, ne(posts.id, post.id), gt(posts.publishedAt, pub)))
    .orderBy(asc(posts.publishedAt))
    .limit(1);
  return { prev: prev ?? null, next: next ?? null };
}

/** Related posts sharing the most tags with this one (published, excludes self). */
export async function relatedPosts(postId: number, limit = 3): Promise<PostCardData[]> {
  const db = getDb();
  const tagIdRows = await db.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, postId));
  const tagIds = tagIdRows.map((r) => r.tagId);
  if (tagIds.length === 0) return [];
  // GROUP BY posts.id → count(*) is the shared-tag count; order by it desc. No need to select it.
  return db
    .select(postCardColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .leftJoin(domains, eq(domains.id, posts.domainId))
    .innerJoin(postTags, eq(postTags.postId, posts.id))
    .where(and(PUBLISHED, ne(posts.id, postId), inArray(postTags.tagId, tagIds)))
    .groupBy(posts.id)
    .orderBy(desc(sql`count(*)`), desc(posts.publishedAt))
    .limit(limit);
}

// ---- Project variants (need the project_meta / repo / demo columns) ----
export type ProjectCardData = PostCardData & {
  repoUrl: string | null;
  demoUrl: string | null;
  projectMeta: ProjectMeta | null;
};

const projectCardColumns = {
  ...postCardColumns,
  repoUrl: posts.repoUrl,
  demoUrl: posts.demoUrl,
  projectMeta: posts.projectMeta,
} as const;

export async function listProjects(limit?: number): Promise<ProjectCardData[]> {
  const db = getDb();
  let q = db
    .select(projectCardColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .leftJoin(domains, eq(domains.id, posts.domainId))
    .where(and(PUBLISHED, eq(posts.type, "project")))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .$dynamic();
  if (limit != null) q = q.limit(limit);
  return q;
}

/** One project for the home page — the featured flag wins, else newest. */
export async function featuredProject(): Promise<ProjectCardData | null> {
  const db = getDb();
  const [row] = await db
    .select(projectCardColumns)
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .leftJoin(domains, eq(domains.id, posts.domainId))
    .where(and(PUBLISHED, eq(posts.type, "project")))
    .orderBy(desc(posts.featured), desc(posts.publishedAt))
    .limit(1);
  return row ?? null;
}

// ---- Coverage (the signature feature) — per-section domain coverage from D1 ----
export type DomainCoverage = {
  id: number;
  domainRef: string;
  name: string;
  exam: string;
  postCount: number;
  done: boolean;
};
export type SectionCoverage = { covered: number; total: number; domains: DomainCoverage[] };

/** Per-domain published-post coverage for a section — feeds CoverageChecklist + the hub's overall bar. */
export async function sectionCoverage(sectionSlug: string): Promise<SectionCoverage> {
  const db = getDb();
  const publishedCount = sql<number>`count(case when ${posts.status} = 'published' then 1 end)`;
  const rows = await db
    .select({
      id: domains.id,
      domainRef: domains.domainRef,
      name: domains.name,
      exam: domains.exam,
      postCount: publishedCount,
    })
    .from(domains)
    .leftJoin(posts, eq(posts.domainId, domains.id))
    .where(eq(domains.sectionSlug, sectionSlug))
    .groupBy(domains.id)
    .orderBy(asc(domains.sort));
  const cov = rows.map((r) => {
    const postCount = Number(r.postCount);
    return { ...r, postCount, done: postCount > 0 };
  });
  return { total: cov.length, covered: cov.filter((d) => d.done).length, domains: cov };
}

export type CertCardData = {
  slug: string;
  name: string;
  examCodes: string | null;
  covered: number;
  total: number;
  postCount: number;
};

/** Home/hub cert cards: covered-vs-total domains + published post count, per cert section. */
export async function certCards(
  slugs: readonly string[] = ["a-plus", "security-plus", "network-plus"],
): Promise<CertCardData[]> {
  const db = getDb();
  const [secRows, totals, covered, counts] = await Promise.all([
    db.select({ slug: sections.slug, name: sections.name, examCodes: sections.examCodes }).from(sections),
    db.select({ s: domains.sectionSlug, total: sql<number>`count(*)` }).from(domains).groupBy(domains.sectionSlug),
    db
      .select({ s: domains.sectionSlug, covered: sql<number>`count(distinct ${domains.id})` })
      .from(domains)
      .innerJoin(posts, and(eq(posts.domainId, domains.id), PUBLISHED))
      .groupBy(domains.sectionSlug),
    db.select({ s: posts.sectionSlug, n: sql<number>`count(*)` }).from(posts).where(PUBLISHED).groupBy(posts.sectionSlug),
  ]);
  const secBy = new Map(secRows.map((r) => [r.slug, r]));
  const totalBy = new Map(totals.map((r) => [r.s, Number(r.total)]));
  const coveredBy = new Map(covered.map((r) => [r.s, Number(r.covered)]));
  const countBy = new Map(counts.map((r) => [r.s, Number(r.n)]));
  return slugs.map((slug) => ({
    slug,
    name: secBy.get(slug)?.name ?? slug,
    examCodes: secBy.get(slug)?.examCodes ?? null,
    covered: coveredBy.get(slug) ?? 0,
    total: totalBy.get(slug) ?? 0,
    postCount: countBy.get(slug) ?? 0,
  }));
}

// ---- Facets (shared by /posts FacetBar + /search) ----
export type Facet = { value: string; label: string; count: number };

export async function sectionFacets(): Promise<Facet[]> {
  const db = getDb();
  const rows = await db
    .select({ value: posts.sectionSlug, label: sections.name, count: sql<number>`count(*)` })
    .from(posts)
    .innerJoin(sections, eq(sections.slug, posts.sectionSlug))
    .where(PUBLISHED)
    .groupBy(posts.sectionSlug)
    .orderBy(asc(sections.sort));
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

export async function typeFacets(): Promise<Facet[]> {
  const db = getDb();
  const rows = await db
    .select({ value: posts.type, count: sql<number>`count(*)` })
    .from(posts)
    .where(PUBLISHED)
    .groupBy(posts.type)
    .orderBy(desc(sql`count(*)`));
  return rows.map((r) => ({ value: r.value, label: r.value, count: Number(r.count) }));
}

export async function tagFacets(limit = 24): Promise<Facet[]> {
  const db = getDb();
  const rows = await db
    .select({ value: tags.slug, label: tags.name, count: sql<number>`count(*)` })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .innerJoin(posts, eq(posts.id, postTags.postId))
    .where(PUBLISHED)
    .groupBy(tags.id)
    .orderBy(desc(sql`count(*)`), asc(tags.name))
    .limit(limit);
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

// ---- Search (D1 FTS5) ----
export type SearchResult = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: PostType;
  sectionSlug: string;
  sectionName: string;
  domainName: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  readingMinutes: number | null;
};

export type SearchFacets = { section?: string; type?: PostType; tagSlug?: string };

type RawSearchRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  sectionSlug: string;
  sectionName: string;
  domainName: string | null;
  publishedAt: number | null;
  updatedAt: number;
  readingMinutes: number | null;
};

// Turn arbitrary user input into a guaranteed-valid FTS5 MATCH string: strip to letter/digit tokens
// and re-emit each as a quoted prefix term, AND-ed together. No user character can reach an FTS
// operator (*, -, ", :, AND/OR/NEAR), so a syntax error is impossible. Null → nothing to search.
function toFtsMatch(input: string): string | null {
  const tokens = input.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  if (!tokens || tokens.length === 0) return null;
  return tokens.map((t) => `"${t}"*`).join(" ");
}

/**
 * Ranked full-text search over published posts, filtered by optional facets. Weighted bm25
 * (title > excerpt > body). Raw SQL because the FTS5 virtual table + bm25() are outside Drizzle's
 * schema; values are still bound parameters (injection-safe). See migrations/0002_fts_search.sql.
 */
export async function searchPosts(
  rawQuery: string,
  facets: SearchFacets = {},
  limit = 40,
): Promise<SearchResult[]> {
  const match = toFtsMatch(rawQuery);
  if (!match) return [];
  const db = getDb();
  const section = facets.section ?? null;
  const type = facets.type ?? null;
  const tagSlug = facets.tagSlug ?? null;

  const rows = (await db.all(sql`
    SELECT p.slug AS slug, p.title AS title, p.excerpt AS excerpt, p.type AS type,
           p.section_slug AS sectionSlug, s.name AS sectionName, d.name AS domainName,
           p.published_at AS publishedAt, p.updated_at AS updatedAt, p.reading_minutes AS readingMinutes
    FROM posts_fts
    JOIN posts p ON p.id = posts_fts.rowid
    JOIN sections s ON s.slug = p.section_slug
    LEFT JOIN domains d ON d.id = p.domain_id
    WHERE posts_fts MATCH ${match}
      AND p.status = 'published'
      AND (${section} IS NULL OR p.section_slug = ${section})
      AND (${type} IS NULL OR p.type = ${type})
      AND (${tagSlug} IS NULL OR EXISTS (
        SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id AND t.slug = ${tagSlug}))
    ORDER BY bm25(posts_fts, 10.0, 5.0, 1.0)
    LIMIT ${limit}
  `)) as RawSearchRow[];

  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    type: r.type as PostType,
    sectionSlug: r.sectionSlug,
    sectionName: r.sectionName,
    domainName: r.domainName,
    // Raw SQL bypasses Drizzle's timestamp mapping → convert the unix seconds ourselves.
    publishedAt: r.publishedAt != null ? new Date(Number(r.publishedAt) * 1000) : null,
    updatedAt: new Date(Number(r.updatedAt) * 1000),
    readingMinutes: r.readingMinutes != null ? Number(r.readingMinutes) : null,
  }));
}
