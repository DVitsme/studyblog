"use client";

import { useRouter } from "next/navigation";
import { MediaPicker } from "./media-picker";
import { MediaGrid } from "./media-grid";
import type { Media } from "@/lib/db/schema";

// Client wrapper for the Media page: the drop-zone refreshes the server-rendered grid on upload.
export function MediaManager({ items }: { items: Media[] }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <MediaPicker variant="panel" onUploaded={() => router.refresh()} />
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No media yet — drop an image above to upload your first.
        </p>
      ) : (
        <MediaGrid items={items} />
      )}
    </div>
  );
}
