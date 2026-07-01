import { requireOwner } from "@/lib/auth/dal";
import { countPosts } from "@/lib/db/queries";
import { AdminShell } from "@/components/admin/admin-shell";

// Authoritative auth gate for the whole /admin tree (see lib/auth/dal.ts), wrapped in the AdminShell.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();
  const postCount = await countPosts();
  return (
    <AdminShell userEmail={user.email ?? "owner"} postCount={postCount}>
      {children}
    </AdminShell>
  );
}
