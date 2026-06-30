# StudyBlog — Design Brief (attachment)

> Attach this file to claude.ai/design. It explains *what* StudyBlog is, *who* it's for, and the
> *voice* the design must carry. The companion files cover tokens, content, and the dev handoff format.

## What it is
A single-author blog where one person publicly documents their journey from limited IT training to
passing **CompTIA A+, Network+, and Security+**. It is part study journal, part public portfolio.

## Who it's for (two audiences at once — design must serve both)
1. **The author**, reviewing his own notes/labs (study tool, must be easy to scan and search).
2. **Hiring managers / interviewers**, skimming it as **proof of work** — proof that he genuinely
   learns, communicates clearly in writing, and ships consistently. Many viewers are
   security/cleared-IT employers, so the site must read as **credible and professional**, never gimmicky.

A third angle: the author *built this app himself*, so the craft of the site is itself a portfolio
statement. It should look like something a thoughtful engineer made.

## Voice & tone
- **Clear, honest, technical-but-readable.** Written by a learner, not a guru. ("Here's what confused
  me and how I worked it out.")
- **Credible over flashy.** Calm surfaces; let code, diagrams, and results stand out.
- **Earnest, not corporate.** No buzzword salad, no marketing fluff, no dark patterns.

## Brand direction
- **Neutral base + one confident accent.** Base is a clean neutral (near-white / near-black for dark
  mode); the accent is a **restrained tech blue** (a "terminal/blueprint" feel) used for links, active
  nav, focus rings, and progress bars. Exact values are in `design-tokens.md` — **use them verbatim**.
- **Type:** **Inter** for UI and body, **JetBrains Mono** for code, labels, and metadata chips.
- **Mood words:** precise, legible, trustworthy, a little bit "developer terminal," calm.
- Think: a well-made engineering blog / docs site (clean, content-first), not a SaaS landing page.

## Design principles
1. **Reading comfort first.** Long study posts and code blocks must be effortless to read (generous
   measure ~68ch, strong type hierarchy, comfortable line-height).
2. **Scannability.** Cards, badges, and clear hierarchy so a hiring manager gets the gist in seconds.
3. **Credibility cues are features, not decoration:** visible publish/updated dates, reading time, a
   steady archive (shows cadence), an **objectives-coverage tracker** (proof of breadth), and
   **repo/demo links** on project write-ups (proof of work). Design these prominently.
4. **Mobile-first**, then scale up. Most first views are on a phone.
5. **Accessible (WCAG AA):** keyboard-navigable, visible focus, sufficient contrast, alt text,
   respects `prefers-reduced-motion`.
6. **Light and dark** modes, both first-class.
7. **Restraint with motion** — subtle only; never block content.

## Signature feature to design well: the Objectives Coverage Tracker
A per-exam progress indicator = (official exam domains that have at least one published post) ÷
(total domains). Shown as a compact bar on the home page and cert hubs, plus a per-domain checklist
(✓ has posts / ○ empty). It honestly communicates "here's exactly what I've mastered and documented"
— and visibly, the author is further along on A+ and Security+ than on Network+. Design it to feel
like a credible dashboard, not a gamified XP bar.

## Non-goals (do not design these for v1)
Public comments, user sign-up/profiles, paywalls, ads, newsletter popups, social-vanity metrics,
heavy hero illustrations, or anything that undercuts the "serious, honest, technical" read.
