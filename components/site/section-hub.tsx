import Link from "next/link";
import { CoverageTrack, pct } from "@/components/site/coverage-bar";

// Library §1.3 SectionHub — the cert-hub intro: breadcrumb, title + exam chip, description, and the
// overall coverage card with an honest note.
export function SectionHub({
  name,
  exam,
  covered,
  total,
  description,
  note,
}: {
  name: string;
  exam?: string | null;
  covered: number;
  total: number;
  description: string;
  note?: string;
}) {
  const value = pct(covered, total);
  return (
    <section className="mb-9">
      <nav aria-label="Breadcrumb" className="mb-3.5 font-mono text-xs text-muted-foreground">
        <Link href="/" className="text-muted-foreground no-underline hover:text-brand">
          Home
        </Link>
        {" / "}
        <span className="text-foreground">{name}</span>
      </nav>
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">{name}</h1>
        {exam && (
          <span className="rounded-sm border border-brand px-2.5 py-[3px] font-mono text-xs font-medium text-brand">
            {exam}
          </span>
        )}
      </div>
      <p className="mb-[22px] max-w-[68ch] text-[17px] leading-[1.6] text-muted-foreground">
        {description}
      </p>
      <div className="max-w-[640px] rounded-lg border border-border bg-card px-5 py-[18px]">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold">Overall coverage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] text-muted-foreground">
              {covered} of {total} domains
            </span>
            <span className="font-mono text-lg font-semibold text-brand">{value}%</span>
          </div>
        </div>
        <CoverageTrack
          value={value}
          heightClass="h-2"
          label={`Overall ${name} coverage: ${value}%`}
          className="mb-3"
        />
        {note && <p className="text-[13px] leading-[1.5] text-muted-foreground">{note}</p>}
      </div>
    </section>
  );
}
