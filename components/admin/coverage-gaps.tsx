import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";
import type { CoverageGap } from "@/lib/db/queries";

// Library §30 — CoverageGaps: official domains with no published post → "write next".
export function CoverageGaps({ gaps }: { gaps: CoverageGap[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">Coverage gaps</h2>
        <p className="text-xs text-muted-foreground">Domains with no published post yet</p>
      </div>
      {gaps.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          🎉 Every domain has a published post.
        </p>
      ) : (
        <ul>
          {gaps.map((g) => (
            <li key={g.domainRef}>
              <Link
                href={`/admin/posts/new?section=${g.sectionSlug}`}
                className="group flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 hover:bg-accent"
              >
                <Circle className="size-4 shrink-0 text-muted-foreground/40" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{g.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{g.exam}</div>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand">
                  Write <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
