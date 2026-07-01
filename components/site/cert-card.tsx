import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverageTrack, pct } from "@/components/site/coverage-bar";
import { cn } from "@/lib/utils";
import type { CertCardData } from "@/lib/db/queries";

// Library §1.3 CertCard — a whole-card link to a cert hub: big % in brand + covered/total + a thin
// progress line + count/Explore footer. Zero posts → "No posts yet" and an empty track (honest).
export function CertCard({ cert, className }: { cert: CertCardData; className?: string }) {
  const value = pct(cert.covered, cert.total);
  return (
    <Link
      href={`/${cert.slug}`}
      className={cn(
        "flex flex-1 basis-60 flex-col rounded-lg border border-border bg-card p-[18px] no-underline text-inherit transition-colors hover:border-brand",
        className,
      )}
    >
      <div className="mb-3.5 flex items-baseline justify-between gap-2">
        <span className="text-base font-semibold">{cert.name}</span>
        {cert.examCodes && (
          <span className="font-mono text-[11px] text-muted-foreground">{cert.examCodes}</span>
        )}
      </div>
      <div className="mb-2.5 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold leading-none text-brand">{value}%</span>
        <span className="text-xs text-muted-foreground">
          {cert.covered} of {cert.total} domains
        </span>
      </div>
      <CoverageTrack
        value={value}
        heightClass="h-1"
        label={`${cert.name} coverage: ${value}%`}
        className="mb-3.5"
      />
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {cert.postCount > 0 ? `${cert.postCount} ${cert.postCount === 1 ? "post" : "posts"}` : "No posts yet"}
        </span>
        <span className="inline-flex items-center gap-[5px] text-[13px] font-medium text-brand">
          Explore <ArrowRight size={13} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
