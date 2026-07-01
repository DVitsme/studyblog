import { requireOwner } from "@/lib/auth/dal";
import { listMedia } from "@/lib/db/queries";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MediaManager } from "@/components/admin/media-manager";

export default async function MediaPage() {
  await requireOwner();
  const items = await listMedia();
  return (
    <div>
      <AdminPageHeader
        crumb="Admin"
        title="Media"
        action={
          <span className="font-mono text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "file" : "files"}
          </span>
        }
      />
      <div className="p-6">
        <MediaManager items={items} />
      </div>
    </div>
  );
}
