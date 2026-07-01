"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireOwner } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { media, posts } from "@/lib/db/schema";

export async function deleteMedia(key: string): Promise<{ ok: boolean; error?: string }> {
  await requireOwner();
  const db = getDb();

  // Guard: don't delete an image still used as a post cover (would leave a broken cover).
  const [ref] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.coverImageKey, key))
    .limit(1);
  if (ref) return { ok: false, error: "This image is used as a post cover — remove it there first." };

  // Delete the object first (idempotent), then the row — a mid-failure leaves a harmless dangling row.
  const { env } = getCloudflareContext();
  await env.MEDIA_BUCKET.delete(key);
  await db.delete(media).where(eq(media.key, key));

  revalidatePath("/admin/media");
  return { ok: true };
}
