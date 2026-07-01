import { cn } from "@/lib/utils";

// The reading surface. Renders pre-sanitized HTML from lib/content/render.ts (sanitized at
// render time via rehype-sanitize) inside the styled `.prose-content` container (see globals.css).
// Shared by the public post page and the admin editor live-preview, so preview == published.
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
