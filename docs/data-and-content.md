# Data layer & content pipeline

Two subsystems: **Drizzle-on-D1** (persistence) and the **Markdown/Shiki pipeline** (rendering).

---

## Part 1 — Drizzle on D1

### Per-request client (`lib/db/index.ts`)

```ts
export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}
```

Call `getDb()` **inside each query/action**. Never hoist it to a module singleton — D1 bindings are
request-scoped and a shared client throws *"Cannot perform I/O on behalf of a different request."*
Construction is cheap.

### Schema (`lib/db/schema.ts`)

Content model: `sections` (cert) → `domains` (exam objective, the coverage unit) → `posts` (Markdown in
`body_md`) → `tags`/`post_tags` (M:N) + `media`. Notes that matter when editing:

- **Timestamps are `integer({ mode: "timestamp" })` = Unix _seconds_** (Drizzle stores
  `Math.floor(ms/1000)`, table default `unixepoch()`). Any raw SQL comparing them must use seconds
  (e.g. `Date.now()/1000`), not milliseconds.
- **Enums are enforced twice**: the TS `enum` in `lib/taxonomy.ts` (single source) **and** a SQL `CHECK`
  constraint in the migration. Keep them in sync.
- Indexes are the array form: `(t) => [index("…").on(t.col), check(…)]`.
- `relations()` are defined for the query builder.

### Migrations (`migrations/`)

Drizzle-kit generates SQL; wrangler applies it. Scripts in `package.json`:
`db:generate` (drizzle-kit generate), `db:migrate:local` / `db:migrate` (apply local/remote),
`db:seed:local` / `db:seed`. **Applying to remote D1 is a separate, prod-touching step** — do it as
part of a deploy, not silently.

### Queries (`lib/db/queries.ts`)

Read helpers, each calling `getDb()`. Highlights worth copying:
- **Coverage** (`coverageByExam`, `coverageGaps`) — the signature feature. "Domains with ≥1 published
  post ÷ total." The gaps query is `domains LEFT JOIN posts … GROUP BY domains.id HAVING
  count(CASE WHEN status='published' THEN 1 END) = 0` — correctly returns domains with no posts *and*
  domains with only drafts. (Verified empirically.)
- **Search** — user input goes through `LIKE`, so escape the metacharacters or a search for `100%`
  matches everything: `q.replace(/[\\%_]/g, c => "\\"+c)` then `` sql`… like ${'%'+esc+'%'} escape '\\'` ``.

### Mutations = Server Actions, and **atomicity via `db.batch`** (`app/admin/posts/actions.ts`)

**D1 has no interactive transactions** (`db.transaction()` throws). The only atomic primitive is
`db.batch([stmt, …])` (all-or-nothing). So the pattern for a multi-write mutation is **reads first,
then one batch**:

```ts
// reads: validate slug uniqueness, section/domain existence, resolve tag ids  (before any write)
// then the atomic write:
await db.batch([                      // literal tuple — db.batch wants [stmt, ...stmt[]]
  db.update(posts).set(fields).where(eq(posts.id, id)),
  db.delete(postTags).where(eq(postTags.postId, id)),
  db.insert(postTags).values(tagRows),
]);
```

Build a **literal tuple** for `batch` (not a cast array) so TS accepts the non-empty-tuple type.
Create paths can't be one batch (the join insert needs the generated post id), so they insert the row,
then best-effort the join — a tag-insert failure there must not strand the created post.

Other D1/Drizzle gotchas baked into `actions.ts`:
- **Catch constraint errors** — D1 surfaces them only via message; `constraintKind()` regexes
  `/UNIQUE constraint failed/` and `/FOREIGN KEY constraint failed/` → return a friendly field error
  instead of a raw 500. (There's a check-then-insert slug race; the constraint is the backstop.)
- **Local D1 (miniflare) historically doesn't enforce FKs**, so a bad `sectionSlug`/`domainId` passes
  in dev and only 500s in prod — hence explicit existence checks before the write.
- `.returning({ id })` works on a plain insert, but **not** with `onConflictDoNothing` (returns nothing
  on conflict — a Drizzle bug); `resolveTagIds` upserts then re-selects ids instead.
- `revalidatePath` is safe to call (no-ops on the dummy cache) — see the deployment doc for Phase 3.

---

## Part 2 — Markdown → sanitized HTML (`lib/content/`)

Posts store raw Markdown in D1; it's rendered **server-side** to sanitized HTML, then injected via
`dangerouslySetInnerHTML`. The renderer is shared by the (future) public post page **and** the admin
live preview, so *preview == published*.

### The pipeline (`lib/content/render.ts`)

```
unified()
  .use(remarkParse).use(remarkGfm).use(remarkRehype)
  .use(rehypeSanitize)          ← EARLY: right after untrusted→hast, before the trusted transforms
  .use(rehypeSlug).use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypeShikiVendored)     ← our hand-rolled highlighter (below)
  .use(rehypeStringify)
```

**Sanitize ordering is load-bearing.** `allowDangerousHtml` stays false (raw HTML dropped), and
sanitize runs *before* slug/autolink/shiki — those are trusted machine transforms whose output
(heading ids, Shiki's inline-styled spans) must survive. This ordering was XSS-tested with an
18-payload battery (script/img/onerror/`javascript:`/`data:`/entity-encoded/mixed-case) — all
neutralized, and code-block *content* is escaped by Shiki so it can't inject markup.

### The Shiki bundle trap (the expensive lesson)

Importing `shiki`, `@shikijs/rehype`, `@shikijs/langs`, or `rehype-pretty-code` makes OpenNext's esbuild
pull the **entire ~250-grammar barrel** → a **15 MB / 2.9 MB-gzip** worker that risks the 1 s startup
limit. The fix (all four pieces needed):

1. Import from **`@shikijs/core` + `@shikijs/engine-javascript`** — never a `shiki/*` subpath.
2. Use the **JS regex engine**, not WASM — Workers block runtime WASM compilation. `{ forgiving: true }`
   so one unconvertible grammar can't throw.
3. **Vendor** the ~10 grammars + 2 themes into `lib/content/vendor-shiki/` (self-contained `.mjs`) so
   esbuild can't over-bundle `@shikijs/langs`.
4. **Hand-roll the rehype step** (`lib/content/rehype-shiki.ts`) calling `highlighter.codeToHast(...)`
   directly, instead of `@shikijs/rehype` (which transitively imports `shiki/core`).

Result: **10 grammars, ~200 KB**. An **ESLint `no-restricted-imports` rule** (`eslint.config.mjs`)
fails the build if anyone re-imports the barrel packages. To add a language: vendor its grammar `.mjs`
into `vendor-shiki/` and register it in `highlighter.ts` — don't `import` it from `@shikijs/langs`.

The transformer emits dual-theme markup (`defaultColor: false` → `--shiki-light`/`--shiki-dark` CSS
vars); `app/globals.css` `.prose-content .shiki` maps those to `color` and flips them under `html.dark`.
It's wrapped in try/catch (fail-soft: leave the sanitized `<pre>`) so a highlight error never 500s the
page (this backs the post page *and* the editor preview).

### Prose + reading time

- `components/site/prose.tsx` — renders the HTML inside `.prose-content` (typography in `globals.css`).
  The single reading surface.
- `lib/content/reading.ts` — `readingMinutes()` lives here (not `render.ts`) so Server Actions can
  import it **without** pulling the whole Shiki module graph.
