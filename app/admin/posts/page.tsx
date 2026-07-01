import Link from "next/link";
import { Plus } from "lucide-react";
import { requireOwner } from "@/lib/auth/dal";
import { listPostsAdmin, listSections } from "@/lib/db/queries";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PostsFilterBar } from "@/components/admin/posts-filter-bar";
import { PostsTable } from "@/components/admin/posts-table";
import { Button } from "@/components/ui/button";
import { POST_STATUSES, POST_TYPES, type PostStatus, type PostType } from "@/lib/taxonomy";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PostsListPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireOwner();
  const sp = await searchParams;
  const statusRaw = one(sp.status);
  const typeRaw = one(sp.type);
  const filter = {
    status: (POST_STATUSES as readonly string[]).includes(statusRaw ?? "")
      ? (statusRaw as PostStatus)
      : undefined,
    type: (POST_TYPES as readonly string[]).includes(typeRaw ?? "")
      ? (typeRaw as PostType)
      : undefined,
    section: one(sp.section) || undefined,
    q: one(sp.q) || undefined,
  };

  const [rows, sections] = await Promise.all([listPostsAdmin(filter), listSections()]);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin"
        title="Posts"
        action={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-5 p-6">
        <PostsFilterBar
          sections={sections.map((s) => ({ slug: s.slug, name: s.name }))}
          count={rows.length}
        />
        <PostsTable rows={rows} />
      </div>
    </div>
  );
}
