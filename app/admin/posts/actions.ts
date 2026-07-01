"use server";

import { z } from "zod";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { domains, posts, postTags, tags } from "@/lib/db/schema";
import { POST_STATUSES, POST_TYPES } from "@/lib/taxonomy";
import { readingMinutes } from "@/lib/content/reading";
import { slugify } from "@/lib/slug";

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const PostInput = z.object({
  title: z.string().trim().min(1, { error: "Title is required" }).max(200),
  slug: z
    .string()
    .trim()
    .min(1, { error: "Slug is required" })
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Use lowercase letters, numbers, and hyphens" }),
  bodyMd: z.string().default(""),
  excerpt: z.preprocess(emptyToNull, z.string().trim().max(400).nullable().default(null)),
  type: z.enum(POST_TYPES, { error: "Choose a type" }),
  sectionSlug: z.string().trim().min(1, { error: "Choose a section" }),
  domainId: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().positive().nullable().default(null),
  ),
  status: z.enum(POST_STATUSES).default("draft"),
  tags: z.array(z.string().trim().min(1)).max(20).default([]),
  publishedAt: z.preprocess(
    (v) => (v == null || v === "" ? null : new Date(v as string)),
    z.date().nullable().default(null),
  ),
});

export type PostFormValues = z.input<typeof PostInput> & { id?: number | null };
export type ActionResult =
  | { ok: true; id: number; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// Replace a post's tags: upsert tag rows by slug, then rewrite the join table.
async function syncTags(
  db: ReturnType<typeof getDb>,
  postId: number,
  tagNames: string[],
): Promise<void> {
  const unique = Array.from(new Map(tagNames.map((n) => [slugify(n), n.trim()])).entries());
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (unique.length === 0) return;
  for (const [slug, name] of unique) {
    await db.insert(tags).values({ slug, name }).onConflictDoNothing({ target: tags.slug });
  }
  const rows = await db
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.slug, unique.map(([slug]) => slug)));
  if (rows.length) {
    await db.insert(postTags).values(rows.map((r) => ({ postId, tagId: r.id })));
  }
}

/** Create (id null) or update a post. Owner-gated; zod-validated; syncs tags; revalidates. */
export async function savePost(id: number | null, values: PostFormValues): Promise<ActionResult> {
  await requireOwner();
  const parsed = PostInput.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const data = parsed.data;
  const db = getDb();

  // Slug uniqueness (excluding self on update) — friendlier than surfacing the DB constraint.
  const slugConds = id
    ? and(eq(posts.slug, data.slug), ne(posts.id, id))
    : eq(posts.slug, data.slug);
  const [clash] = await db.select({ id: posts.id }).from(posts).where(slugConds).limit(1);
  if (clash) {
    return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: ["Slug already in use"] } };
  }

  // Derive exam from the chosen domain (falls back to the section's code list).
  let exam: string | null = null;
  if (data.domainId) {
    const [d] = await db
      .select({ exam: domains.exam })
      .from(domains)
      .where(eq(domains.id, data.domainId))
      .limit(1);
    exam = d?.exam ?? null;
  }

  const publishedAt =
    data.publishedAt ?? (data.status === "published" ? new Date() : null);
  const reading = readingMinutes(data.bodyMd);

  const fields = {
    title: data.title,
    slug: data.slug,
    bodyMd: data.bodyMd,
    excerpt: data.excerpt,
    type: data.type,
    sectionSlug: data.sectionSlug,
    domainId: data.domainId,
    exam,
    status: data.status,
    readingMinutes: reading,
    publishedAt,
    updatedAt: new Date(),
  };

  let postId = id ?? 0;
  if (id) {
    await db.update(posts).set(fields).where(eq(posts.id, id));
  } else {
    const [row] = await db.insert(posts).values(fields).returning({ id: posts.id });
    postId = row.id;
  }

  await syncTags(db, postId, data.tags);

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}/edit`);
  return { ok: true, id: postId, slug: data.slug };
}

export async function deletePost(id: number): Promise<{ ok: boolean }> {
  await requireOwner();
  const db = getDb();
  await db.delete(posts).where(eq(posts.id, id)); // post_tags cascade
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  return { ok: true };
}

export async function duplicatePost(id: number): Promise<ActionResult> {
  await requireOwner();
  const db = getDb();
  const [src] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!src) return { ok: false, error: "Post not found." };

  // Unique slug for the copy.
  const base = `${src.slug}-copy`;
  let slug = base;
  for (let n = 2; ; n++) {
    const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
    if (!exists) break;
    slug = `${base}-${n}`;
  }

  const [row] = await db
    .insert(posts)
    .values({
      slug,
      title: `${src.title} (copy)`,
      excerpt: src.excerpt,
      bodyMd: src.bodyMd,
      type: src.type,
      sectionSlug: src.sectionSlug,
      domainId: src.domainId,
      exam: src.exam,
      status: "draft",
      readingMinutes: src.readingMinutes,
      publishedAt: null,
    })
    .returning({ id: posts.id });

  revalidatePath("/admin/posts");
  return { ok: true, id: row.id, slug };
}
