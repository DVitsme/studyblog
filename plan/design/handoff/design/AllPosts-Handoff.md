# StudyBlog — All-posts archive (Handoff)

> Handoff block in the exact format from `components-tech-and-handoff-spec.md`. Mockup:
> `StudyBlog All Posts.dc.html` (Results / Empty / Loading toggle · theme · desktop + mobile). Body:
> `AllPostsBody.dc.html`. Token-named; both themes via `.dark`. Reuses `SiteHeader` + `SiteFooter` and
> the Search facet system.

---

### Screen: All posts  (route: /posts)
- **Purpose:** the reverse-chron index of every post — the natural "View all" target from home /
  cert-hub "latest" sections, so the IA no longer jumps straight from a list to a single post.
- **Layout:** SiteHeader → `max-w-[1080px] mx-auto px-5 pt-8 pb-14`: breadcrumb → intro (h1 + blurb)
  → **facet bar** (Card) → count + sort row → reverse-chron list grouped by month → "Load older"
  → SiteFooter.
- **Component tree:**
  - **SiteHeader** — `active` = none.
  - **FacetBar** → reuses `components/site/search-form.tsx` facets (Library §38) in a horizontal Card:
    filter `input` (lucide `search`) + **Section / Type / Tag** toggle-chip rows (mono pills; selected
    `bg-brand/12 text-brand border-[brand 30%]` + `aria-pressed`, idle `border-border muted`). "Section
    · All" is the default-selected chip.
  - **count + sort** → result count (`font-mono text-xs`) + Sort `select` (Newest first). `border-b`.
  - **PostList (reverse-chron)** → `NEW: components/site/post-list.tsx`: month group label
    (`font-mono text-[11px] uppercase muted`) then **list rows** — compact horizontal cards
    (`bg-card border-border rounded-lg p-4`): left = type chip + `section · category` crumb + title
    (`text-base/600 text-balance`) + excerpt (`text-[13.5px] muted`); right = date (`font-mono
    text-xs`, top-aligned). hover `border-brand`. Rows are the whole-card link.
  - **Pagination** → "Load older posts" `Button{secondary}` (or cursor pagination).
- **States:** **results** (grouped list, shown) · **empty** (dashed card + lucide `search` + "No posts
  match those filters" + "Clear all filters") · **loading** (skeleton rows, `sbPulse`). row hover/focus.
- **Typography:** h1 `text-3xl/600`; row title `text-base/600`; excerpt `text-[13.5px]`; month labels /
  dates / counts / type chips → JetBrains Mono.
- **Icons:** `search`, `chevron-down`, `arrow-right`.
- **Data:** all posts, ordered `publishedAt` desc, grouped by month; fields `type`, `section`,
  `category`, `title`, `excerpt`, `publishedAt`, `slug`. Facets filter the set; URL search-params
  carry active facets + sort for shareable/back-button state.
- **A11y:** `<main>` landmark; facet chips `aria-pressed`; list is an ordered list semantically; each
  row link has a discernible name; AA contrast both themes; empty state actionable.
- **Responsive:** facet chips wrap; rows stack their date under the meta on `sm`; same single-column
  list desktop + mobile. Mobile may collapse facets into a `sheet` "Filter" trigger.
- **Dev notes:** **Server Component** for the list (filtered/sorted on the server from frontmatter);
  the **facet/sort controls** are a thin client island reflecting to URL params. Shares the search
  index/facet definitions with `/search` (Library §38) — build once. Reuses PostCard styling tokens in
  the compact row form (`post-list.tsx` is a denser sibling of `post-card.tsx`).

## Screen index addition (DESIGN-HANDOFF §2 · Public)
| All posts | `/posts` | ✅ `StudyBlog All Posts.dc.html` | SiteHeader · FacetBar(search facets) · PostList(reverse-chron, month-grouped) · SiteFooter |

## Component addendum — add to Component-Library-Sheet.md
**PostList** — `components/site/post-list.tsx`  *(built)*
- **Props:** `groups:{ month, posts[] }[]` (or flat `posts[]` + `groupByMonth` flag).
- **Composition:** month label (`font-mono text-[11px] uppercase muted`) + compact row cards (type chip
  + crumb + title `text-base/600` + excerpt + right-aligned mono date). hover `border-brand`.
- **States:** results / empty (dashed card + clear-filters) / loading (skeleton rows). Used on `/posts`
  and reusable for any dense reverse-chron listing.
- **Maps to:** new file; denser sibling of `post-card.tsx`. **Dev:** Server (list) + client facet island.
