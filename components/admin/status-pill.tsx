import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/taxonomy";

// Library §31: published = brand tint, draft = muted. Mono uppercase 10px.
export function StatusPill({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
        status === "published" ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
