import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "./index";
import { domains, posts, sections } from "./schema";

export async function listSections() {
  const db = getDb();
  return db.select().from(sections).where(eq(sections.active, true)).orderBy(asc(sections.sort));
}

export async function listDomains(exam: string) {
  const db = getDb();
  return db.select().from(domains).where(eq(domains.exam, exam)).orderBy(asc(domains.sort));
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
