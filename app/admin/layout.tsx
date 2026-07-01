import { requireOwner } from "@/lib/auth/dal";
import { ModeToggle } from "@/components/mode-toggle";
import { logout } from "./actions";

// Authoritative auth gate for the whole /admin tree (see lib/auth/dal.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <span className="font-mono text-sm">StudyBlog · admin</span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ModeToggle />
          <span>{user.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 hover:bg-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
