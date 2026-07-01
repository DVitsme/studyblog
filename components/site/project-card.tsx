import Link from "next/link";
import { Play } from "lucide-react";
import { GithubIcon } from "@/components/site/icons";
import { TypeChip } from "@/components/site/type-chip";
import { PostMeta } from "@/components/site/post-meta";
import { isShipped, parseMetric } from "@/lib/project";
import { cn } from "@/lib/utils";
import type { ProjectCardData } from "@/lib/db/queries";

// Library §1.3 ProjectCard — the proof-of-work tile. Brand-outline "project" chip + status dot
// (chart-2 shipped / muted in-progress) + brand metric chips + repo/demo indicators. The whole card
// links to the write-up; repo/demo are non-link indicators here (the real links live on the article's
// AtAGlanceCard) to avoid nesting anchors.
export function ProjectCard({ project, className }: { project: ProjectCardData; className?: string }) {
  const crumb = project.domainName ? `${project.sectionName} · ${project.domainName}` : project.sectionName;
  const meta = project.projectMeta;
  const shipped = isShipped(meta?.status);
  const metrics = (meta?.metrics ?? []).map(parseMetric);

  return (
    <Link
      href={`/posts/${project.slug}`}
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card p-[22px] no-underline text-inherit transition-colors hover:border-brand",
        className,
      )}
    >
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <TypeChip type="project" variant="brand" />
        <span className="text-xs text-muted-foreground">{crumb}</span>
        {meta?.status && (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 text-xs font-semibold",
              shipped ? "text-chart-2" : "text-muted-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", shipped ? "bg-chart-2" : "bg-muted-foreground")} />
            {meta.status}
          </span>
        )}
      </div>
      <h3 className="mb-2.5 text-xl font-semibold leading-[1.25] tracking-[-0.01em] text-balance">
        {project.title}
      </h3>
      {project.excerpt && (
        <p className="mb-4 text-sm leading-[1.55] text-muted-foreground">{project.excerpt}</p>
      )}
      {metrics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {metrics.map((m, i) => (
            <span
              key={`${m.value}-${i}`}
              className="inline-flex items-baseline gap-1.5 rounded-sm border border-border bg-background px-2.5 py-[5px]"
            >
              <span className="font-mono text-sm font-semibold text-brand">{m.value}</span>
              {m.label && <span className="text-[11px] text-muted-foreground">{m.label}</span>}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-3.5 border-t border-border pt-3.5">
        {project.repoUrl && (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
            <GithubIcon size={14} />
            Repo
          </span>
        )}
        {project.demoUrl && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Play size={14} aria-hidden />
            Demo
          </span>
        )}
        <PostMeta {...project} compact className="ml-auto" />
      </div>
    </Link>
  );
}
