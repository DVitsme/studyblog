"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublishBar } from "./publish-bar";
import { MarkdownEditor } from "./post-editor";
import { MetadataPanel } from "./metadata-panel";
import { Prose } from "@/components/site/prose";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savePost, type PostFormValues } from "@/app/admin/posts/actions";
import { slugify } from "@/lib/slug";
import { relativeTime } from "@/lib/format";
import type { PostStatus, PostType } from "@/lib/taxonomy";
import type { EditorDomain, EditorInitial, EditorSection, FormState } from "./editor-types";

function PreviewPane({ html }: { html: string }) {
  return (
    <div className="min-w-0">
      <div className="sticky top-0 border-b border-border bg-background/90 px-5 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
        Live preview
      </div>
      <div className="px-5 py-5">
        {html ? (
          <Prose html={html} />
        ) : (
          <p className="text-sm text-muted-foreground">Start writing to see the preview.</p>
        )}
      </div>
    </div>
  );
}

export function PostEditor({
  initial,
  sections,
  domains,
  tagSuggestions,
}: {
  initial: EditorInitial;
  sections: EditorSection[];
  domains: EditorDomain[];
  tagSuggestions: string[];
}) {
  const [id, setId] = useState<number | null>(initial.id);
  const [form, setForm] = useState<FormState>({
    title: initial.title,
    slug: initial.slug,
    bodyMd: initial.bodyMd,
    excerpt: initial.excerpt,
    sectionSlug: initial.sectionSlug,
    domainId: initial.domainId,
    type: initial.type,
    status: initial.status,
    tags: initial.tags,
    coverImageKey: initial.coverImageKey,
    publishedAt: initial.publishedAt,
    slugEdited: initial.slug !== "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [tab, setTab] = useState<"write" | "preview" | "details">("write");

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
  }
  function setTitle(v: string) {
    setForm((f) => ({ ...f, title: v, slug: f.slugEdited ? f.slug : slugify(v) }));
    setDirty(true);
  }

  // Debounced, abortable live preview via the owner-gated Route Handler (preview == published).
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ markdown: form.bodyMd }),
          signal: ctrl.signal,
        });
        if (res.ok) setPreviewHtml(await res.text());
      } catch {
        // aborted / offline — keep the last good preview
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [form.bodyMd]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function save(status: PostStatus) {
    setSaving(true);
    setErrors({});
    const values: PostFormValues = {
      title: form.title,
      slug: form.slug,
      bodyMd: form.bodyMd,
      excerpt: form.excerpt,
      type: form.type as PostType,
      sectionSlug: form.sectionSlug,
      domainId: form.domainId,
      status,
      tags: form.tags,
      coverImageKey: form.coverImageKey,
      publishedAt: form.publishedAt || null,
    };
    const res = await savePost(id, values);
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setSavedAt(new Date());
      setForm((f) => ({ ...f, status }));
      if (!id) {
        setId(res.id);
        window.history.replaceState(null, "", `/admin/posts/${res.id}/edit`);
      }
      toast.success(status === "published" ? "Published" : "Draft saved");
    } else {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
    }
  }

  const savedLabel = savedAt
    ? `Saved ${relativeTime(savedAt)}`
    : id
      ? "Saved"
      : "Draft — not saved yet";

  const writePane = (
    <MarkdownEditor
      title={form.title}
      onTitleChange={setTitle}
      body={form.bodyMd}
      onBodyChange={(v) => patch({ bodyMd: v })}
    />
  );
  const metadataPane = (
    <MetadataPanel
      form={form}
      patch={patch}
      sections={sections}
      domains={domains}
      tagSuggestions={tagSuggestions}
      errors={errors}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <PublishBar
        status={form.status}
        dirty={dirty}
        saving={saving}
        savedLabel={savedLabel}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("published")}
        onPreview={() => setTab("preview")}
      />

      {/* Desktop: 3-pane (Write · Preview · Details) */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        <div className="min-w-0 flex-1 overflow-y-auto border-r border-border">{writePane}</div>
        <div className="min-w-0 flex-1 overflow-y-auto border-r border-border">
          <PreviewPane html={previewHtml} />
        </div>
        <div className="w-[296px] shrink-0 overflow-y-auto bg-card">{metadataPane}</div>
      </div>

      {/* Mobile: tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="flex min-h-0 flex-1 flex-col lg:hidden"
      >
        <TabsList className="mx-3 mt-3 self-start">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="min-h-0 flex-1 overflow-y-auto">
          {writePane}
        </TabsContent>
        <TabsContent value="preview" className="min-h-0 flex-1 overflow-y-auto">
          <PreviewPane html={previewHtml} />
        </TabsContent>
        <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto bg-card">
          {metadataPane}
        </TabsContent>
      </Tabs>
    </div>
  );
}
