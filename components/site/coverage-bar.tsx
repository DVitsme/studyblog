import { cn } from "@/lib/utils";

export function pct(covered: number, total: number): number {
  return total > 0 ? Math.round((covered / total) * 100) : 0;
}

// The bare animated track+fill — the reusable atom behind CoverageBar, SectionHub's overall bar,
// CrossCertCard's mini bars, and CertCard's line. Carries the a11y role so every usage announces.
// Grow-in is CSS-only and gated behind motion-safe (see globals.css @keyframes coverage-grow).
export function CoverageTrack({
  value,
  heightClass = "h-2",
  label,
  className,
}: {
  value: number; // 0–100
  heightClass?: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("relative overflow-hidden rounded-full bg-muted", heightClass, className)}
    >
      <div
        className="absolute left-0 top-0 h-full origin-left rounded-full bg-brand motion-safe:animate-coverage-grow"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// Library §1.3 CoverageBar (signature) — labeled bar used in the Home progress snapshot:
// name + exam · "N of M domains" + % · track · optional note. The % label is always rendered
// (never color-only). Zero coverage → empty track + note.
export function CoverageBar({
  name,
  exam,
  covered,
  total,
  note,
}: {
  name: string;
  exam?: string | null;
  covered: number;
  total: number;
  note?: string | null;
}) {
  const value = pct(covered, total);
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="text-base font-semibold">{name}</span>
          {exam && <span className="font-mono text-xs text-muted-foreground">{exam}</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-muted-foreground">
            {covered} of {total} domains
          </span>
          <span className="font-mono text-base font-semibold text-brand">{value}%</span>
        </div>
      </div>
      <CoverageTrack value={value} label={`${name} coverage: ${value}%`} />
      {note && <div className="mt-1.5 text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}
