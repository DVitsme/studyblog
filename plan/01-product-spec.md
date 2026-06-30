# 01 — Product Spec

Defines *what* we build: information architecture, routes, features, content types, and the admin &
reader experiences. Architecture/implementation is in `02-architecture.md`; the taxonomy data is in
`05-content-taxonomy.md`.

---

## 1. Information architecture (site map)

### Public
```
/                              Home — the journey, latest posts, progress snapshot, the 3 certs
/a-plus                        A+ hub (Core 1 + Core 2 domains, coverage, latest A+ posts)
/network-plus                  Network+ hub
/security-plus                 Security+ hub
/journey                       Cert-agnostic: study system, weekly journals, exam-day logs, gear
/[section]/[category]          Domain archive (e.g. /security-plus/security-operations)
/posts/[slug]                  A single post (canonical post URL)
/types/[type]                  Format archive (e.g. /types/lab, /types/project)
/tags/[tag]                    Concept archive across all certs (e.g. /tags/firewalls)
/projects                      Portfolio: the security project write-ups, as case studies
/about                         Who, why, the "from zero" narrative, contact links, consistency anchor
/search                        Full-text-ish search/filter over posts
/rss.xml  /sitemap.xml  /robots.txt   Feeds & SEO
```

### Admin (authenticated, single owner)
```
/login                         Credentials sign-in (no public sign-up)
/admin                         Dashboard: drafts, recent posts, coverage gaps, quick "new post"
/admin/posts                   List/filter all posts (draft/published)
/admin/posts/new               Create
/admin/posts/[id]/edit         Edit (Markdown editor + live preview + taxonomy + cover image)
/admin/taxonomy                Manage tags & (rarely) categories; view domain coverage
/admin/media                   Uploaded images (R2) — browse/copy URL/delete
/admin/settings                Site identity, owner profile, password change (optional)
```

> **Canonical post URL is `/posts/[slug]`** (flat, stable, shareable). Section/category/tag/type pages
> are *archives that link into* `/posts/[slug]`, not parents of it. This keeps URLs stable even if a
> post's taxonomy is re-filed, and avoids deep nesting. (A post still *declares* one section + one
> category for navigation and the coverage tracker.)

---

## 2. Page inventory & rendering mode

`02-architecture.md` covers the caching mechanics. Summary of intent:

| Route | Render | Notes |
|-------|--------|-------|
| `/` | Mostly static (`use cache`), latest-posts list cached + tag-revalidated | Fast first paint. |
| `/posts/[slug]` | `generateStaticParams` for published slugs; `use cache` + `cacheTag('post-<id>')` | Revalidate on edit via `updateTag`. |
| Cert hubs, archives, tag/type pages | Cached lists, tag-revalidated on publish | |
| `/projects`, `/about`, `/journey` | Static-ish, cached | |
| `/search` | Dynamic (reads `searchParams`) | Behind `<Suspense>`. |
| `/admin/**` | Dynamic, **uncached**, auth-gated | Never prerender; reads session. |
| `/login` | Static shell + client form | |
| `/rss.xml`, `/sitemap.xml` | Route handlers / metadata files, cached | |

---

## 3. Content model (summary)

Full detail + seed data in `05-content-taxonomy.md`. Four orthogonal axes on every post:

- **Section** (1) — the cert space: `a-plus` · `network-plus` · `security-plus` · `journey`.
- **Category** (1) — the **official exam domain** the post covers (carries a `domainRef` like
  `SEC.4`, a name, and the official weight). Drives the **coverage tracker**.
- **Type** (1) — the **format** (controlled enum, drives layout + badge + `/types/*` filter).
- **Tags** (0..n) — cross-cutting **concepts/acronyms** (`tcp-ip`, `pki`, `malware`, …) that
  intentionally span certs and power topic hubs.

Plus: `exam` version pin (e.g. `SY0-701`) so a future exam version slots in without re-filing.

### Post types (enum)

| Type | Slug | Purpose | Layout emphasis |
|------|------|---------|-----------------|
| Concept note | `concept` | Explain one objective in own words | Prose + headings TOC |
| Acronym / cram set | `cram` | Flashcard decks, ports tables, cheat sheets | Tables, collapsible Q/A |
| Lab / hands-on | `lab` | Build/config walkthrough | Steps, screenshots, code |
| Troubleshooting | `troubleshooting` | Apply the 6/7-step methodology to a symptom | Symptom→theory→fix |
| Practice-exam reflection | `practice-exam` | Score, weak domains, missed-Q post-mortems | Score block + analysis |
| Study guide / objective map | `study-guide` | "Everything for Domain X" roundup | Linked index of posts |
| Weekly journal | `journal` | Cadence/accountability (hours, wins, blockers) | Dated, short |
| Project write-up | `project` | Security portfolio case study (STAR) | **Special template, §5** |
| Resource roundup | `resources` | Tools, videos, books, free labs | Annotated links |

---

## 4. Key features

### 4.1 Objectives coverage tracker ⭐ (signature feature)
A per-exam progress indicator: **(distinct official domains with ≥1 published post) ÷ (total domains)**,
optionally weighted by the official domain percentages. Rendered as:
- A compact bar on each **cert hub** and on the **home** progress snapshot.
- A per-domain checklist on the cert hub (✓ has posts / ○ empty), each row linking to the domain
  archive, showing post count.
- An **admin** "coverage gaps" widget that lists empty/thin domains → "write this next."

This is the honest substitute for "all three certs done." It is study guidance *and* interview proof
("here's exactly what I've mastered and documented"). Data source: the seeded `domains` table joined
to published posts (see `03-data-model.md`).

### 4.2 The journey / now narrative
A `/journey` page + an "About" page that tell the **from-zero** story (the most compelling
interview hook), plus a timeline of milestones (exam passes, project ships) and the current focus.
A small **"Now"** block (what I'm studying this week) reinforces cadence.

### 4.3 Project write-ups (portfolio)
`/projects` surfaces `type: project` posts as polished case studies (see §5 for the template). These
are the highest-value interview artifacts. Each links to its GitHub repo and (optionally) a demo
video embed.

### 4.4 Cross-cert tag hubs
`/tags/[tag]` collects every post on a concept across all certs, with a short intro on how the
concept deepens A+ → Net+ → Sec+. Makes the "I understand this end-to-end" story visible.

### 4.5 Search & filter
`/search` filters posts by free text (title/excerpt/tags), section, category, and type, using
`<Form>` from `next/form` (URL-param GET form, prefetched). v1 can be a simple `LIKE`/FTS query over
D1; no external search service.

### 4.6 Reading aids
Auto **table of contents** from headings, **reading time**, **publish + updated dates**, **prev/next
in same domain**, and **related posts** (shared tags). Code blocks get syntax highlighting; callouts
and tables are styled.

### 4.7 RSS / feeds
`/rss.xml` of latest published posts (interviewers and the author's own LinkedIn cross-posting flow).

---

## 5. Project write-up template (the STAR case study)

`type: project` posts render with a structured, scannable layout. The editor provides this as a
Markdown **starter template** (the author fills it in — he writes every word). Fields/sections:

1. **Title** — specific & accurate ("Detecting RDP Brute-Force in My Home Lab SIEM: From Zero Rules
   to 40% Fewer False Positives").
2. **At-a-glance card** (structured frontmatter rendered as a panel): goal, stack/tools, duration,
   repo URL, status, key metric(s).
3. **The why / problem** — what real task this mirrors.
4. **Architecture diagram** — one image (R2 upload).
5. **Method & steps** — annotated, with the author's own screenshots.
6. **What broke & how I fixed it** — the credibility section; warts stay in.
7. **Results** — quantified (hosts scanned, detections, MITRE techniques, % FP reduction, STIG score
   before/after).
8. **Lessons & next steps.**
9. **Repo / demo links.**

The three planned projects (from the career plan): **Vulnerability Management report** → **GRC /
STIG / NIST 800-171 package** → **Detection lab (SIEM + Sigma + MITRE ATT&CK)**. These also reinforce
the certs (e.g. GRC ↔ Security+ Domain 5), so a project post can carry a Security+ `section`/`category`
too.

> Honesty rules baked into the template's helper text: label everything as **lab work, not
> production**; explain the "why" at each fork; show your own environment (redacted); write as a
> learner. (Sourced from the career plan's portfolio guidance.)

---

## 6. Admin / editor experience

- **Auth:** `/login` (Credentials). All `/admin/**` gated (see `04-auth.md`).
- **Editor:** a Markdown textarea with a **live server-rendered preview** (same pipeline as
  publish, so WYSIWYG-accurate), or a lightweight Markdown editor component. Toolbar for common
  Markdown. Type-specific **starter templates** (esp. `project`).
- **Metadata panel:** section (select), category (select, filtered by section), type (select),
  tags (multi-add, create-on-the-fly), exam version (defaulted from section), excerpt, cover image,
  canonical slug (auto from title, editable), publish state (draft/published), publish date.
- **Cover & inline images:** drag-drop upload → **R2** → returns a URL inserted into Markdown
  (`06-deployment.md` §image uploads). A `/admin/media` library lists/reuses/deletes uploads.
- **Save semantics:** autosave drafts; explicit Publish. On publish/edit, the server action
  re-renders + `updateTag('post-<id>')` and revalidates affected list tags (home, section, tag pages).
- **Validation:** unique slug; required section/category/type; sanitize rendered HTML.
- **Security:** every admin Server Action / Route Handler re-checks `await auth()` and that the
  session is the owner — never trust the page-level gate alone.

### Editor: Markdown vs MDX (decision)
Store **Markdown**, not MDX. Next 16's `@next/mdx` is **file-based only** — there is **no official
API to render MDX from a database string** (confirmed against the bundled docs). Markdown rendered by
a `remark`/`rehype` pipeline gives GFM tables, code highlighting, callouts, and auto-heading anchors
with **no arbitrary JSX/JS execution** from stored content (safer for a CMS). MDX-from-DB (via
`next-mdx-remote/rsc`) is a documented stretch option in `02-architecture.md` if rich embeds are ever
needed; v1 does not need it.

---

## 7. Reader experience & credibility signals

- **Mobile-first**, fast (edge), accessible (WCAG AA: semantic landmarks, skip link, focus rings,
  alt text, color contrast).
- **Credibility cues** are deliberate: visible **publish/updated dates**, **reading time**, a
  **consistent archive** (shows cadence), the **coverage tracker** (proof of breadth), and
  **repo/demo links** on projects (proof of work). These map directly to what interviewers and
  clearance-minded reviewers screen for: genuine work, communication, follow-through.
- **One consistent identity:** the About page anchors the résumé ↔ LinkedIn ↔ GitHub ↔ blog story
  (same name, same links) — the career plan stresses cross-checkable consistency.

## 8. Non-functional targets

| Area | Target |
|------|--------|
| Performance | Lighthouse ≥ 95 perf/SEO/best-practices on post & home; fast TTFB via edge + `use cache`. |
| Accessibility | Lighthouse a11y ≥ 95; keyboard-navigable; reduced-motion respected. |
| SEO | Per-post `generateMetadata`, OG images, `sitemap.ts`, `robots.ts`, canonical URLs, JSON-LD `BlogPosting`. |
| Cost | Within Cloudflare free/low tiers (Workers + D1 + R2). |
| Resilience | Public reads degrade gracefully if a binding is missing (empty states, not 500s). |

## 9. Out of scope at launch
Public comments, multi-user, newsletter broadcasts, flashcards/SRS, practice-exam analytics, payments.
Tracked as Phase 5 candidates in `phases/05-stretch.md`.
