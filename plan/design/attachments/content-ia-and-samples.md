# StudyBlog — Content, IA & Realistic Samples (attachment)

> Attach to claude.ai/design. Use the **real sample content** below in every mockup — **no lorem
> ipsum**. The information architecture and content model tell you what each page contains and how
> items are categorized.

## Information architecture (pages to design)

### Public
- **Home `/`** — the journey hook, a progress snapshot (coverage bars for the 3 certs), latest posts,
  the 3 cert cards, a featured project.
- **Cert hub** `/a-plus`, `/security-plus`, `/network-plus` — section intro, **coverage checklist**
  (each exam domain ✓/○ + post count), latest posts in that cert.
- **Domain archive** `/[section]/[category]` — posts within one official exam domain.
- **Post page** `/posts/[slug]` — the article: title, meta, cover, table of contents, body, related
  posts, prev/next. A **project write-up** is a special variant (see below).
- **Type archive** `/types/[type]` — posts of one format (e.g. all labs).
- **Tag hub** `/tags/[tag]` — one concept across all three certs.
- **Projects** `/projects` — the security project write-ups as case-study cards.
- **Journey** `/journey` — a milestone timeline + a "Now" block (current focus) + weekly journals.
- **About** `/about` — the from-zero story + identity links (GitHub/LinkedIn).
- **Search** `/search` — text + facet filters (section, type, tag).

### Admin (authenticated, utilitarian — different visual register from public)
- **Login `/login`** — single owner, email + password, no sign-up.
- **Dashboard `/admin`** — drafts, recent posts, and a **"coverage gaps"** widget (empty domains to
  write next).
- **Posts list `/admin/posts`** — filterable table (draft/published, section, type).
- **Editor `/admin/posts/new` & `/admin/posts/[id]/edit`** — a Markdown editor with **live preview**,
  plus a metadata side-panel (section, category, type, tags, exam, excerpt, cover image, slug, status).
- **Media `/admin/media`** — uploaded image grid.

## Content model (every post has these four axes)
1. **Section** (one) — the cert: `CompTIA A+` · `CompTIA Security+` · `CompTIA Network+` · `The Journey`.
2. **Category** (one) — the official **exam domain** (drives the coverage tracker). Examples:
   A+ Core 1 → *Networking*, *Hardware*, *Mobile Devices*, *Virtualization & Cloud*, *Hardware &
   Network Troubleshooting*; Security+ → *General Security Concepts*, *Threats Vulnerabilities &
   Mitigations*, *Security Architecture*, *Security Operations*, *Security Program Management*.
3. **Type** (one) — the format/badge: `concept` · `cram` · `lab` · `troubleshooting` ·
   `practice-exam` · `study-guide` · `journal` · `project` · `resources`.
4. **Tags** (many) — cross-cutting concepts: e.g. `subnetting`, `tcp-ip`, `firewalls`, `pki`,
   `malware`, `raid`, `siem`, `troubleshooting-methodology`.

## Realistic coverage data (for the tracker mockups)
| Cert | Exam(s) | Domains covered | % |
|------|---------|-----------------|---|
| CompTIA A+ | 220-1201 / 220-1202 | 4 of 9 | 44% |
| CompTIA Security+ | SY0-701 | 3 of 5 | 60% |
| CompTIA Network+ | N10-009 | 0 of 5 | 0% (just started) |

Per-domain checklist example for **Security+ (SY0-701)**:
- ✓ General Security Concepts — 3 posts
- ✓ Threats, Vulnerabilities & Mitigations — 5 posts
- ✓ Security Operations — 2 posts
- ○ Security Architecture — 0 posts
- ○ Security Program Management & Oversight — 0 posts

## Sample posts (use these verbatim in mockups)

**1. Concept** — `type: concept` · A+ → Networking · tags: subnetting, tcp-ip, ipv4
- **Title:** "Subnetting Without Tears: How CIDR Finally Clicked"
- **Excerpt:** "I avoided subnetting for two weeks. Here's the mental model that made /26 and /27 stop
  being scary — and the 4-step method I now use on every practice question."
- Meta: Published Jun 18, 2026 · 7 min read

**2. Project (case study)** — `type: project` · Security+ → Security Operations · tags: siem,
incident-response, vulnerability-management · repo + demo
- **Title:** "Vulnerability Management in My Home Lab: 47 Hosts, 12 Criticals → 3"
- **Excerpt:** "I built a credentialed-scan pipeline with OpenVAS, triaged by CVSS, actually
  remediated, and re-scanned. Here's the report — and what broke along the way."
- **At-a-glance card:**
  - Goal: Stand up a real vulnerability-management workflow and produce a professional report.
  - Stack: OpenVAS / Greenbone, Metasploitable, Windows 10 eval, VirtualBox
  - Duration: 1 week · Status: Shipped
  - Key metrics: **47 hosts scanned · 12 criticals → 3 after remediation · 92% of highs closed**
  - Links: GitHub repo · 3-min demo video
- Meta: Published Jun 25, 2026 · 14 min read

**3. Journal** — `type: journal` · The Journey · tags: progress
- **Title:** "Week 6: 14 Hours In, First Core 1 Practice Test at 81%"
- **Excerpt:** "Hardware domain is solid, troubleshooting still shaky. Hours logged, wins, and the
  three things I'm fixing next week."
- Meta: Published Jun 22, 2026 · 3 min read

**4. Cram sheet** — `type: cram` · A+ → Networking · tags: ports-and-protocols
- **Title:** "Ports & Protocols Cheat Sheet (A+ / Net+ / Sec+)"
- **Excerpt:** "Every port number CompTIA expects you to know, grouped so they actually stick — with
  the mnemonics I use."
- Meta: Updated Jun 20, 2026 · reference

**5. Troubleshooting** — `type: troubleshooting` · A+ → HW & Network Troubleshooting · tags:
troubleshooting-methodology, post-bios-uefi
- **Title:** "No POST, No Beep: Walking the A+ Methodology on a Dead PC"
- **Excerpt:** "Applying CompTIA's 6-step troubleshooting theory to a build that wouldn't power on —
  step by step, including the dumb thing that turned out to be the cause."
- Meta: Published Jun 12, 2026 · 9 min read

## Sample post body (for the Post page — show real prose + a code block + a callout)
> Headings, a fenced code block, a table, and a callout/aside are all common. Example snippet to render:
>
> **H2: The 4-step method**
> 1. Find the block size (256 − the interesting octet).
> 2. List the subnets...
>
> Code block (mono, syntax-highlighted), e.g.:
> ```
> 192.168.1.0/26  → hosts .1–.62,  broadcast .63
> 192.168.1.64/26 → hosts .65–.126, broadcast .127
> ```
> A callout/aside: "💡 Tip: the network ID is always even for /25 and larger."

## Admin data shapes (for the editor mockups)
- **Editor:** large Markdown textarea on the left, **live rendered preview** on the right (toggle on
  mobile), a top publish bar (Save draft / Publish / status pill), and a collapsible right metadata
  panel: Section (select) → Category (select, filtered by section) → Type (select) → Tags (multi,
  create-on-the-fly) → Exam (auto) → Excerpt (textarea) → Cover image (drop zone) → Slug (auto,
  editable) → Publish date.
- **Dashboard cards:** "Drafts (2)", "Published (17)", "This week: 1 post", and a **Coverage gaps**
  list ("Security Architecture — 0 posts → write next").
