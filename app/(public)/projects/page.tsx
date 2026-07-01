import type { Metadata } from "next";
import { File } from "lucide-react";
import { listProjects } from "@/lib/db/queries";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / Projects
      </nav>
      <div className="mb-7">
        <h1 className="mb-2.5 text-[34px] font-semibold tracking-[-0.02em]">Projects</h1>
        <p className="max-w-[70ch] text-[17px] leading-[1.6] text-muted-foreground">
          Hands-on builds and security write-ups — the proof-of-work behind the certs, with real
          results and the repos to back them.
        </p>
      </div>
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} className="flex-[1_1_460px]" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<File size={20} aria-hidden />}
          title="No projects yet"
          message="The first project write-ups are on the way — check back soon."
          action={{ href: "/posts", label: "Browse all posts" }}
        />
      )}
    </div>
  );
}
