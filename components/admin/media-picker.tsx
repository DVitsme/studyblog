"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type UploadedMedia = {
  key: string;
  url: string;
  filename: string;
  size: number;
  width: number | null;
  height: number | null;
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

// Read intrinsic dimensions in the browser (avoids a server-side decode / Images-binding call).
function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function uploadWithProgress(form: FormData, onProgress: (p: number) => void): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed && typeof parsed === "object") {
        resolve(parsed as UploadedMedia);
        return;
      }
      const msg =
        parsed && typeof parsed === "object" && "error" in parsed
          ? String((parsed as { error: unknown }).error)
          : `Upload failed (${xhr.status})`;
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}

// Library §32 — MediaPicker drop-zone. `panel` = the Media page; `compact` = the editor cover field.
export function MediaPicker({
  onUploaded,
  variant = "panel",
}: {
  onUploaded: (m: UploadedMedia) => void;
  variant?: "panel" | "compact";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, AVIF, or GIF images.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Max size is 5 MB.");
      return;
    }
    const dims = await readDimensions(file);
    const form = new FormData();
    form.set("file", file);
    if (dims) {
      form.set("width", String(dims.width));
      form.set("height", String(dims.height));
    }
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadWithProgress(form, setProgress);
      onUploaded(result);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !uploading) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "panel" ? "gap-2 p-8" : "aspect-video gap-1.5 p-4",
        dragOver ? "border-brand bg-brand/5" : "border-border hover:bg-accent/40",
        uploading && "pointer-events-none opacity-70",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {uploading ? (
        <>
          <LoaderCircle className="size-5 animate-spin text-brand" />
          <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
        </>
      ) : (
        <>
          <div className="flex size-10 items-center justify-center rounded-full bg-brand/10">
            <Upload className="size-5 text-brand" />
          </div>
          <p className={cn("font-medium", variant === "panel" ? "text-sm" : "text-xs")}>
            {variant === "panel" ? "Drop an image here, or browse" : "Upload cover"}
          </p>
          {variant === "panel" ? (
            <p className="text-xs text-muted-foreground">JPEG · PNG · WebP · AVIF · GIF, up to 5 MB</p>
          ) : null}
        </>
      )}
    </div>
  );
}
