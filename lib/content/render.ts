import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { rehypeShikiVendored } from "./rehype-shiki";

// Render Markdown (from D1) to SANITIZED HTML on Cloudflare Workers.
//
// Highlighting is done by our own `rehypeShikiVendored` (calls a vendored HighlighterCore) — NOT
// @shikijs/rehype, which drags the full Shiki grammar barrel into the worker (see rehype-shiki.ts).
//
// Plugin order is load-bearing: sanitize runs right after remark-rehype (UNTRUSTED content), BEFORE
// slug/autolink/shiki (trusted, machine-generated) — keeps Shiki styles + heading anchors intact and
// never allows `style`. `allowDangerousHtml` stays false → raw HTML is dropped, so the default
// sanitize schema (which keeps `language-*` on <code>) suffices. See plan/02-architecture.md §4.1.
//
// Callers cache this: the public post page wraps it in `use cache` (Phase 3); the admin live-preview
// route handler calls it directly.
export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeShikiVendored)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

export { readingMinutes } from "./reading";
