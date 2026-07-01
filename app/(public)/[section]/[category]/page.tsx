import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { listPublishedPosts, listSections, sectionCoverage } from "@/lib/db/queries";
import { DOMAIN_SUB } from "@/lib/content/copy";
import { slugify } from "@/lib/slug";
import { ArchiveList } from "@/components/site/archive-list";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CERT_SLUGS = ["a-plus", "security-plus", "network-plus"];

type Params = {
  params: Promise<{ section: string; category: string }>;
  searchParams: Promise<{ sort?: string }>;
};

async function resolve(section: string, category: string) {
  if (!CERT_SLUGS.includes(section)) return null;
  const coverage = await sectionCoverage(section);
  const domain = coverage.domains.find((d) => slugify(d.name) === category);
  return domain ? { domain } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section, category } = await params;
  const found = await resolve(section, category);
  return found ? { title: found.domain.name } : {};
}

export default async function DomainArchivePage({ params, searchParams }: Params) {
  const { section, category } = await params;
  const { sort: sortParam } = await searchParams;
  const found = await resolve(section, category);
  if (!found) notFound();

  const { domain } = found;
  const sort = sortParam === "oldest" ? "oldest" : "newest";
  const [posts, sections] = await Promise.all([
    listPublishedPosts({ domainId: domain.id, sort }),
    listSections(),
  ]);
  const sectionName = sections.find((s) => s.slug === section)?.name ?? section;
  const blurb = DOMAIN_SUB[domain.domainRef];
  const base = `/${section}/${category}`;

  const intro = (
    <div className="mb-7">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-3">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">{domain.name}</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {sectionName} · {domain.exam}
        </span>
      </div>
      {blurb && (
        <p className="mb-4 max-w-[70ch] text-base leading-[1.6] text-muted-foreground">{blurb}</p>
      )}
      <div className="inline-flex items-center gap-2.5 rounded-md border border-border bg-card px-3.5 py-2">
        {domain.done ? (
          <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Check size={11} strokeWidth={3} aria-hidden />
          </span>
        ) : (
          <span className="inline-flex size-[18px] rounded-full border-[1.5px] border-border" aria-hidden />
        )}
        <span className={cn("text-[13px] font-medium", !domain.done && "text-muted-foreground")}>
          {domain.done ? "Covered" : "Not started"}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {domain.postCount} {domain.postCount === 1 ? "post" : "posts"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / {sectionName} / {domain.name}
      </nav>
      <ArchiveList
        intro={intro}
        posts={posts}
        countLabel={`${posts.length} ${posts.length === 1 ? "post" : "posts"} in this domain`}
        sort={sort}
        newestHref={base}
        oldestHref={`${base}?sort=oldest`}
        emptyMessage="This domain does not have a write-up yet — it is on the list. Browse everything in the meantime."
      />
    </div>
  );
}
