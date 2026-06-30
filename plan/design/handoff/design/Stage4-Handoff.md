# StudyBlog — Stage 4 Handoff Specs (Admin: Login · Dashboard · Editor · Posts · Media)

> Per-screen blocks in the exact format from `components-tech-and-handoff-spec.md`. Components
> referenced by name; full specs in `Component-Library-Sheet.md` (v4 §25–§33). Token-named, no
> arbitrary values. Both themes via `.dark`; both breakpoints noted per element.
>
> **Admin register (applies to all 5):** denser and more utilitarian than the public site — same
> tokens, tighter spacing (row `py-2.5/py-3`, control `h-9`/`h-8`), brand reserved for **primary
> actions, active nav, and status** only (no decorative accent). Surfaces stay flat + hairline; the
> raised shadow appears only on dropdown-menu / dialog / sheet. Mockup: `StudyBlog Admin.dc.html`
> (5-screen switcher + login error toggle + editor draft/published toggle + theme; desktop + mobile).
> Built bodies: `AdminShell` (sidebar), `LoginBody`, `DashboardBody`, `PostEditorBody`,
> `PostsListBody`, `MediaBody`.

---

### Screen: Login  (route: /login)
- **Layout:** full-viewport centered column (`min-h-dvh flex items-center justify-center px-5`); no
  AdminShell (pre-auth). Wordmark + "admin" pill + tagline → auth Card (`max-w-sm`) → "single-owner ·
  no public sign-up" footnote.
- **Component tree:**
  - **LoginCard** → `NEW: components/admin/login-card.tsx` (shadcn `card` + `input` + `label` +
    `button`). fields: Email `input[type=email]`, Password `input[type=password]` with show/hide toggle
    (lucide `eye`) + "Forgot?" link; submit `Button{primary} w-full` "Sign in".
    tokens: card `bg-card border-border rounded-lg shadow-sm`; inputs `bg-background border-input
    rounded-md h-9`; label `text-sm font-medium`.
  - states: **default** · **error** (top banner `bg-[destructive 9%] border-[destructive 32%]` +
    lucide `alert-circle` + per-field `border-destructive` + helper `text-destructive text-sm`) ·
    focus (brand ring) · submitting (`Button` loading spinner, disabled). No sign-up / no SSO.
  - responsive: card full-width on `sm` (≤`max-w-sm`); unchanged otherwise.
- **Typography:** wordmark mono 18px; labels `text-sm/500`; helper/footnote `text-xs muted`.
- **Icons:** `eye`/`eye-off`, `alert-circle`.
- **A11y:** `<form>` with labelled inputs; error banner `role="alert"`; password toggle `aria-label`
  + `aria-pressed`; visible focus.
- **Dev notes:** **Client component** (controlled inputs, submit, error state). Auth handled by the
  app's single-owner credential check (out of design scope — see DESIGN-HANDOFF Q10).

---

### Screen: Dashboard  (route: /admin)
- **Layout:** AdminShell (sidebar `flex-[0_0_224px]` desktop; mobile topbar + `sheet`) → page header
  (crumb + h1 + `New post` primary) → content `p-6 flex-col gap-[22px]`: stat cards row, then a
  two-column `flex-wrap` (Recent posts `basis-[420px]` + Coverage gaps `basis-[300px]`).
- **Component tree:**
  - **AdminShell** → `components/admin/admin-shell.tsx` (built `AdminShell.dc.html`): sidebar nav
    (Dashboard / Posts(19) / Media) with active `text-brand bg-brand/10`, "View live site",
    owner footer + Sign out. mobile → topbar + `menu`→`sheet`. *(see Library §25)*
  - **StatCard** ×3 → `NEW: components/admin/stat-card.tsx`: label (mono uppercase) + lucide icon +
    value (`font-mono text-3xl`) + sub. Drafts 2 / Published 17 / This week 1. `flex-wrap basis-[200px]`.
  - **RecentPosts list** → reuses post rows: StatusPill + title + mono meta + Edit link;
    `border-b border-border` rows.
  - **CoverageGaps** → `components/admin/coverage-gaps.tsx`: empty domains as "write next" links
    (hollow circle + domain + cert + `Write →` in brand). Data = the inverse of CoverageChecklist:
    Security Architecture, Security Program Mgmt (Sec+), Networking Fundamentals, Network
    Implementations (Net+). row hover `bg-accent`. *(see Library §30)*
  - **StatusPill** → `NEW: components/admin/status-pill.tsx`: `published` = `bg-brand/14 text-brand`,
    `draft` = `bg-muted text-muted-foreground`; mono uppercase 10px. *(see Library §31)*
- **Typography:** h1 `text-2xl/600`; stat value `font-mono text-3xl`; card titles `text-[15px]/600`;
  meta mono.
- **Icons:** `square-pen`(draft), `check-circle`(published), `bar-chart`(week), `plus`, `arrow-right`.
- **States:** populated (shown); each list supports loading (skeleton rows) + empty (no drafts / all
  domains covered → celebratory empty).
- **Responsive:** stat cards + columns wrap to single column on `sm`; sidebar → `sheet`.
- **A11y:** landmarks; stat values paired with text labels; gap links descriptive.
- **Dev notes:** **Server Component**; only the mobile `sheet` toggle is a client island. Stats +
  gaps computed at build/request from frontmatter (DESIGN-HANDOFF Q1).

---

### Screen: Post Editor  (routes: /admin/posts/new · /admin/posts/[id]/edit)
- **Layout:** AdminShell → sticky **PublishBar** → editor body. Desktop = 3-pane `flex`: Write
  (`flex-1`, border-r) · Live preview (`flex-1`, border-r) · MetadataPanel (`flex-[0_0_296px]`
  `bg-card`). Mobile = Write/Preview/Details **tabs**, one pane at a time.
- **Component tree:**
  - **PublishBar** → `components/admin/publish-bar.tsx`: back · StatusPill (Draft/Published) +
    saved-state mono label · right: `Preview`(ghost) + `Save draft`(secondary) + primary
    (`Publish` when draft / `Update` when published). sticky `bg-background/90 backdrop-blur border-b`.
    states: clean/dirty (dirty → Save enabled + "Unsaved"), saving (spinner), error (toast via
    `sonner`). *(see Library §26)*
  - **MarkdownEditor (Write)** → `components/admin/post-editor.tsx`: title `input` (borderless, 22px/
    600) + a mono format toolbar (H/B/I/link/code/list) + monospace `textarea` (`font-mono text-sm
    leading-[1.7]`). *(see Library §27)*
  - **LivePreview** → renders the **Prose** component (§19) from the Markdown — header bar "Live
    preview" + rendered h1/h2/p/list/code/callout. Reuses the public `.prose` styles verbatim so
    preview == published.
  - **MetadataPanel** → `components/admin/metadata-panel.tsx` (collapsible): **Section** `select` →
    **Category** `select` (filtered by section, disabled until section set) → **Type** `select` (mono
    value) → **TagInput** (multi, chips + create-on-enter + autocomplete) → **Exam** (auto from
    section, read-only dashed field) → **Excerpt** `textarea` → **Cover** MediaPicker drop-zone (16:9,
    R2) → **Slug** (auto, editable, mono) → **Publish date**. *(see Library §28)*
  - **TagInput** → `components/admin/tag-input.tsx` (see Library §29). **MediaPicker** (drop-zone form
    of §32).
- **States:** **draft** (status pill muted, primary = "Publish", date "Not scheduled") vs
  **published** (pill brand, primary = "Update", date shown) — both in the mockup toggle. Per-field:
  default/focus/error; category disabled-until-section; tag duplicate/max error.
- **Typography:** title input Inter 22px/600; body `textarea` mono 14px; preview uses Prose scale;
  field labels `text-xs/500 muted`.
- **Icons:** `arrow-left`, `eye`, `chevron-up/down`, `x`(tag remove), `upload`, `calendar`.
- **Responsive:** desktop 3-pane side-by-side; mobile = Write/Preview/Details tab segmented control,
  metadata becomes the "Details" tab.
- **A11y:** labelled fields; toolbar buttons `aria-label`; tab segmented control keyboard-navigable;
  live-preview region `aria-live="polite"` optional.
- **Dev notes:** **Client component** end-to-end — controlled title/body, **debounced live preview**
  (re-renders Prose from MDX on input), TagInput, MediaPicker drag-and-drop, PublishBar actions. The
  Prose renderer is shared with the public post page (build once). Markdown→MDX + Shiki highlight
  (DESIGN-HANDOFF Q2).

---

### Screen: Posts list  (route: /admin/posts)
- **Layout:** AdminShell → page header (crumb + h1 + `New post`) → filter bar → table (desktop) /
  stacked cards (mobile), `p-6`.
- **Component tree:**
  - **FilterBar** → search `input` (lucide `search`) + Status / Section / Type `select`s + result
    count (mono, right). selects `h-8 border-input`.
  - **PostsTable** → `components/admin/posts-table.tsx` (shadcn `table`): cols Title · Status
    (StatusPill) · Section · Type (mono TypeChip) · Date · row-actions (`more-vertical` →
    `dropdown-menu`: Edit / Duplicate / View / Delete). header `bg-muted` mono-uppercase; rows
    `border-t border-border` hover `bg-accent`. *(see Library §33)*
  - mobile: each row → a Card (status + type + actions, title, section · date).
- **States:** results (shown) · **loading** (skeleton rows) · **empty** (no posts / no matches → "No
  posts match these filters" + clear) · row hover · dropdown open. delete → confirm `dialog` + `sonner`
  toast.
- **Typography:** title cells `text-sm/500`; meta mono; th mono-uppercase 11px.
- **Icons:** `search`, `chevron-down`, `more-vertical`, `plus`.
- **Responsive:** table on `md+`; stacked cards on `sm`.
- **A11y:** real `<table>` semantics; row actions reachable; sortable headers `aria-sort` (if sorting).
- **Dev notes:** table render is a **Server Component**; the **filter/search controls + row-action
  dropdown** are client islands. Filters are URL search-params (shareable, server-filtered) where
  possible.

---

### Screen: Media  (route: /admin/media)
- **Layout:** AdminShell → page header (crumb + h1 + storage count) → **MediaPicker** drop-zone →
  image grid, `p-6 flex-col gap-5`.
- **Component tree:**
  - **MediaPicker (drop-zone)** → `components/admin/media-picker.tsx`: dashed `border-border` panel,
    lucide `upload` in `bg-brand/10` circle, "Drop images here, or browse", format/size hint.
    states: idle · **drag-over** (`border-brand bg-brand/5`) · uploading (progress bar) · error (toast).
    *(see Library §32)*
  - **MediaGrid** → `NEW: components/admin/media-grid.tsx`: responsive grid
    (`auto-fill minmax(190px,1fr)`, mobile 2-col). Each tile = `aspect-[4/3]` image (`next/image` from
    R2) + filename/dims/size (mono) + **hover overlay**: `Copy URL` (lucide `copy`) and `Delete`
    (lucide `trash` in `text-destructive`).
  - states: populated (shown) · empty (no media → drop-zone only + hint) · per-tile hover · copied
    (toast "URL copied") · delete (confirm `dialog`).
- **Typography:** filename/dims mono 11/10px; header count mono.
- **Icons:** `upload`, `copy`, `trash-2`, `image`.
- **Responsive:** grid `auto-fill` desktop → 2-col mobile; overlay actions tap-reveal on touch.
- **A11y:** each tile has alt/filename; overlay buttons `aria-label`; delete confirm dialog.
- **Dev notes:** **Client component** for drop-zone (drag events, upload progress) + copy-URL +
  delete. Grid data from R2 listing; thumbnails via `next/image`.

---

## Build order (Admin — Phase D from DESIGN-HANDOFF §3)
1. `AdminShell` + `StatusPill` (shared across all admin screens).
2. **Login** (auth gate).
3. **Dashboard** (StatCard + CoverageGaps + RecentPosts) — depends on coverage data.
4. **Posts list** (PostsTable + FilterBar).
5. **Post Editor** (PublishBar + MarkdownEditor + LivePreview[=Prose] + MetadataPanel + TagInput +
   MediaPicker) — the heaviest; depends on Prose (Phase B) and MediaPicker.
6. **Media** (MediaPicker + MediaGrid) — depends on R2.

## Open questions (admin-specific; see DESIGN-HANDOFF §5 for the rest)
- Q10 **Auth** — single-owner credential store + session strategy (out of design scope; login wires to it).
- Q11 **Autosave cadence** — debounce interval for draft autosave + the "saved 2h ago" provenance source.
- Q12 **Markdown flavor** — confirm MDX (so the editor preview === the public Prose renderer) and the
  toolbar's insert behaviors.
- Q13 **Media constraints** — max file size (mocked 5 MB), accepted types, and whether on-upload
  variants/resizing happen (for `next/image` + 16:9 covers).
