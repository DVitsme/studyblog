import type { PostStatus, PostType } from "@/lib/taxonomy";

export type EditorSection = { slug: string; name: string; examCodes: string | null };
export type EditorDomain = { id: number; name: string; sectionSlug: string; exam: string };

export type EditorInitial = {
  id: number | null;
  title: string;
  slug: string;
  bodyMd: string;
  excerpt: string;
  sectionSlug: string;
  domainId: number | null;
  type: PostType | "";
  status: PostStatus;
  tags: string[];
  coverImageKey: string | null;
  publishedAt: string; // yyyy-mm-dd for the date input, or ""
};

export type FormState = Omit<EditorInitial, "id"> & { slugEdited: boolean };
