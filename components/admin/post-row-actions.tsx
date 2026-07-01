"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deletePost, duplicatePost } from "@/app/admin/posts/actions";
import type { PostStatus } from "@/lib/taxonomy";

export function PostRowActions({
  id,
  slug,
  title,
  status,
}: {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDuplicate() {
    startTransition(async () => {
      const res = await duplicatePost(id);
      if (res.ok) {
        toast.success("Post duplicated");
        router.push(`/admin/posts/${res.id}/edit`);
      } else {
        toast.error(res.error);
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      const res = await deletePost(id);
      if (res.ok) {
        toast.success("Post deleted");
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to delete post");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${title}`}>
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/admin/posts/${id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem>
          {status === "published" ? (
            <DropdownMenuItem asChild>
              <Link href={`/posts/${slug}`} target="_blank" rel="noreferrer">
                View
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              // Defer so the menu fully closes before the dialog opens — prevents the Radix
              // DismissableLayer pointer-events:none freeze (radix-ui/primitives#3317).
              setTimeout(() => setConfirmOpen(true), 0);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              “{title}” will be permanently deleted. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={pending}>
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
