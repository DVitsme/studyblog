# Phase 4 — Polish, SEO, Error Pages & Launch

**Goal:** make it discoverable, fast, accessible, resilient, and credible — including the designed
error pages — then ship to the custom domain.

> **UI source of truth:** `plan/design/handoff/design/` — `ErrorPages-Handoff.md` (+ `ErrorPagesBody.dc.html`)
> for 404 / error / global-error; `DESIGN-HANDOFF.md` §4–5 for the token audit + the open questions
> resolved below.

## Prerequisites / reading
Phase 3 complete. Read `01-product-spec.md` §7–8, `06-deployment.md` §10. Next docs:
`01-getting-started/14-metadata-and-og-images.md`, `04-functions/generate-metadata.md`,
`03-file-conventions/01-metadata/{sitemap,robots,opengraph-image}.md`,
`03-file-conventions/{not-found,error}.md`, `04-functions/generate-viewport.md`.

## Tasks
### Error pages (designed — `ErrorPages-Handoff.md`)
1. **`ErrorState`** `components/site/error-state.tsx` (variant `notFound | error`): mono kicker + big
   mono `404`/`500` + h1 + body + action row + variant tail (notFound → helpful-links from `lib/site`;
   error → digest panel + report link).
2. **`app/not-found.tsx`** (Server, real 404) using `ErrorState('notFound')`; rendered for unmatched
   routes + `notFound()` calls (unknown slug/tag/category).
3. **`app/error.tsx`** (`'use client'`, receives `{ error, reset }`) using `ErrorState('error')` —
   "Try again" → `reset()` (or `unstable_retry`), digest panel shows `error.digest` (never raw stack).
   Add nested segment `error.tsx` where useful, and **`app/global-error.tsx`** (own `<html><body>`).

### SEO & feeds
4. **Metadata:** root `metadata` (title template, `metadataBase`, defaults) + per-post
   `generateMetadata`. Viewport/themeColor in `generateViewport` (not `metadata`).
5. **OG images:** `app/(public)/posts/[slug]/opengraph-image.tsx` via `next/og` (cover **16:9** — Q4) +
   a default site OG image.
6. **`sitemap.ts`** (home, hubs, published posts, archives, projects, journey, about, `/posts`,
   `/journey/practice-scores`) + **`robots.ts`** (allow public; **disallow `/admin`, `/api`, `/login`**;
   link sitemap).
7. **`app/rss.xml/route.ts`** — RSS of latest published posts (Q5: feed link in `lib/site`).
8. **JSON-LD** `BlogPosting` + `BreadcrumbList` on post pages.

### Resolve remaining open questions (bake into config/site)
9. Q4 images: confirm `next/image` via the **IMAGES** binding + R2 `remotePatterns`; cover ratio 16:9.
10. Q5 identity single-source: GitHub/LinkedIn/RSS + helpful-links live in `lib/site.ts` only.
11. Q7 counts: set constants (home latest = 4, hub = 5, archive page size = 12 / load-older).
12. Q8 TOC depth = h2 + h3 (one indent). Q9 global `motion-reduce` strategy verified.

### Polish, a11y, perf, security
13. Finalize favicon/app icons, `site.webmanifest`; loading skeletons + empty states everywhere.
14. **a11y** pass (Lighthouse + axe ≥95): focus rings (brand), landmarks, alt text, AA contrast, both
    themes. **perf** (≥95): `next/image`, lazy below-fold, Worker bundle ≤10 MB, `use cache` hits.
15. **Security review** (`/security-review` or manual): HTML sanitization, every admin action/upload
    re-checks `requireOwner()`, no secrets inlined, security headers, Server-Action origin defaults.

### Content & launch
16. **Seed real content:** About + first Journey post + ≥1 post per lead cert (A+/Sec+) so hubs,
    coverage, and `generateStaticParams` aren't empty. Consider a "How I built this blog" `project`
    post (the meta-portfolio angle, `00-overview.md`).
17. **Production cutover** (`06-deployment.md` §10): provision R2 (media + inc-cache) once R2 scope is
    granted; migrate+seed remote D1; set all prod secrets; `AUTH_URL`/`NEXT_PUBLIC_SITE_URL` = real
    domain; attach custom domain; `workers_dev:false`. **GitHub is connected → prefer Workers Builds
    CI/CD** for prod deploys (keeps local `.dev.vars` out of the build); otherwise
    `pnpm run deploy -- --keep-vars`.
18. **Smoke test in prod:** login, publish, image upload, public read, OG image, RSS, sitemap, search,
    coverage tracker, 404 + error boundary.

## Acceptance criteria
- [ ] 404 + error + global-error render the designed `ErrorState` (both themes); `not-found.tsx`
      returns HTTP 404; error boundary recovers via Try-again.
- [ ] Lighthouse ≥95 Perf / SEO / Best-Practices / Accessibility on home + a post.
- [ ] Valid `sitemap.xml` / `robots.txt` / `rss.xml`; per-post OG image; JSON-LD validates; `/admin`,
      `/api`, `/login` disallowed and absent from the sitemap.
- [ ] Production login + publish + image upload + public read work on the custom domain.
- [ ] Security review clean.

## Risks / notes
- `error.tsx` must be a Client Component; `global-error.tsx` must render its own `<html><body>`.
- Streaming metadata doesn't block UI on dynamic pages but blocks for HTML-limited bots (fine for SEO).
- `deploy` can wipe dashboard vars — `-- --keep-vars` (or use Workers Builds).
