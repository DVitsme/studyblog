"use client";

import { useId } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "./tag-input";
import { MediaPicker } from "./media-picker";
import { POST_TYPES, POST_TYPE_LABELS, type PostType } from "@/lib/taxonomy";
import type { EditorDomain, EditorSection, FormState } from "./editor-types";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// Library §28 — MetadataPanel (the Details pane). Section → Category (filtered) → Type → Tags →
// Exam (auto, read-only) → Excerpt → Cover (deferred: R2) → Slug → Publish date.
export function MetadataPanel({
  form,
  patch,
  sections,
  domains,
  tagSuggestions,
  errors,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  sections: EditorSection[];
  domains: EditorDomain[];
  tagSuggestions: string[];
  errors: Record<string, string[]>;
}) {
  const uid = useId(); // unique per instance — this panel mounts twice (desktop pane + mobile tab)
  const categories = domains.filter((d) => d.sectionSlug === form.sectionSlug);
  const exam = form.domainId
    ? (domains.find((d) => d.id === form.domainId)?.exam ?? "")
    : (sections.find((s) => s.slug === form.sectionSlug)?.examCodes ?? "");
  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="flex flex-col gap-5 p-5">
      <Field label="Section" error={err("sectionSlug")}>
        <Select
          value={form.sectionSlug}
          onValueChange={(v) => patch({ sectionSlug: v, domainId: null })}
        >
          <SelectTrigger className="h-[34px]">
            <SelectValue placeholder="Choose section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Category" hint={!form.sectionSlug ? "Select a section first" : undefined}>
        <Select
          value={form.domainId ? String(form.domainId) : ""}
          onValueChange={(v) => patch({ domainId: Number(v) })}
          disabled={!form.sectionSlug}
        >
          <SelectTrigger className="h-[34px]">
            <SelectValue placeholder="Choose category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Type" error={err("type")}>
        <Select value={form.type} onValueChange={(v) => patch({ type: v as PostType })}>
          <SelectTrigger className="h-[34px] font-mono text-xs">
            <SelectValue placeholder="Choose type" />
          </SelectTrigger>
          <SelectContent>
            {POST_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="font-mono text-xs">
                {POST_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tags" error={err("tags")}>
        <TagInput
          value={form.tags}
          onChange={(tags) => patch({ tags })}
          suggestions={tagSuggestions}
        />
      </Field>

      <Field label="Exam" hint="Auto from section/category">
        <div className="flex h-[34px] items-center rounded-md border border-dashed border-border bg-muted px-3 font-mono text-xs text-muted-foreground">
          {exam || "—"}
        </div>
      </Field>

      <Field label="Excerpt" htmlFor={`${uid}-excerpt`} error={err("excerpt")}>
        <Textarea
          id={`${uid}-excerpt`}
          value={form.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          rows={3}
          placeholder="Short summary for cards + search"
          className="resize-none text-sm"
        />
      </Field>

      <Field label="Cover image" hint="16:9 recommended">
        {form.coverImageKey ? (
          <div className="relative overflow-hidden rounded-md border border-border">
            <div className="relative aspect-video bg-muted">
              <Image
                src={`/media/${form.coverImageKey}`}
                alt="Cover"
                fill
                sizes="296px"
                className="object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={() => patch({ coverImageKey: null })}
              aria-label="Remove cover image"
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <MediaPicker variant="compact" onUploaded={(m) => patch({ coverImageKey: m.key })} />
        )}
      </Field>

      <Field label="Slug" htmlFor={`${uid}-slug`} error={err("slug")} hint="Auto from title — editable">
        <Input
          id={`${uid}-slug`}
          value={form.slug}
          onChange={(e) => patch({ slug: e.target.value, slugEdited: true })}
          className="h-[34px] font-mono text-xs"
        />
      </Field>

      <Field label="Publish date" htmlFor={`${uid}-publishedAt`}>
        <Input
          id={`${uid}-publishedAt`}
          type="date"
          value={form.publishedAt}
          onChange={(e) => patch({ publishedAt: e.target.value })}
          className="h-[34px] font-mono text-xs"
        />
      </Field>
    </div>
  );
}
