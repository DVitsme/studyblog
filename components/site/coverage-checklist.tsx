import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistDomain = {
  name: string;
  sub?: string | null;
  count: number;
  done: boolean;
};

// Library §1.3 CoverageChecklist (signature) — per-domain ✓/○ rows for a cert hub. Status is
// conveyed by icon AND text (an sr-only label), never color alone. `writeNext` is the honest
// "empty domains are where I'm headed" closing row (no divider, per the mockup).
export function CoverageChecklist({
  domains,
  writeNext,
}: {
  domains: ChecklistDomain[];
  writeNext?: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-2">
      {domains.map((d, i) => (
        <div
          key={d.name}
          className={cn(
            "flex items-center gap-3 py-3.5",
            (i < domains.length - 1 || writeNext) && "border-b border-border",
          )}
        >
          {d.done ? (
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <Check size={13} strokeWidth={3} aria-hidden />
            </span>
          ) : (
            <span className="inline-flex size-5 shrink-0 rounded-full border-[1.5px] border-border" aria-hidden />
          )}
          <div className="flex min-w-0 flex-col gap-px">
            <span className={cn("text-sm font-medium", d.done ? "text-foreground" : "text-muted-foreground")}>
              {d.name}
            </span>
            {d.sub && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                {d.sub}
              </span>
            )}
          </div>
          <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
            {d.count} {d.count === 1 ? "post" : "posts"}
          </span>
          <span className="sr-only">{d.done ? "covered" : "not started"}</span>
        </div>
      ))}
      {writeNext && (
        <div className="flex items-center gap-2 py-3.5 text-muted-foreground">
          <ArrowRight size={15} className="shrink-0" aria-hidden />
          <span className="text-sm">
            Empty domains are exactly where I&apos;m headed next —{" "}
            <span className="font-medium text-foreground">{writeNext}</span> is up first.
          </span>
        </div>
      )}
    </div>
  );
}
