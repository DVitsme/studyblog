import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/db/queries";
import { ArchiveList } from "@/components/site/archive-list";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagArchivePage({ params, searchParams }: Params) {
  const { tag } = await params;
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "oldest" ? "oldest" : "newest";
  const posts = await listPublishedPosts({ tagSlug: tag, sort });
  const base = `/tags/${tag}`;

  const intro = (
    <div className="mb-7">
      <h1 className="mb-2.5 font-mono text-[32px] font-semibold tracking-[-0.02em] text-brand">
        #{tag}
      </h1>
      <p className="max-w-[70ch] text-base leading-[1.6] text-muted-foreground">
        Everything tagged <span className="font-mono">#{tag}</span> — the thread as it runs across the
        three certs.
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / Tags / #{tag}
      </nav>
      <ArchiveList
        intro={intro}
        posts={posts}
        countLabel={`${posts.length} ${posts.length === 1 ? "post" : "posts"} tagged ${tag}`}
        sort={sort}
        newestHref={base}
        oldestHref={`${base}?sort=oldest`}
        emptyMessage={`Nothing is tagged #${tag} yet. Browse everything instead.`}
      />
    </div>
  );
}
