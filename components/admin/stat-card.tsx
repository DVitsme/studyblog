import type { LucideIcon } from "lucide-react";

// Library §33 — StatCard: mono-uppercase label + icon + big mono value + sub.
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex-1 basis-[200px] rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
