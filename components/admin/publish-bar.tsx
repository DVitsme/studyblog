"use client";

import Link from "next/link";
import { ArrowLeft, Eye, LoaderCircle } from "lucide-react";
import { StatusPill } from "./status-pill";
import { Button } from "@/components/ui/button";
import type { PostStatus } from "@/lib/taxonomy";

// Library §26 — sticky PublishBar. Back · StatusPill + saved-state · Preview / Save draft / primary.
export function PublishBar({
  status,
  dirty,
  saving,
  savedLabel,
  onSaveDraft,
  onPublish,
  onPreview,
}: {
  status: PostStatus;
  dirty: boolean;
  saving: boolean;
  savedLabel: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
          <Link href="/admin/posts" aria-label="Back to posts">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <StatusPill status={status} />
        <span
          aria-live="polite"
          className="hidden truncate font-mono text-xs text-muted-foreground sm:inline"
        >
          {saving ? "Saving…" : dirty ? "Unsaved changes" : savedLabel}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPreview} className="lg:hidden">
          <Eye className="size-4" />
          Preview
        </Button>
        <Button variant="secondary" size="sm" onClick={onSaveDraft} disabled={saving}>
          Save draft
        </Button>
        <Button size="sm" onClick={onPublish} disabled={saving}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {status === "published" ? "Update" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
