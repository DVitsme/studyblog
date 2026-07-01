import { Play } from "lucide-react";
import { GithubIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import { isShipped, parseMetric } from "@/lib/project";
import { cn } from "@/lib/utils";
import type { ProjectMeta } from "@/lib/db/schema";

// Library §1.3 AtAGlanceCard — the project write-up centerpiece. Scannable results: status pill,
// brand metric tiles, mono meta rows (goal/stack/duration), repo + demo buttons. Sits between the
// lede and the prose on a type=project article.
export function AtAGlanceCard({
  meta,
  repoUrl,
  demoUrl,
}: {
  meta: ProjectMeta;
  repoUrl?: string | null;
  demoUrl?: string | null;
}) {
  const shipped = isShipped(meta.status);
  const metrics = (meta.metrics ?? []).map(parseMetric);
  const stack = meta.stack?.length ? meta.stack.join(", ") : null;

  return (
    <section
      aria-label="Project at a glance"
      className="mb-8 rounded-lg border border-border bg-card p-[22px]"
    >
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          At a glance
        </span>
        {meta.status && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold",
              shipped ? "text-chart-2" : "text-muted-foreground",
            )}
          >
            <span className={cn("size-[7px] rounded-full", shipped ? "bg-chart-2" : "bg-muted-foreground")} />
            {meta.status}
            {meta.duration ? ` · ${meta.duration}` : ""}
          </span>
        )}
      </div>

      {metrics.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2.5">
          {metrics.map((m, i) => (
            <div key={`${m.value}-${i}`} className="flex-1 basis-[150px] rounded-md border border-border px-4 py-3.5">
              <div className="font-mono text-[26px] font-semibold leading-none text-brand">{m.value}</div>
              {m.label && <div className="mt-1.5 text-xs text-muted-foreground">{m.label}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-2.5">
        {meta.goal && <MetaRow k="Goal" v={meta.goal} />}
        {stack && <MetaRow k="Stack" v={stack} />}
        {meta.duration && <MetaRow k="Duration" v={meta.duration} />}
      </div>

      {(repoUrl || demoUrl) && (
        <div className="flex flex-wrap gap-2.5">
          {repoUrl && (
            <Button asChild>
              <a href={repoUrl} target="_blank" rel="noreferrer">
                <GithubIcon size={15} />
                GitHub repo
              </a>
            </Button>
          )}
          {demoUrl && (
            <Button asChild variant="secondary">
              <a href={demoUrl} target="_blank" rel="noreferrer">
                <Play size={15} aria-hidden />
                Demo video
              </a>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3.5">
      <span className="shrink-0 basis-[76px] font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
        {k}
      </span>
      <span className="text-sm leading-[1.5]">{v}</span>
    </div>
  );
}
