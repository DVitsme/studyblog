import { cn } from "@/lib/utils";

export type MilestoneKind = "target" | "start" | "ship" | "pass";
export type Milestone = {
  date: string;
  tag: string;
  tagKind: MilestoneKind;
  title: string;
  note: string;
  filled: boolean;
  future?: boolean;
};

const TAG_STYLES: Record<MilestoneKind, string> = {
  target: "border border-dashed border-border text-muted-foreground",
  start: "bg-muted text-muted-foreground",
  ship: "bg-chart-2/20 text-success",
  pass: "bg-brand/10 text-brand",
};

// Library §1.3 JourneyTimeline — a vertical rail of milestones. Filled dot = a pass/ship/start that
// happened; hollow dot = an upcoming target. Semantic ordered list, newest first.
export function JourneyTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className="relative flex flex-col gap-[26px] border-l border-border pl-7">
      {milestones.map((m, i) => (
        <li key={`${m.date}-${i}`} className="relative">
          <span
            className={cn(
              "absolute left-[-34px] top-1 size-[13px] rounded-full ring-4 ring-background",
              m.filled ? "border-2 border-brand bg-brand" : "border-2 border-border bg-background",
            )}
            aria-hidden
          />
          <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
            <span className="font-mono text-xs text-muted-foreground">{m.date}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em]",
                TAG_STYLES[m.tagKind],
              )}
            >
              {m.tag}
            </span>
          </div>
          <h3
            className={cn(
              "text-[17px] font-semibold leading-[1.3] tracking-[-0.01em]",
              m.future ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {m.title}
          </h3>
          <p className="mt-1 text-sm leading-[1.55] text-muted-foreground">{m.note}</p>
        </li>
      ))}
    </ol>
  );
}
