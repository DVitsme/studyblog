import { CoverageTrack, pct } from "@/components/site/coverage-bar";
import { cn } from "@/lib/utils";
import type { CertCardData } from "@/lib/db/queries";

// Library §1.3 CrossCertCard — mini bars for all three certs with the current one flagged "You are
// here". Makes the honest A+/Security+ > Network+ story legible on every hub.
export function CrossCertCard({
  certs,
  currentSlug,
}: {
  certs: CertCardData[];
  currentSlug: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-1 text-base font-semibold">Where I am across the certs</h2>
      <p className="mb-[18px] text-[13px] leading-[1.5] text-muted-foreground">
        One honest snapshot. Security+ leads; Network+ is just beginning.
      </p>
      <div className="flex flex-col gap-4">
        {certs.map((c) => {
          const value = pct(c.covered, c.total);
          const isCurrent = c.slug === currentSlug;
          const tag = isCurrent
            ? `You are here · ${c.covered} of ${c.total}`
            : c.covered === 0
              ? `Just started · ${c.covered} of ${c.total}`
              : `${c.covered} of ${c.total} domains`;
          return (
            <div key={c.slug}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-sm",
                    isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                  )}
                >
                  {c.name}
                </span>
                <span className="font-mono text-[13px] font-semibold text-brand">{value}%</span>
              </div>
              <CoverageTrack value={value} heightClass="h-1.5" label={`${c.name} coverage: ${value}%`} />
              <div
                className={cn(
                  "mt-[5px] text-[11px]",
                  isCurrent ? "font-medium text-brand" : "text-muted-foreground",
                )}
              >
                {tag}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
