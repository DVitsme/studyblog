import Link from "next/link";
import { TypeChip } from "@/components/site/type-chip";
import { PostMeta } from "@/components/site/post-meta";
import { cn } from "@/lib/utils";
import type { PostCardData } from "@/lib/db/queries";

function crumbOf(post: PostCardData) {
  return post.domainName ? `${post.sectionName} · ${post.domainName}` : post.sectionName;
}

// Library §1.3 PostCard. Two layouts: `vertical` (grid tile — home + archive grids) and `stacked`
// (a full-width row with inline meta — cert-hub lists). Whole card is the link. `featured` enlarges
// the title for a hero slot. Parent controls flex-basis via className.
export function PostCard({
  post,
  variant = "vertical",
  featured = false,
  className,
}: {
  post: PostCardData;
  variant?: "vertical" | "stacked";
  featured?: boolean;
  className?: string;
}) {
  const href = `/posts/${post.slug}`;
  const crumb = crumbOf(post);

  if (variant === "stacked") {
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-col rounded-lg border border-border bg-card px-[18px] py-4 no-underline text-inherit transition-colors hover:border-brand",
          className,
        )}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <TypeChip type={post.type} />
          <span className="text-xs text-muted-foreground">{crumb}</span>
          <PostMeta {...post} compact className="ml-auto" />
        </div>
        <h3 className="mb-1.5 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em] text-balance">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm leading-[1.55] text-muted-foreground">{post.excerpt}</p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card p-[18px] no-underline text-inherit transition-colors hover:border-brand",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TypeChip type={post.type} />
        <span className="text-xs text-muted-foreground">{crumb}</span>
      </div>
      <h3
        className={cn(
          "mb-2 font-semibold leading-[1.3] tracking-[-0.01em] text-balance",
          featured ? "text-xl" : "text-lg",
        )}
      >
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mb-4 flex-1 text-sm leading-[1.55] text-muted-foreground">{post.excerpt}</p>
      )}
      <PostMeta {...post} className="mt-auto" />
    </Link>
  );
}
