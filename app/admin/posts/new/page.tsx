import { requireOwner } from "@/lib/auth/dal";
import { listAllDomains, listSections, listTags } from "@/lib/db/queries";
import { PostEditor } from "@/components/admin/editor";

type SP = Record<string, string | string[] | undefined>;

export default async function NewPostPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireOwner();
  const sp = await searchParams;
  const section = typeof sp.section === "string" ? sp.section : "";
  const [sections, domains, tags] = await Promise.all([
    listSections(),
    listAllDomains(),
    listTags(),
  ]);

  return (
    <PostEditor
      initial={{
        id: null,
        title: "",
        slug: "",
        bodyMd: "",
        excerpt: "",
        sectionSlug: section,
        domainId: null,
        type: "",
        status: "draft",
        tags: [],
        publishedAt: "",
      }}
      sections={sections.map((s) => ({ slug: s.slug, name: s.name, examCodes: s.examCodes }))}
      domains={domains}
      tagSuggestions={tags.map((t) => t.name)}
    />
  );
}
