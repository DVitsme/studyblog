import { cn } from "@/lib/utils";
import type { PostType } from "@/lib/taxonomy";

// Library §1.2 — the post-type axis as a restrained mono chip. Monochrome (`muted`) by default;
// the `brand` variant (brand outline) marks the "project" chip and the active chip on /types/[type].
export function TypeChip({
  type,
  variant = "muted",
  className,
}: {
  type: PostType;
  variant?: "muted" | "brand";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium",
        variant === "brand" ? "border-brand text-brand" : "border-border bg-background text-muted-foreground",
        className,
      )}
    >
      {type}
    </span>
  );
}
