import Link from "next/link";
import { cn } from "@/lib/utils";

// Library §1.2 TagPill — a mono `#tag` pill linking to the tag hub. Shown by the slug so it reads
// like a hashtag (#firewalls), not the display name (#Firewalls).
export function TagPill({
  slug,
  label,
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/tags/${slug}`}
      className={cn(
        "inline-flex items-center rounded-full bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground no-underline hover:bg-accent hover:text-brand",
        className,
      )}
    >
      #{label ?? slug}
    </Link>
  );
}
