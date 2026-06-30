# Phase 2 — Content CRUD & Rendering

**Goal:** the owner can create, edit, save-draft, publish, and unpublish posts — with section /
domain / type / tags, a cover image (R2), and Markdown that renders to clean, highlighted HTML.

**Outcome:** a complete admin authoring loop; published posts are viewable at `/posts/[slug]` (the
public chrome is minimal here — Phase 3 builds the real reading experience).

---

## Prerequisites / reading
Phase 1 complete. Read `01-product-spec.md` §5–6, `02-architecture.md` §4–5, `03-data-model.md`.
Next docs: `01-getting-started/07-mutating-data.md`, `01-directives/use-cache.md`,
`04-functions/revalidateTag.md` + `updateTag.md`, `03-api-reference/02-components/form.md`.

## Tasks
### Markdown rendering pipeline
1. **Install:** `pnpm add unified remark-parse remark-gfm remark-rehype rehype-slug
   rehype-autolink-headings rehype-sanitize rehype-stringify rehype-pretty-code shiki`.
2. **`lib/content/render.ts`** — the `unified` chain (`02-architecture.md` §4.1) → **sanitized** HTML
   string. Wrap in a cached fn: `'use cache'; cacheTag('post-'+id); cacheLife('max')`, keyed by id +
   `updatedAt`. Add `lib/content/toc.ts` (headings → TOC) and `lib/content/reading-time.ts`.
3. **`components/site/prose.tsx`** — renders the sanitized HTML in the `.prose` container; code blocks
   get a copy button.

### Queries & actions
4. **`lib/db/queries/posts.ts`** — `getPostBySlug`, `listPosts(filter)`, `createPost`, `updatePost`,
   `setStatus`, plus tag upsert + `post_tags` sync, and `media` insert. Compute `reading_minutes` and
   set `published_at` on first publish; bump `updated_at` on edit.
5. **Server Actions** (`app/admin/posts/actions.ts`) — `saveDraft`, `publish`, `unpublish`, `remove`.
   Each: `await requireOwner()` → **zod**-validate → write via Drizzle → `updateTag('post-'+id)` +
   `revalidateTag('posts','max')` (+ section/tag tags). Slug auto-gen + uniqueness (`03-data-model.md`
   §8); freeze slug after first publish.

### Admin UI
6. **`/admin/posts`** — list/filter (draft/published, section, type) with quick actions.
7. **`/admin/posts/new`** and **`/admin/posts/[id]/edit`** — `components/admin/post-editor.tsx`
   (Markdown textarea + **live server-rendered preview** using the same `render.ts`),
   `metadata-panel.tsx` (section→filters domain options; type; exam default; excerpt; cover; slug;
   status), `tag-input.tsx` (multi + create-on-the-fly), `publish-bar.tsx`. Provide **type-specific
   starter templates** (esp. the `project` STAR template, `01-product-spec.md` §5).

### Media (R2)
8. **Upload** — `app/api/media/upload/route.ts` *or* a Server Action: `requireOwner()`,
   `MEDIA_BUCKET.put(key, file.stream(), { httpMetadata })`, insert `media` row, return URL
   (`06-deployment.md` §5). **`components/admin/media-picker.tsx`** (drag-drop + library).
9. **Serve** — attach a custom domain to `studyblog-media` (or a read proxy route); add the host to
   `images.remotePatterns`. **`/admin/media`** library page (browse/copy/delete).

### Taxonomy admin
10. **`/admin/taxonomy`** — manage tags (rename/merge/delete), list domains read-only, show
    **coverage gaps** (`components/admin/coverage-gaps.tsx`) from the §10 query inverted.

### Minimal public post route
11. **`app/(public)/posts/[slug]/page.tsx`** — fetch published post, render `<Prose>`; bare layout for
    now (Phase 3 adds meta/TOC/related). 404 for missing/draft.

## Acceptance criteria
- [ ] Create → save draft → edit → publish → unpublish all work; lists reflect status immediately
      (read-your-writes via `updateTag`).
- [ ] A published post renders at `/posts/[slug]` with GFM tables, **syntax-highlighted** code, and
      anchored headings; draft/missing slugs 404.
- [ ] Cover/inline image upload lands in R2, appears in the media library, and displays via the media
      domain through `next/image`.
- [ ] Tags create-on-the-fly and attach; section→domain filtering is correct; slug is unique and
      frozen post-publish.
- [ ] Every admin action re-checks `requireOwner()` (verified by calling one while signed out → fails).
- [ ] Markdown render is cached (second view doesn't re-highlight) and invalidates on edit.
- [ ] All verified under `pnpm run preview` (workerd), incl. local R2.

## Risks / notes
- **Sanitize** rendered HTML (`rehype-sanitize`) — content is DB-sourced; allow code/tables/anchors.
- Keep per-request **CPU** low: highlight once and cache (`06-deployment.md` §8). If cold-cache render
  is heavy, consider persisting `body_html` (`03-data-model.md` §6).
- Per-request DB client (no singletons). R2 `File` → `file.stream()`; never write to disk.
