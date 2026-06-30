# Phase 2 — UI Foundation & Admin CMS

**Goal:** stand up the shared design system (the pieces both admin and public need) and the complete
single-author admin, implementing the **design handoff 1:1**. After this, the owner can create, edit,
preview, publish, and manage posts/media in a UI that matches the mockups.

> **UI source of truth:** `plan/design/handoff/design/` — read `DESIGN-HANDOFF.md` (§0 global system,
> §1 component library, §3 build order), `Stage4-Handoff.md` (admin screens), and
> `Component-Library-Sheet.md`. Open the `.dc.html` mockups (`StudyBlog Admin.dc.html`, `AdminShell`,
> `LoginBody`, `DashboardBody`, `PostEditorBody`, `PostsListBody`, `MediaBody`) for the visuals.
> Every component below names its tokens by Tailwind class and maps to a shadcn primitive + a target
> file path — implement as a faithful transcription.

> **⚠️ Content-model reconciliation (important):** the handoff sometimes says "frontmatter/MDX"
> (its Q1/Q2/Q12). **Our content lives in D1 as Markdown** (`03-data-model.md`). So: **coverage =
> the D1 `domains ⨝ posts` query** (`03-data-model.md` §10), **Prose renders `body_md` Markdown**
> (not MDX) via the `remark`/`rehype` pipeline, and the editor preview **reuses that same Prose
> renderer**. Treat every "frontmatter/MDX" mention as "D1/Markdown."

## Prerequisites / reading
Phase 1 complete (D1 schema + seeded domains + Auth.js login + gated `/admin`). Read
`02-architecture.md` §4–5, `04-auth.md`, `07-design-system.md`, and the design handoff above. Next
docs: `01-getting-started/07-mutating-data.md`, `01-directives/use-cache.md`.

## Part A — Shared UI foundation (design "Phase A")
1. **Brand-tint tokens + motion** (resolves handoff Q6): add to `app/globals.css` `--brand-subtle`
   (≈ brand @ 8%) and `--brand-border` (≈ brand @ 25%) with `--color-brand-subtle`/`--color-brand-border`
   mappings, and a `@keyframes coverage-grow` (scaleX) gated by `motion-reduce`. Use these tokens for
   active-nav/selected/callout backgrounds instead of inline `color-mix`/`bg-brand/10`.
2. **ThemeProvider + dark toggle:** `.dark` class strategy on `<html>` (class), persisted, default
   system. Theme toggle component (used by `SiteHeader` in Phase 3 and `AdminShell` now).
3. **shadcn primitives (new-york)** — install and align variants to `DESIGN-HANDOFF.md` §1.1–1.2:
   `button card badge input textarea select dropdown-menu dialog sheet tabs tooltip separator avatar
   skeleton sonner progress table switch label popover command calendar`. Match Button variants
   (primary/secondary/ghost/link), Badge, the mono **TypeChip**, focus-ring spec.
4. **Prose + Shiki (the reading surface, built once, shared)** — `components/site/prose.tsx` per
   `DESIGN-HANDOFF.md` §1.3: render sanitized HTML from `body_md` via the unified pipeline
   (`02-architecture.md` §4.1), **Shiki** highlight (`rehype-pretty-code`), anchored headings, tables,
   inline code, and **callouts** (use `--brand-subtle`/`--brand-border`, **no left-accent bar**).
   Cache the render (`use cache` + `cacheTag('post-<id>')`). Resolves handoff Q2.
5. **Identity single-source** (resolves Q5): extend `lib/site.ts` with GitHub/LinkedIn/RSS + the
   "helpful links" set — consumed by `SiteFooter`, `AboutIdentity`, and the error pages.

## Part B — Admin CMS (design "Phase D" / `Stage4-Handoff.md`)
Admin is a denser, utilitarian register — same tokens, brand reserved for primary actions/active
nav/status. Build order (Stage4 §build order):
6. **AdminShell** `components/admin/admin-shell.tsx` (sidebar: Dashboard / Posts / Media [+ Practice
   in Phase 5], active `text-brand bg-brand-subtle`, "View live site", owner footer + sign out, mobile
   `sheet`) + **StatusPill** `components/admin/status-pill.tsx` (published = brand, draft = muted).
7. **Login `/login`** — `components/admin/login-card.tsx`: email + password (show/hide), error banner
   (`role=alert`), submitting state. Wire to the Auth.js owner credentials from `04-auth.md`.
8. **Dashboard `/admin`** — `StatCard`×3 (Drafts/Published/This week), RecentPosts rows (StatusPill +
   meta + Edit), **CoverageGaps** `components/admin/coverage-gaps.tsx` (empty domains → "write next",
   from the **D1 coverage query** — resolves Q1). Server component; mobile `sheet` island.
9. **Posts list `/admin/posts`** — `components/admin/posts-table.tsx` (shadcn `table`) + FilterBar
   (status/section/type via URL params) + row-action `dropdown-menu` (Edit/Duplicate/View/Delete +
   confirm `dialog`). Server table + client filter island.
10. **Post Editor `/admin/posts/new` · `/[id]/edit`** — the heaviest screen:
    - `components/admin/publish-bar.tsx` (sticky; StatusPill; Save draft / **Publish→Update** /
      Preview; clean/dirty/saving/error).
    - `components/admin/post-editor.tsx` (title input + mono toolbar + monospace `textarea`).
    - **LivePreview** = the **Prose** component (Part A) re-rendered (debounced) so preview == published.
    - `components/admin/metadata-panel.tsx`: Section `select` → Category `select` (filtered, disabled
      until section) → Type `select` → `components/admin/tag-input.tsx` (multi, create-on-enter) →
      Exam (auto, read-only) → Excerpt → **Cover** `MediaPicker` (16:9, R2) → Slug (auto/editable) →
      Publish date. Desktop 3-pane; mobile Write/Preview/Details tabs.
    - Server Actions per `04-auth.md` (`requireOwner()`) + `02`-style validation (zod) + revalidation
      (`updateTag('post-<id>')`, `revalidateTag('posts','max')`). **Markdown, not MDX** (resolves Q12).
11. **Media `/admin/media`** — `components/admin/media-picker.tsx` drop-zone (R2 upload via owner-only
    action) + `components/admin/media-grid.tsx` (R2 listing, `next/image`, copy-URL/delete). Constraints:
    **≤5 MB, image types, 16:9 cover** (resolves Q13).
12. **Coverage query** — centralize the `domains ⨝ posts` coverage computation in `lib/db/queries`
    (feeds CoverageGaps now and the public coverage components in Phase 3). Resolves Q1.

## R2 dependency (action needed)
The cover-image `MediaPicker` and `/admin/media` need the **R2 `MEDIA_BUCKET` binding**, deferred from
Phase 0 because the wrangler token lacks R2 scope. Before building step 11: grant R2 scope
(`wrangler login` with R2, or dashboard), create the bucket, add the binding (`06-deployment.md` §1/§5),
re-run `cf-typegen`. The rest of admin (login/dashboard/posts/editor-without-cover) can proceed first.

## Acceptance criteria
- [ ] Theme toggle flips light/dark across the app via the `.dark` class; tokens (incl. new brand-tints)
      drive all color.
- [ ] shadcn primitives + Prose match `DESIGN-HANDOFF.md` §1 (variants, tokens, states), both themes.
- [ ] Admin screens are a 1:1 match to `StudyBlog Admin.dc.html` / Stage4 specs (AdminShell, login,
      dashboard, posts table, editor 3-pane, media), both themes, responsive.
- [ ] Full authoring loop: log in → create → write Markdown → **live preview == published** → set
      taxonomy + cover → save draft → publish → unpublish.
- [ ] CoverageGaps reflects the **D1** coverage query (empty domains), not files.
- [ ] Every admin Server Action / upload re-checks `requireOwner()`.
- [ ] Markdown render is cached and invalidates on edit; image upload lands in R2 and renders via
      `next/image`.
- [ ] Verified under `pnpm run preview` (workerd).

## Risks / notes
- Per-request DB client (no singletons); sanitize rendered HTML; keep per-request CPU low (cache the
  render — `06-deployment.md` §8).
- Prose is **built once here** and reused by the public Post page (Phase 3) and this editor preview.
- Don't enable `cacheComponents` yet if it complicates the admin (dynamic, uncached) — it's turned on
  and validated in Phase 3.
