import Link from "next/link";
import { TypeChip } from "@/components/site/type-chip";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostCardData } from "@/lib/db/queries";

// The subset of fields a dense row renders — so both PostCardData and SearchResult satisfy it.
export type PostRowData = Pick<
  PostCardData,
  "slug" | "type" | "sectionName" | "domainName" | "title" | "excerpt" | "publishedAt"
>;

// Library §1.3 PostList — the dense reverse-chron row (a sibling of PostCard). Used on /posts
// (month-grouped), the Journey journal, and search results. Date sits right, meta reads inline.
export function PostRow({ post, className }: { post: PostRowData; className?: string }) {
  const crumb = post.domainName ? `${post.sectionName} · ${post.domainName}` : post.sectionName;
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "flex items-start gap-3.5 rounded-lg border border-border bg-card px-[17px] py-[15px] no-underline text-inherit transition-colors hover:border-brand",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <TypeChip type={post.type} />
          <span className="text-xs text-muted-foreground">{crumb}</span>
        </div>
        <h3 className="mb-[5px] text-base font-semibold leading-[1.3] tracking-[-0.01em] text-balance">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[13.5px] leading-[1.55] text-muted-foreground">{post.excerpt}</p>
        )}
      </div>
      <span className="shrink-0 whitespace-nowrap pt-px font-mono text-xs text-muted-foreground">
        {formatDateShort(post.publishedAt)}
      </span>
    </Link>
  );
}
