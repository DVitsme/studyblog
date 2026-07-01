import Link from "next/link";
import { TypeChip } from "@/components/site/type-chip";
import { PostMeta } from "@/components/site/post-meta";
import type { PostCardData } from "@/lib/db/queries";

// Library §1.3 RelatedPosts — up to 3 compact cards selected by shared tags. Compact = chip + title +
// meta (no excerpt), a denser sibling of PostCard.
export function RelatedPosts({
  posts,
  heading = "Related posts",
}: {
  posts: PostCardData[];
  heading?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="mb-3.5 text-lg font-semibold tracking-tight">{heading}</h2>
      <div className="flex flex-wrap gap-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="flex flex-1 basis-[200px] flex-col rounded-lg border border-border bg-card p-4 no-underline text-inherit hover:border-brand"
          >
            <div className="mb-2.5">
              <TypeChip type={p.type} />
            </div>
            <h3 className="mb-2 text-[15px] font-semibold leading-[1.3] text-balance">{p.title}</h3>
            <PostMeta {...p} compact className="mt-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
