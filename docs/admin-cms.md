# Admin CMS patterns

The owner-only CMS under `/admin`. Register: **denser than the public site, brand color reserved for
primary actions / active nav / status only.** Built 1:1 from `plan/design/handoff/design/Stage4-Handoff.md`.

## Shell & server/client split

- **`components/admin/admin-shell.tsx`** — the layout chrome (client component): desktop sidebar
  (`flex-[0_0_224px]`) + mobile topbar→`Sheet`. It's a **controlled** Sheet (`open`/`onOpenChange`) so
  tapping a nav link closes it (`onNavigate`). `app/admin/layout.tsx` (server) does `requireOwner()`,
  fetches the nav's post count, and wraps children in `<AdminShell>`.
- **Server components render data; client "islands" handle interaction.** The posts list
  (`app/admin/posts/page.tsx`) renders the table on the server; the **filter bar** and **row-action
  menu** are client components. Filters live in **URL search params** (shareable, server-filtered).
- Shared bits: `StatusPill`, `TypeChip`, `AdminPageHeader`, `StatCard`, `CoverageGaps`.

## The post editor (`components/admin/editor.tsx` = `PostEditor`)

The heaviest screen. One client orchestrator holds all form state and composes:

```
PublishBar        (sticky: StatusPill + saved-state + Save draft / Publish|Update)
├ MarkdownEditor  (components/admin/post-editor.tsx — title + mono toolbar + textarea)
├ PreviewPane     (renders <Prose> from the live-preview HTML)
└ MetadataPanel   (Section→Category(filtered)→Type→TagInput→auto Exam→Excerpt→Slug→date)
```

Layout: **desktop = 3 panes side-by-side; mobile = Write/Preview/Details tabs.** Both layouts are in
the tree (`hidden lg:flex` + `lg:hidden`), so the panes **mount twice** — which is why `MetadataPanel`
derives its field ids from **`useId()`** (hardcoded ids would collide across the two instances and
break `<label htmlFor>` on mobile). If you refactor, either keep `useId()` or mount one layout via a
media-query hook.

### Live preview (the key pattern)

`PostEditor` debounces the Markdown body (300 ms) and POSTs it to **`app/api/admin/preview/route.ts`**
with an **`AbortController`** (cancels the in-flight request on each keystroke — a Server Action can't
be aborted, which is why this is a Route Handler). The handler is **owner-gated (401, not a redirect)**,
size-capped, and renders with the **same `renderMarkdown` pipeline** as the public page → *preview ==
published*. The abort-on-keystroke also prevents out-of-order responses (no "latest wins" bookkeeping
needed).

### Save flow

`PostEditor` calls the Server Action `savePost(id, values)` (a plain object, not FormData — cleaner for
rich state like the tag array). On a **create** success it uses `window.history.replaceState` to swap
the URL to `/admin/posts/<id>/edit` **without** `router.replace` — a real navigation would remount the
editor and lose in-memory state (dirty flag, focus). Next's App Router patches `history` so
`usePathname` stays in sync. A `beforeunload` guard warns on unsaved edits.

## Server Actions pattern (`app/admin/posts/actions.ts`)

Every mutation follows the same shape — **this is the template to copy for any owner-gated mutation**:

```ts
export async function savePost(id, values): Promise<ActionResult> {
  await requireOwner();                    // 1. gate FIRST, outside any try/catch (redirect throws)
  const parsed = PostInput.safeParse(values);
  if (!parsed.success)                     // 2. zod validate → structured fieldErrors
    return { ok: false, error, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const db = getDb();
  // 3. reads first: slug uniqueness, section/domain existence, resolve tag ids
  // 4. atomic write: db.batch([...]) (see data-and-content.md)
  try { /* writes */ } catch (e) {         // 5. map D1 constraint errors → friendly result, not 500
    if (constraintKind(e) === "unique") return { ok:false, fieldErrors:{ slug:[…] } };
    throw e;
  }
  revalidatePath("/admin"); revalidatePath("/admin/posts");   // 6. revalidate
  return { ok: true, id, slug };
}
```

- **`requireOwner()` must stay outside `try/catch`** — it gates by throwing `NEXT_REDIRECT`; a naive
  catch would swallow the redirect and let the action run unauthenticated. (If you must wrap it, call
  `unstable_rethrow` first.)
- Return a **discriminated `ActionResult`** (`{ok:true,…} | {ok:false,error,fieldErrors?}`); the client
  renders `fieldErrors` inline and toasts `error`. Actions never `throw` for expected failures.
- **CSRF is handled by Next by default** (Origin/Host check + `SameSite=Lax` cookies) — no
  `allowedOrigins` needed for a single-host deploy.
- `id` args on `deletePost`/`duplicatePost` are zod-guarded; `duplicatePost` copies all columns + tags.

## Client-side conventions (learned the hard way)

- **Radix DropdownMenu → Dialog**: opening a modal Dialog from a menu item freezes the page
  (`pointer-events:none` DismissableLayer race) if the menu is kept open. Render the Dialog as a
  **sibling** (not nested) and defer the open: `onSelect={() => setTimeout(() => setOpen(true), 0)}`.
- **Radix Select reset**: pass `value=""` to the Select **root** to show the placeholder / clear
  selection (the empty-string restriction is only on `<Select.Item>`).
- **Debounced URL writes** must read `window.location.search` at fire time, not a captured `params`
  snapshot, or a late debounce clobbers a filter changed in the meantime.
- **lucide-react 1.x** uses new icon names (`CircleCheck`, `EllipsisVertical`, `CircleAlert`,
  `ChartColumn`, …) — verify against `node_modules/lucide-react` before importing.

## Deferred: Media / cover images

`/admin/media` and the MetadataPanel cover field need the **R2 `MEDIA_BUCKET` binding** (not yet
scoped). The cover field shows a "coming soon" placeholder; wire it up per
`plan/phases/02-content-crud.md` §11 once R2 is granted.
