import { requireOwner } from "@/lib/auth/dal";
import { coverageByExam } from "@/lib/db/queries";

// Phase 1 placeholder dashboard. Proves the gated admin reads D1 in a Server Component.
// The designed dashboard (StatCards, RecentPosts, CoverageGaps) lands in Phase 2.
export default async function AdminDashboard() {
  await requireOwner(); // self-verify; don't rely on the layout alone (plan/04-auth.md §6)
  const coverage = await coverageByExam();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Phase 1 — data + auth wired. Objectives coverage, read live from D1:
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {coverage.map((c) => (
          <div key={c.exam} className="rounded-lg border border-border bg-card p-4">
            <div className="font-mono text-xs text-muted-foreground">{c.exam}</div>
            <div className="mt-1 font-mono text-2xl text-brand">
              {c.covered}
              <span className="text-base text-muted-foreground">/{c.total}</span>
            </div>
            <div className="text-xs text-muted-foreground">domains with posts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
