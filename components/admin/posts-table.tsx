import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { PostRowActions } from "./post-row-actions";
import { TypeChip } from "@/components/site/type-chip";
import { formatDate } from "@/lib/format";
import type { AdminPostRow } from "@/lib/db/queries";

const th = "font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function rowDate(r: AdminPostRow) {
  return r.status === "published" ? formatDate(r.publishedAt) : formatDate(r.updatedAt);
}

export function PostsTable({ rows }: { rows: AdminPostRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">No posts match these filters.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/admin/posts">Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className={th}>Title</TableHead>
              <TableHead className={th}>Status</TableHead>
              <TableHead className={th}>Section</TableHead>
              <TableHead className={th}>Type</TableHead>
              <TableHead className={th}>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="hover:bg-accent">
                <TableCell className="max-w-[280px] font-medium">
                  <Link href={`/admin/posts/${r.id}/edit`} className="hover:text-brand">
                    <span className="line-clamp-1">{r.title}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusPill status={r.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.sectionName}</TableCell>
                <TableCell>
                  <TypeChip type={r.type} />
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {rowDate(r)}
                </TableCell>
                <TableCell className="text-right">
                  <PostRowActions id={r.id} slug={r.slug} title={r.title} status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/admin/posts/${r.id}/edit`}
            className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-brand"
          >
            <div className="flex items-center justify-between gap-2">
              <StatusPill status={r.status} />
              <TypeChip type={r.type} />
            </div>
            <div className="mt-2 line-clamp-2 text-sm font-medium">{r.title}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {r.sectionName} · {rowDate(r)}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
