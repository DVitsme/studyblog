"use server";

import { z } from "zod";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { domains, posts, postTags, sections, tags } from "@/lib/db/schema";
import { POST_STATUSES, POST_TYPES } from "@/lib/taxonomy";
import { readingMinutes } from "@/lib/content/reading";
import { slugify } from "@/lib/slug";

type Db = ReturnType<typeof getDb>;

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
  coverImageKey: z.preprocess(emptyToNull, z.string().max(300).nullable().default(null)),
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

// D1/SQLite surfaces constraint failures only via the error message.
function constraintKind(e: unknown): "unique" | "fk" | null {
  const m = e instanceof Error ? e.message : String(e);
  if (/UNIQUE constraint failed/i.test(m)) return "unique";
  if (/FOREIGN KEY constraint failed/i.test(m)) return "fk";
  return null;
}

// Upsert tag rows by slug, return their ids. Tags are idempotent (onConflictDoNothing), so doing
// this before the post write is safe even if the later write fails — an unlinked tag row is reusable.
async function resolveTagIds(db: Db, tagNames: string[]): Promise<number[]> {
  const unique = Array.from(new Map(tagNames.map((n) => [slugify(n), n.trim()])).entries());
  if (unique.length === 0) return [];
  const inserts = unique.map(([slug, name]) =>
    db.insert(tags).values({ slug, name }).onConflictDoNothing({ target: tags.slug }),
  );
  await db.batch([inserts[0], ...inserts.slice(1)]);
  const rows = await db
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.slug, unique.map(([slug]) => slug)));
  return rows.map((r) => r.id);
}

/** Create (id null) or update a post. Owner-gated; zod-validated; atomic tag sync; revalidates. */
export async function savePost(id: number | null, values: PostFormValues): Promise<ActionResult> {
  await requireOwner(); // security boundary — must stay outside any try/catch (redirect throws)
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

  // --- reads first (so the mutating writes below can be one atomic batch) ---
  const slugCond = id ? and(eq(posts.slug, data.slug), ne(posts.id, id)) : eq(posts.slug, data.slug);
  if ((await db.select({ id: posts.id }).from(posts).where(slugCond).limit(1)).length) {
    return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: ["Slug already in use"] } };
  }

  const [sec] = await db.select({ slug: sections.slug }).from(sections).where(eq(sections.slug, data.sectionSlug)).limit(1);
  if (!sec) {
    return { ok: false, error: "That section no longer exists.", fieldErrors: { sectionSlug: ["Unknown section"] } };
  }

  let exam: string | null = null;
  if (data.domainId) {
    const [d] = await db.select({ exam: domains.exam }).from(domains).where(eq(domains.id, data.domainId)).limit(1);
    if (!d) {
      return { ok: false, error: "That category no longer exists.", fieldErrors: { domainId: ["Unknown category"] } };
    }
    exam = d.exam;
  }

  const tagIds = await resolveTagIds(db, data.tags);
  const publishedAt = data.publishedAt ?? (data.status === "published" ? new Date() : null);
  const fields = {
    title: data.title,
    slug: data.slug,
    bodyMd: data.bodyMd,
    excerpt: data.excerpt,
    coverImageKey: data.coverImageKey,
    type: data.type,
    sectionSlug: data.sectionSlug,
    domainId: data.domainId,
    exam,
    status: data.status,
    readingMinutes: readingMinutes(data.bodyMd),
    publishedAt,
    updatedAt: new Date(),
  };

  let postId: number;
  try {
    if (id) {
      // Update path is fully atomic: post + tag delete/insert in one D1 batch (all-or-nothing).
      const upd = db.update(posts).set(fields).where(eq(posts.id, id));
      const del = db.delete(postTags).where(eq(postTags.postId, id));
      await (tagIds.length
        ? db.batch([upd, del, db.insert(postTags).values(tagIds.map((tagId) => ({ postId: id, tagId })))])
        : db.batch([upd, del]));
      postId = id;
    } else {
      // Create needs the generated id before the join insert, so it can't be a single batch.
      const [row] = await db.insert(posts).values(fields).returning({ id: posts.id });
      postId = row.id;
      if (tagIds.length) {
        // Post is already committed; a tag failure here must not strand the created post.
        try {
          await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
        } catch {
          /* tags can be re-saved from the edit page */
        }
      }
    }
  } catch (e) {
    const kind = constraintKind(e);
    if (kind === "unique") {
      return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: ["Slug already in use"] } };
    }
    if (kind === "fk") {
      return { ok: false, error: "That section or category no longer exists." };
    }
    throw e;
  }

  // Admin surfaces.
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}/edit`);
  // Public surfaces — no-op while pages render dynamically; invalidates the ISR cache once the
  // incremental cache is enabled (see plan/phases/03-public-site.md caching decision).
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${data.slug}`);
  revalidatePath(`/${data.sectionSlug}`);
  return { ok: true, id: postId, slug: data.slug };
}

export async function deletePost(id: number): Promise<{ ok: boolean }> {
  await requireOwner();
  const pid = z.number().int().positive().safeParse(id);
  if (!pid.success) return { ok: false };
  const db = getDb();
  const [row] = await db
    .select({ slug: posts.slug, sectionSlug: posts.sectionSlug })
    .from(posts)
    .where(eq(posts.id, pid.data))
    .limit(1);
  await db.delete(posts).where(eq(posts.id, pid.data)); // post_tags cascade
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/posts");
  if (row) {
    revalidatePath(`/posts/${row.slug}`);
    revalidatePath(`/${row.sectionSlug}`);
  }
  return { ok: true };
}

export async function duplicatePost(id: number): Promise<ActionResult> {
  await requireOwner();
  const pid = z.number().int().positive().safeParse(id);
  if (!pid.success) return { ok: false, error: "Invalid post id." };
  const db = getDb();
  const [src] = await db.select().from(posts).where(eq(posts.id, pid.data)).limit(1);
  if (!src) return { ok: false, error: "Post not found." };

  // Unique slug for the copy.
  const base = `${src.slug}-copy`;
  let slug = base;
  for (let n = 2; ; n++) {
    const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
    if (!exists) break;
    slug = `${base}-${n}`;
  }
  const srcTags = await db.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, pid.data));

  try {
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
        featured: src.featured,
        coverImageKey: src.coverImageKey,
        readingMinutes: src.readingMinutes,
        repoUrl: src.repoUrl,
        demoUrl: src.demoUrl,
        projectMeta: src.projectMeta,
        seoTitle: src.seoTitle,
        seoDescription: src.seoDescription,
        publishedAt: null,
      })
      .returning({ id: posts.id });
    if (srcTags.length) {
      await db.insert(postTags).values(srcTags.map((t) => ({ postId: row.id, tagId: t.tagId })));
    }
    revalidatePath("/admin/posts");
    return { ok: true, id: row.id, slug };
  } catch (e) {
    if (constraintKind(e)) return { ok: false, error: "Could not duplicate — please retry." };
    throw e;
  }
}
