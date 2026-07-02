import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, prevNextForPost, relatedPosts } from "@/lib/db/queries";
import { renderMarkdownWithToc } from "@/lib/content/render";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { Prose } from "@/components/site/prose";
import { PostMeta } from "@/components/site/post-meta";
import { TypeChip } from "@/components/site/type-chip";
import { TagPill } from "@/components/site/tag-pill";
import { Toc, TocMobile } from "@/components/site/toc";
import { PrevNext } from "@/components/site/prev-next";
import { RelatedPosts } from "@/components/site/related-posts";
import { AtAGlanceCard } from "@/components/site/at-a-glance";

// Runtime-first (option C): render on request from D1 — no build-time binding coupling. The final
// caching task flips param routes like this one to on-demand ISR + revalidate-on-publish.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/posts/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const [{ html, toc }, nav, related] = await Promise.all([
    renderMarkdownWithToc(post.bodyMd),
    prevNextForPost({
      id: post.id,
      sectionSlug: post.sectionSlug,
      domainId: post.domainId,
      publishedAt: post.publishedAt,
    }),
    relatedPosts(post.id, 3),
  ]);

  const isProject = post.type === "project";
  const scopeLabel = post.domainName ?? post.sectionName;

  const crumbs: { label: string; href: string }[] = isProject
    ? [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: post.sectionName, href: `/${post.sectionSlug}` },
      ];
  if (post.domainName) {
    crumbs.push({ label: post.domainName, href: `/${post.sectionSlug}/${slugify(post.domainName)}` });
  }

  return (
    <div className="mx-auto flex max-w-[1040px] items-start gap-12 px-5 pb-14 pt-7">
      <article className="min-w-0 max-w-[720px] flex-1">
        <nav aria-label="Breadcrumb" className="mb-[18px] font-mono text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 && " / "}
              <Link
                href={c.href}
                className={cn(
                  "no-underline",
                  i === crumbs.length - 1 ? "text-foreground" : "text-muted-foreground hover:text-brand",
                )}
              >
                {c.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <TypeChip type={post.type} variant={isProject ? "brand" : "muted"} />
          <PostMeta {...post} label />
        </div>

        <h1
          className={cn(
            "mb-4 font-semibold leading-[1.1] tracking-tight text-balance",
            isProject ? "text-[38px]" : "text-[40px]",
          )}
        >
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mb-6 text-[19px] leading-[1.6] text-muted-foreground">{post.excerpt}</p>
        )}

        {post.coverImageKey && (
          <div className="relative mb-3 aspect-[16/7] w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={`/media/${post.coverImageKey}`}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
        )}

        {isProject && post.projectMeta && (
          <AtAGlanceCard meta={post.projectMeta} repoUrl={post.repoUrl} demoUrl={post.demoUrl} />
        )}

        <TocMobile items={toc} />

        <div className={isProject ? "mt-2" : "mt-6"}>
          <Prose html={html} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((t) => (
              <TagPill key={t.slug} slug={t.slug} />
            ))}
          </div>
        )}

        <PrevNext prev={nav.prev} next={nav.next} scopeLabel={scopeLabel} />
        <RelatedPosts posts={related} heading={isProject ? "Related write-ups" : "Related posts"} />
      </article>

      <Toc items={toc} repoUrl={isProject ? post.repoUrl : null} />
    </div>
  );
}
