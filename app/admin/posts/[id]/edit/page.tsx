import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/dal";
import { getPostForEdit, listAllDomains, listSections, listTags } from "@/lib/db/queries";
import { PostEditor } from "@/components/admin/editor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const [post, sections, domains, tags] = await Promise.all([
    getPostForEdit(postId),
    listSections(),
    listAllDomains(),
    listTags(),
  ]);
  if (!post) notFound();

  return (
    <PostEditor
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        bodyMd: post.bodyMd,
        excerpt: post.excerpt ?? "",
        sectionSlug: post.sectionSlug,
        domainId: post.domainId,
        type: post.type,
        status: post.status,
        tags: post.tags,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "",
      }}
      sections={sections.map((s) => ({ slug: s.slug, name: s.name, examCodes: s.examCodes }))}
      domains={domains}
      tagSuggestions={tags.map((t) => t.name)}
    />
  );
}
