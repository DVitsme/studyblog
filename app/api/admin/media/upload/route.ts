import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { media } from "@/lib/db/schema";

// Owner-gated image upload → R2 (native MEDIA_BUCKET binding) + a D1 `media` row.
// A Route Handler (not a Server Action): Server Actions cap the body at 1MB by default, which would
// block a 5MB image; Route Handlers have no such limit (Workers allow 100MB). See docs/*.
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (Q13)
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file provided." }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: "Only JPEG, PNG, WebP, AVIF, or GIF images." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Max size is 5 MB." }, { status: 413 });
  }

  // Dimensions are read in the browser (naturalWidth/Height) and posted alongside the file.
  const width = Number(form.get("width")) || null;
  const height = Number(form.get("height")) || null;
  const alt = typeof form.get("alt") === "string" ? String(form.get("alt")).slice(0, 300) : null;

  const bytes = await file.arrayBuffer(); // 5MB is trivial vs the 128MB isolate — buffer it
  const { env } = getCloudflareContext();
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  await env.MEDIA_BUCKET.put(key, bytes, {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { originalName: file.name },
  });

  const db = getDb();
  await db.insert(media).values({
    key,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    width,
    height,
    alt,
  });

  return Response.json({ key, url: `/media/${key}`, filename: file.name, size: file.size, width, height });
}
