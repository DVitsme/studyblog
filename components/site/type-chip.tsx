import { cn } from "@/lib/utils";
import type { PostType } from "@/lib/taxonomy";

// Library §3 — the post-type axis as a restrained mono chip (monochrome, not color-coded).
export function TypeChip({ type, className }: { type: PostType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {type}
    </span>
  );
}
