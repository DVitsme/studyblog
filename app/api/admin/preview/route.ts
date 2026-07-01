import { auth } from "@/auth";
import { renderMarkdown } from "@/lib/content/render";

// Owner-gated live-preview endpoint for the editor. A Route Handler (not a Server Action) so the
// client can debounce + cancel in-flight requests via AbortController. Returns 401 (not a redirect)
// for non-owners so the fetch fails cleanly. Renders with the SAME pipeline as the public post page
// → preview == published.
export const dynamic = "force-dynamic";

const MAX_MARKDOWN = 200_000; // guard per-request CPU on workerd

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  // Reject oversized bodies before buffering (defense-in-depth; owner-only anyway).
  if (Number(req.headers.get("content-length") ?? 0) > MAX_MARKDOWN * 2) {
    return new Response("Payload too large", { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const markdown = (payload as { markdown?: unknown })?.markdown;
  if (typeof markdown !== "string") return new Response("Missing 'markdown'", { status: 400 });

  const html = await renderMarkdown(markdown.slice(0, MAX_MARKDOWN));
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
