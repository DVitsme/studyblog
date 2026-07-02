import { getCloudflareContext } from "@opennextjs/cloudflare";

// Public serving of PRIVATE R2 objects (the bucket has no public URL; this Worker route is the only
// reader). Streams bytes with the stored Content-Type + immutable Cache-Control; honors conditional
// (304) + Range (206) requests. Keys are unguessable UUIDs, so this being public is fine — the cover
// images it serves appear on public posts anyway.
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const { key: segments } = await params;
  let key: string;
  try {
    key = segments.map(decodeURIComponent).join("/");
  } catch {
    // Malformed percent-encoding (e.g. /media/%) — treat as a miss, not an uncaught 500.
    return new Response("Not Found", { status: 404 });
  }

  const { env } = getCloudflareContext();
  const object = await env.MEDIA_BUCKET.get(key, {
    onlyIf: req.headers, // If-None-Match / If-Modified-Since
    range: req.headers, // Range
  });
  if (object === null) return new Response("Not Found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers); // content-type + cache-control from the PUT
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("x-content-type-options", "nosniff"); // never sniff away from the stored (image) type

  // Precondition failed → no body. A conditional GET means "not modified".
  if (!("body" in object)) {
    const conditional = req.headers.has("if-none-match") || req.headers.has("if-modified-since");
    return new Response(null, { status: conditional ? 304 : 412, headers });
  }

  // Only answer 206 when the client actually sent a Range — R2 sets object.range even on a full GET.
  const range = object.range as { offset?: number; length?: number } | undefined;
  if (req.headers.has("range") && range && (range.offset !== undefined || range.length !== undefined)) {
    const offset = range.offset ?? 0;
    const length = range.length ?? object.size - offset;
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }

  return new Response(object.body, { status: 200, headers });
}
