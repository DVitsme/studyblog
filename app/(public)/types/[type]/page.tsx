import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPublishedPosts } from "@/lib/db/queries";
import { TYPE_BLURB } from "@/lib/content/copy";
import { POST_TYPES, POST_TYPE_LABELS, type PostType } from "@/lib/taxonomy";
import { ArchiveList } from "@/components/site/archive-list";
import { TypeChip } from "@/components/site/type-chip";

export const dynamic = "force-dynamic";

const isType = (t: string): t is PostType => (POST_TYPES as readonly string[]).includes(t);

type Params = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  return isType(type) ? { title: POST_TYPE_LABELS[type] } : {};
}

export default async function TypeArchivePage({ params, searchParams }: Params) {
  const { type } = await params;
  if (!isType(type)) notFound();
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "oldest" ? "oldest" : "newest";
  const posts = await listPublishedPosts({ type, sort });
  const base = `/types/${type}`;
  const label = POST_TYPE_LABELS[type];

  const intro = (
    <div className="mb-7">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <TypeChip type={type} variant="brand" className="rounded-md px-3 py-1 text-sm" />
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">{label}</h1>
      </div>
      {TYPE_BLURB[type] && (
        <p className="max-w-[70ch] text-base leading-[1.6] text-muted-foreground">{TYPE_BLURB[type]}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / Types / {label}
      </nav>
      <ArchiveList
        intro={intro}
        posts={posts}
        countLabel={`${posts.length} ${label.toLowerCase()} ${posts.length === 1 ? "post" : "posts"}`}
        sort={sort}
        newestHref={base}
        oldestHref={`${base}?sort=oldest`}
        emptyMessage={`No ${label.toLowerCase()} posts yet. Browse everything instead.`}
      />
    </div>
  );
}
