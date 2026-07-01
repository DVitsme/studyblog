import Link from "next/link";
import { ChartColumn, CircleCheck, Plus, SquarePen } from "lucide-react";
import { requireOwner } from "@/lib/auth/dal";
import { coverageGaps, dashboardStats, recentPosts } from "@/lib/db/queries";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { CoverageGaps } from "@/components/admin/coverage-gaps";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { POST_TYPE_LABELS } from "@/lib/taxonomy";
import { relativeTime } from "@/lib/format";

export default async function AdminDashboard() {
  await requireOwner(); // self-verify; don't rely on the layout alone (plan/04-auth.md §6)
  const [stats, recent, gaps] = await Promise.all([
    dashboardStats(),
    recentPosts(5),
    coverageGaps(6),
  ]);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin"
        title="Dashboard"
        action={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-[22px] p-6">
        <div className="flex flex-wrap gap-4">
          <StatCard label="Drafts" value={stats.drafts} sub="in progress" icon={SquarePen} />
          <StatCard label="Published" value={stats.published} sub="live posts" icon={CircleCheck} />
          <StatCard label="This week" value={stats.thisWeek} sub="posts updated" icon={ChartColumn} />
        </div>

        <div className="flex flex-wrap gap-[22px]">
          <div className="min-w-0 flex-1 basis-[420px]">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="text-[15px] font-semibold">Recent posts</h2>
                <Link href="/admin/posts" className="text-xs text-brand hover:underline">
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                  No posts yet.{" "}
                  <Link href="/admin/posts/new" className="text-brand hover:underline">
                    Write your first →
                  </Link>
                </p>
              ) : (
                <ul>
                  {recent.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0"
                    >
                      <StatusPill status={p.status} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.title}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {p.sectionName} · {POST_TYPE_LABELS[p.type]} · {relativeTime(p.updatedAt)}
                        </div>
                      </div>
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        className="shrink-0 text-sm text-brand hover:underline"
                      >
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 basis-[300px]">
            <CoverageGaps gaps={gaps} />
          </div>
        </div>
      </div>
    </div>
  );
}
