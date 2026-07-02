import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import {
  countPublishedPosts,
  listPublishedPosts,
  sectionFacets,
  tagFacets,
  typeFacets,
  type PostCardData,
} from "@/lib/db/queries";
import { POST_TYPES, type PostType } from "@/lib/taxonomy";
import { PostRow } from "@/components/site/post-list";
import { FacetBar } from "@/components/site/facet-bar";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All posts" };

const PAGE_SIZE = 20;

type SP = { section?: string; type?: string; tag?: string; q?: string; sort?: string; page?: string };

// Posts arrive newest- or oldest-first already, so consecutive grouping preserves order.
function groupByMonth(posts: PostCardData[]) {
  const groups: { label: string; posts: PostCardData[] }[] = [];
  for (const p of posts) {
    const d = p.publishedAt ?? p.updatedAt;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.posts.push(p);
    else groups.push({ label, posts: [p] });
  }
  return groups;
}

function hrefWith(sp: SP, patch: Partial<SP>) {
  const p = new URLSearchParams();
  const merged = { ...sp, ...patch };
  for (const k of ["section", "type", "tag", "q", "sort", "page"] as const) {
    if (merged[k]) p.set(k, merged[k] as string);
  }
  const qs = p.toString();
  return qs ? `/posts?${qs}` : "/posts";
}

export default async function AllPostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === "oldest" ? "oldest" : "newest";
  const type =
    sp.type && (POST_TYPES as readonly string[]).includes(sp.type) ? (sp.type as PostType) : undefined;
  const filter = { section: sp.section, type, tagSlug: sp.tag, q: sp.q, sort } as const;

  const [posts, total, sections, types, tags] = await Promise.all([
    listPublishedPosts({ ...filter, limit: page * PAGE_SIZE }),
    countPublishedPosts(filter),
    sectionFacets(),
    typeFacets(),
    tagFacets(),
  ]);

  const groups = groupByMonth(posts);
  const hasMore = page * PAGE_SIZE < total;
  const hasFilters = Boolean(sp.section || sp.type || sp.tag || sp.q);

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / All posts
      </nav>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-[32px] font-semibold tracking-[-0.02em]">All posts</h1>
          <p className="max-w-[64ch] text-base leading-[1.6] text-muted-foreground">
            Everything I have published, newest first — filter by cert, type, or tag.
          </p>
        </div>
      </div>

      <FacetBar sections={sections} types={types} tags={tags} />

      <div className="mb-[18px] flex items-center justify-between gap-3 border-b border-border pb-3.5">
        <span aria-live="polite" className="font-mono text-xs text-muted-foreground">
          {total} {total === 1 ? "post" : "posts"}
          {hasFilters ? " · filtered" : " · all certs"}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="mr-1">Sort</span>
          <Link
            href={hrefWith(sp, { sort: undefined, page: undefined })}
            className={sort === "newest" ? "rounded-sm bg-muted px-2 py-1 text-foreground no-underline" : "rounded-sm px-2 py-1 no-underline hover:text-foreground"}
          >
            Newest
          </Link>
          <Link
            href={hrefWith(sp, { sort: "oldest", page: undefined })}
            className={sort === "oldest" ? "rounded-sm bg-muted px-2 py-1 text-foreground no-underline" : "rounded-sm px-2 py-1 no-underline hover:text-foreground"}
          >
            Oldest
          </Link>
        </div>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<Search size={20} aria-hidden />}
          title="No posts match those filters"
          message="Try removing a filter or two — or browse everything with the filters cleared."
          action={{ href: "/posts", label: "Clear all filters" }}
          showArrow={false}
        />
      ) : (
        <div className="flex flex-col gap-[26px]">
          {groups.map((g) => (
            <div key={g.label}>
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {g.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {g.posts.map((p) => (
                  <PostRow key={p.slug} post={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-7 flex justify-center">
          <Link
            href={hrefWith(sp, { page: String(page + 1) })}
            className="inline-flex h-[38px] items-center gap-[7px] rounded-md border border-border bg-background px-[18px] text-sm font-medium text-foreground no-underline hover:bg-accent"
          >
            Load older posts
            <ChevronDown size={14} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
