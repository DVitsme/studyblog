// Library §1.3 NowBlock — "what I'm doing right now" card at the top of /journey.
export function NowBlock({
  headline,
  note,
  stats,
}: {
  headline: string;
  note: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-[22px]">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="inline-flex size-2 rounded-full bg-brand shadow-[0_0_0_4px_var(--brand-subtle)]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand">Now</span>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-[22px]">
        <div className="flex-[1_1_240px]">
          <h2 className="mb-1.5 text-lg font-semibold tracking-[-0.01em]">{headline}</h2>
          <p className="text-sm leading-[1.6] text-muted-foreground">{note}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[92px]">
              <div className="font-mono text-2xl font-semibold leading-none text-brand">{s.value}</div>
              <div className="mt-[5px] text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
