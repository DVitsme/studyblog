import Link from "next/link";
import { File } from "lucide-react";
import type { ReactNode } from "react";
import { PostCard } from "@/components/site/post-card";
import { EmptyState } from "@/components/site/empty-state";
import { cn } from "@/lib/utils";
import type { PostCardData } from "@/lib/db/queries";

// Library §1.3 ArchiveList — one component, three intro variants (domain/tag/type). The page builds
// the variant-specific `intro`; this owns the shared count + sort bar, the PostCard grid, and the
// empty state. Sort is a link toggle over ?sort= (server-rendered).
export function ArchiveList({
  intro,
  posts,
  countLabel,
  sort,
  newestHref,
  oldestHref,
  emptyMessage,
}: {
  intro: ReactNode;
  posts: PostCardData[];
  countLabel: string;
  sort: "newest" | "oldest";
  newestHref: string;
  oldestHref: string;
  emptyMessage: string;
}) {
  return (
    <div>
      {intro}
      <div className="mb-[18px] flex items-center justify-between gap-3 border-b border-border pb-3.5">
        <span className="font-mono text-xs text-muted-foreground">{countLabel}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="mr-1">Sort</span>
          <SortLink href={newestHref} active={sort === "newest"}>
            Newest
          </SortLink>
          <SortLink href={oldestHref} active={sort === "oldest"}>
            Oldest
          </SortLink>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="flex flex-wrap gap-3.5">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} className="flex-[1_1_330px]" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<File size={20} aria-hidden />}
          title="No posts here yet"
          message={emptyMessage}
          action={{ href: "/posts", label: "Browse all posts" }}
        />
      )}
    </div>
  );
}

function SortLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-sm px-2 py-1 no-underline",
        active ? "bg-muted text-foreground" : "hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
