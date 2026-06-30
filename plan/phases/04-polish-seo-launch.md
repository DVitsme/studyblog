# Phase 4 — Polish, SEO & Launch

**Goal:** make it discoverable, fast, accessible, and credible — then ship to the custom domain.

**Outcome:** strong Lighthouse scores, complete SEO/feeds, a polished look, and a live production site
with real seed content.

---

## Prerequisites / reading
Phase 3 complete. Read `01-product-spec.md` §7–8, `06-deployment.md` §10. Next docs:
`01-getting-started/14-metadata-and-og-images.md`, `04-functions/generate-metadata.md`,
`03-file-conventions/01-metadata/{sitemap,robots,opengraph-image}.md`,
`04-functions/generate-viewport.md`.

## Tasks
### SEO & feeds
1. **Metadata:** root `metadata` (title template, `metadataBase`, defaults) + per-post
   `generateMetadata` (title, description from excerpt, canonical, OG/Twitter). Remember **viewport /
   themeColor live in `generateViewport`**, not `metadata`.
2. **Dynamic OG images:** `app/(public)/posts/[slug]/opengraph-image.tsx` via `next/og` `ImageResponse`
   (title + section + type). A default site OG image too.
3. **`sitemap.ts`** (home, hubs, published posts, tag/type/domain archives, projects, about, journey)
   and **`robots.ts`** (allow all; point to sitemap; disallow `/admin`, `/api`, `/login`).
4. **`app/rss.xml/route.ts`** — RSS of latest published posts (for the author's LinkedIn/dev.to
   cross-posting flow).
5. **JSON-LD** `BlogPosting` on post pages (and `BreadcrumbList`).

### Polish
6. **Design pass:** finalize palette/accent (`07-design-system.md` §9), typography scale, spacing,
   card/hover states, badges, coverage-bar styling, 404/`error.tsx`/`global-error.tsx` design,
   favicon/app icons, `site.webmanifest`.
7. **Accessibility:** keyboard nav, focus rings, landmarks, alt text enforced, AA contrast,
   `prefers-reduced-motion`. Run Lighthouse + axe; fix to ≥95 a11y.
8. **Performance:** verify `next/image` via IMAGES binding; lazy-load below fold; check bundle size
   (Worker ≤10 MB) and per-request CPU; confirm `use cache` hit on posts/lists; Lighthouse perf ≥95.
9. **Security review:** `/security-review` or manual — confirm HTML sanitization, every admin
   action/handler calls `requireOwner()`, no secrets inlined, security headers (CSP where feasible,
   `X-Content-Type-Options`, `Referrer-Policy`), Server Action origin defaults intact.

### Content & launch
10. **Seed real content:** the About + first Journey post + ≥1 post per lead cert (A+/Sec+) so hubs,
    coverage, and `generateStaticParams` aren't empty. Consider a "How I built this blog" `project`
    post — the meta-portfolio angle from `00-overview.md`.
11. **Production cutover** (`06-deployment.md` §10): migrate+seed remote D1; set all prod secrets;
    `AUTH_URL`/`NEXT_PUBLIC_SITE_URL` = real domain; attach custom domain; `workers_dev:false`;
    `pnpm run deploy -- --keep-vars`.
12. **Smoke test in prod:** login, write+publish a post, image upload, public read, OG image, RSS,
    sitemap, search, coverage tracker.

## Acceptance criteria
- [ ] Lighthouse ≥95 Performance / SEO / Best-Practices / Accessibility on home + a post.
- [ ] Valid `sitemap.xml`, `robots.txt`, `rss.xml`; per-post OG image renders; JSON-LD validates.
- [ ] `/admin`, `/api`, `/login` are disallowed in robots and not in the sitemap.
- [ ] Production login + publish + image upload + public read all work on the custom domain.
- [ ] Security review clean (sanitization, action auth, no leaked secrets, headers present).
- [ ] At least the lead-cert hubs show real coverage and posts.

## Risks / notes
- Streaming metadata won't block UI on dynamic pages but **does** block for HTML-limited bots — fine
  for SEO. Don't put dynamic data in `generateViewport` (it can't stream).
- `deploy` can wipe dashboard vars — always `-- --keep-vars`.
- Keep OG-image generation lean (CPU budget).
