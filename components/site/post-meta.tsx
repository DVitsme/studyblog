import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/lib/format";
import type { PostType } from "@/lib/taxonomy";

// Reference-style posts (cheat sheets / link lists) are living documents: they show the
// *updated* date and read "reference" instead of a reading-time estimate. See design handoff §3.
const REFERENCE_TYPES = new Set<PostType>(["cram", "resources"]);

export type PostMetaFields = {
  publishedAt: Date | null;
  updatedAt: Date;
  type: PostType;
  readingMinutes: number | null;
};

// Library §1.3 PostMeta — the mono meta line (date · reading time). One component covers every
// surface via two switches: `label` prefixes "Published/Updated"; `compact` uses a short date +
// "min" (the dense cert-hub / list rows) vs the full date + "min read" (cards, post header).
export function PostMeta({
  publishedAt,
  updatedAt,
  type,
  readingMinutes,
  label = false,
  compact = false,
  className,
}: PostMetaFields & { label?: boolean; compact?: boolean; className?: string }) {
  const reference = REFERENCE_TYPES.has(type);
  const date = reference ? updatedAt : publishedAt;
  const prefix = label ? (reference ? "Updated " : "Published ") : "";
  const dateStr = compact ? formatDateShort(date) : formatDate(date);
  const read = reference ? "reference" : `${readingMinutes ?? 1} min${compact ? "" : " read"}`;

  return (
    <span className={cn("font-mono text-xs text-muted-foreground", className)}>
      {prefix}
      {dateStr} · {read}
    </span>
  );
}
