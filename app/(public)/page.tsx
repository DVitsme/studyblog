import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  certCards,
  countPublishedPosts,
  featuredProject,
  listPublishedPosts,
} from "@/lib/db/queries";
import { HomeHook } from "@/components/site/home-hook";
import { CoverageBar } from "@/components/site/coverage-bar";
import { CertCard } from "@/components/site/cert-card";
import { ProjectCard } from "@/components/site/project-card";
import { PostCard } from "@/components/site/post-card";

// Runtime-first (option C) — see /posts/[slug]. Home reads coverage + latest posts from D1 per request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [certs, project, latest, count] = await Promise.all([
    certCards(),
    featuredProject(),
    listPublishedPosts({ limit: 4 }),
    countPublishedPosts(),
  ]);

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-10">
      <HomeHook postCount={count} />

      <section className="mb-12">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Coverage so far</h2>
          <span className="font-mono text-xs text-muted-foreground">domains documented ÷ total</span>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          A domain counts as covered once it has at least one published post. Honest, not gamified.
        </p>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-[22px]">
            {certs.map((c) => (
              <CoverageBar
                key={c.slug}
                name={c.name}
                exam={c.examCodes}
                covered={c.covered}
                total={c.total}
                note={c.postCount === 0 ? "Just started — first posts landing soon." : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.02em]">The three certs</h2>
        <div className="flex flex-wrap gap-3.5">
          {certs.map((c) => (
            <CertCard key={c.slug} cert={c} />
          ))}
        </div>
      </section>

      {project && (
        <section className="mb-12">
          <div className="mb-4 flex items-baseline gap-2.5">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Featured project</h2>
            <span className="font-mono text-xs text-muted-foreground">proof of work</span>
          </div>
          <ProjectCard project={project} />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Latest posts</h2>
          <Link
            href="/posts"
            className="inline-flex items-center gap-[5px] text-sm font-medium text-brand no-underline"
          >
            View all
            <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3.5">
          {latest.map((p) => (
            <PostCard key={p.slug} post={p} className="flex-[1_1_440px]" />
          ))}
        </div>
      </section>
    </div>
  );
}
