import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PostLink } from "@/lib/db/queries";

// Library §1.3 PrevNext — two cards linking to the previous/next post within the same domain/series.
// Either side may be absent (ends of the sequence).
export function PrevNext({
  prev,
  next,
  scopeLabel,
}: {
  prev: PostLink | null;
  next: PostLink | null;
  scopeLabel?: string;
}) {
  if (!prev && !next) return null;
  const suffix = scopeLabel ? ` in ${scopeLabel}` : "";
  return (
    <div className="mt-7 flex flex-wrap gap-3">
      {prev && <Card link={prev} label={`← Previous${suffix}`} />}
      {next && <Card link={next} label={`Next${suffix} →`} align="end" />}
    </div>
  );
}

function Card({ link, label, align }: { link: PostLink; label: string; align?: "end" }) {
  return (
    <Link
      href={`/posts/${link.slug}`}
      className={cn(
        "flex flex-1 basis-60 flex-col gap-1.5 rounded-lg border border-border bg-card p-4 no-underline text-inherit hover:border-brand",
        align === "end" && "items-end text-right",
      )}
    >
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[15px] font-semibold leading-[1.3]">{link.title}</span>
    </Link>
  );
}
