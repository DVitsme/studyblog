"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMedia } from "@/app/admin/media/actions";
import { formatBytes } from "@/lib/format";
import type { Media } from "@/lib/db/schema";

// Library §33 — MediaGrid: auto-fill tiles (next/image from the /media route) + hover Copy URL / Delete.
export function MediaGrid({ items }: { items: Media[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);
  const [pending, startTransition] = useTransition();

  function copyUrl(key: string) {
    navigator.clipboard
      .writeText(`${window.location.origin}/media/${key}`)
      .then(() => toast.success("URL copied"))
      .catch(() => toast.error("Copy failed"));
  }

  function onDelete() {
    if (!pendingDelete) return;
    const key = pendingDelete.key;
    startTransition(async () => {
      const res = await deleteMedia(key);
      if (res.ok) {
        toast.success("Image deleted");
        setPendingDelete(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Delete failed");
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {items.map((m) => (
          <div key={m.key} className="group overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={`/media/${m.key}`}
                alt={m.alt ?? m.filename}
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover"
                unoptimized // served raw from R2; public-page optimization is a Phase-3 concern
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => copyUrl(m.key)}
                  aria-label={`Copy URL for ${m.filename}`}
                  className="flex size-9 items-center justify-center rounded-md bg-background/90 text-foreground hover:bg-background"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(m)}
                  aria-label={`Delete ${m.filename}`}
                  className="flex size-9 items-center justify-center rounded-md bg-background/90 text-destructive hover:bg-background"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="p-2">
              <div className="truncate font-mono text-[11px]" title={m.filename}>
                {m.filename}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                {formatBytes(m.size)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.filename}” will be permanently removed from storage. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
