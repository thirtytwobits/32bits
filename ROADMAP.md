# 32bits.io Migration Roadmap

This document is the high-level plan for moving [32bits.io](https://32bits.io/) off
Squarespace and onto a self-hosted, GitHub Pages-served static site. It is intended
to be read top-to-bottom: each phase builds on the last and ends in a verifiable
state.

---

## 1. Goals and Non-Goals

### Goals

- A media-first, mostly-text-and-pictures portfolio site with minimal chrome.
- One codebase that adapts responsively to phone, tablet, and desktop with no
  parallel "mobile version".
- Support for Apple-style scroll-driven animations (pin a section, scrub a
  timeline tied to scroll progress, then release) on selected pages.
- Adding a new page is a single file change with no edits to global navigation,
  templates, or indexes.
- Hosted from GitHub Pages on the existing custom domain `32bits.io`, deployed
  on every push to `main` via GitHub Actions.
- All technology is open source and well-supported, so the site can sit unattended
  for months without rotting.

### Non-Goals

- A drag-and-drop visual page builder. Authoring is Markdown/MDX with live hot
  reload as the WYSIWYG surrogate.
- A backend, database, or user accounts.
- E-commerce, comments, analytics dashboards. (Privacy-respecting analytics may
  be added later as an optional add-on.)
- Feature parity with every Squarespace block; some old Squarespace embeds may
  need to be re-implemented or dropped.

---

## 2. Technology Stack

| Concern              | Choice                               | Why                                                                 |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| Site framework       | **Astro**                            | Static-first, MDX, content collections, image optimization          |
| Page authoring       | **MDX** (Markdown + components)      | Frontmatter for config, drop in components when needed              |
| Styling              | **Tailwind CSS**                     | Mobile-first responsive utilities, AI-friendly, no CSS sprawl       |
| Scroll animation     | **GSAP + ScrollTrigger**             | Industry standard for Apple-style scroll-scrub effects              |
| Smooth scrolling     | **Lenis**                            | Smooth-scroll feel; integrates cleanly with ScrollTrigger           |
| Image/video pipeline | **Astro `<Image>` + `<Video>`**      | Auto-generated responsive `srcset`, lazy loading, format conversion |
| Type checking        | **TypeScript**                       | Catches schema/frontmatter mistakes at build time                   |
| Linting/formatting   | **ESLint + Prettier**                | Consistent style with minimal effort                                |
| Package manager      | **pnpm**                             | Fast, deterministic                                                 |
| Hosting              | **GitHub Pages**                     | Free, integrated with the repo, already in use elsewhere            |
| CI/CD                | **GitHub Actions**                   | Build and deploy on push to `main`                                  |
| Domain               | **`32bits.io`** (existing registrar) | Keep current registrar; only DNS records change                     |

### Things deliberately not in the stack (yet)

- **CMS layer** (TinaCMS, Decap, Sanity): adds moving parts. Revisit only if
  authoring via files becomes painful.
- **JS framework islands** (React, Vue, Svelte): Astro can host them, but the
  site shouldn't need them. Re-evaluate per-feature.
- **Analytics**: punt to Phase 8.

---

## 3. Site Architecture and Conventions

A short spec to lock in before writing code, so adding pages later is mechanical.

### Directory layout (target)

```
src/
  content/
    projects/        # one .mdx file per project
    pages/           # one .mdx file per top-level page (about, contact, ...)
  layouts/
    BaseLayout.astro       # global <head>, fonts, Lenis, footer
    DefaultLayout.astro    # standard scrolling project page
    ScrollSceneLayout.astro# layout that hosts pinned ScrollTrigger scenes
  components/
    Hero.astro
    MediaBlock.astro       # image or video, responsive
    ScrollScene.astro      # reusable pinned-timeline wrapper
    ProjectGrid.astro      # auto-generated index of /content/projects
    Footer.astro
  pages/
    index.astro            # landing — pulls from content/projects
    projects/[slug].astro  # dynamic route over content/projects
    [slug].astro           # dynamic route over content/pages
  styles/
    global.css
public/
  media/                   # images and video served as-is
```

### Page frontmatter schema (proposal)

```yaml
title: 'Project Name'
slug: 'project-name' # optional; defaults to filename
order: 10 # sort key for the index
hero:
  type: image | video
  src: /media/foo.jpg
  alt: 'Description'
template: slabs | smear # picks the page composition primitives
draft: false # excluded from build when true
```

Validated via Astro's content collections + Zod schema. Build fails on bad
frontmatter — no silent breakage.

### Responsive strategy

- Tailwind breakpoints: default = mobile, `md:` = tablet (≥768px),
  `lg:` = desktop (≥1024px).
- Every `ScrollScene` declares a `mobile` behavior: usually "skip pin, scroll
  past normally" or "swap in static image". Set with GSAP `matchMedia()`.
- Images are authored once; `<Image>` emits multiple sizes via `srcset`.
- No fixed pixel widths in layouts. Containers use fluid units / `max-w-*`.

### Accessibility minimums

- All media has `alt` text (frontmatter-required for `hero.type: image`).
- Scroll animations respect `prefers-reduced-motion` — fall back to static
  layout when set.
- Color contrast meets WCAG AA on both light and dark variants.
- Keyboard-navigable; no focus traps.

---

## 4. Phased Plan

Each phase ends with a concrete, demonstrable deliverable.

### Phase 0 — Inventory and audit

**Goal:** know what's on the live site before touching anything.

- [ ] Crawl `https://32bits.io/` and list every page and asset.
- [ ] Save a local mirror (HTML + images) as a reference snapshot.
- [ ] Note any Squarespace-specific embeds (forms, video, gallery widgets) that
      need replacement strategies.
- [ ] Capture the current site's typography, color palette, spacing — to
      decide what to keep, evolve, or drop.
- [ ] Decide which pages migrate as-is, which get rewritten, and which retire.
- [ ] Confirm registrar for `32bits.io` and current DNS provider; note TTLs.

**Exit criteria:** an inventory list (in this repo, e.g. `docs/inventory.md`)
plus a local `_squarespace-snapshot/` folder.

---

### Phase 1 — Project scaffold

**Goal:** an Astro project that builds and runs locally.

- [ ] `pnpm create astro@latest` with TypeScript strict, MDX, Tailwind.
- [ ] Add `astro-icon`, `@astrojs/sitemap`, `@astrojs/rss` (RSS optional).
- [ ] Install GSAP, Lenis. Add a tiny smoke-test scroll animation behind a
      feature flag to confirm the toolchain works.
- [ ] Configure Astro `site` and `base` for GitHub Pages. (When using a custom
      apex domain, `base` is `/`; this matters only if we ever run on the
      `username.github.io/repo` URL.)
- [ ] Add ESLint + Prettier with sensible Astro/TS rules.
- [ ] Add `.editorconfig`, `.nvmrc` / `.tool-versions` pinning Node version.
- [ ] Add `README.md` with run/build/deploy instructions.
- [ ] First commit: empty homepage that says "Hello, 32bits".

**Exit criteria:** `pnpm dev` serves a page; `pnpm build` produces `dist/`.

---

### Phase 2 — Design system and base layouts

**Goal:** the look-and-feel locked in on a small surface area before scale-up.

Design system already resolved (see [docs/DESIGN.md](docs/DESIGN.md)) — the
work in this phase is moving the design tokens and layout primitives from
`/design/option-*` mockups into production components.

**Tokens & shared chrome:**

- [x] Pick typography — Engineering pairing: Space Grotesk (display) + IBM
      Plex Sans (body) + JetBrains Mono (metadata), all self-hosted via
      `@fontsource` packages.
- [x] Set palette tokens — Amber (Gruvbox-flavored) light + dark modes,
      currently in `src/styles/design-system.css`. Light is its own design,
      not a flipped dark.
- [ ] Promote `src/styles/design-system.css` to the canonical source of
      truth (already imported by mockups).
- [ ] Build `BaseLayout.astro` — global `<head>`, fonts, theme switch
      (tri-state light/system/dark, icon-only per R10), `prefers-reduced-motion`
      handling.
- [ ] Build `BrandMark.astro` — the rock as a 24px floating top-left zoom-out
      with `mix-blend-mode: difference` for legibility over imagery.
- [ ] Build `Footer.astro` — full-width band; tagline + social icons on Home,
      no tagline on project pages.
- [ ] Build `PrevNext.astro` — terminate-no-wrap navigation between projects
      in `order` sequence.

**Layout 1 — Slabs (with cover + reveal scene patterns):**

- [ ] Build `SlabsLayout.astro` — page wrapper that hosts a sequence of
      `<Scene>` components plus optional plain-`<img>` interludes.
- [ ] Build `Scene.astro` accepting `pattern: "cover" | "reveal"` and an
      image source. Implements the sticky-image + (optional negative-margin)
      slab pattern from `/design/option-2`.
- [ ] Build `TextSlab.astro` and `TitleSlab.astro` — the slab content
      primitives (display text, body, monospace label).

**Layout 2 — Smear:**

- [ ] Build `SmearLayout.astro` — page wrapper.
- [ ] Build `SmearHero.astro` — first image bleeds off the right edge with
      title pinned to lower-left using `mix-blend-mode: difference`.
- [ ] Build `SmearTwoUp.astro` — 62/38 (or 38/62) image + text split.
- [ ] Build `SmearDisplay.astro` — full-width display heading section, no image.
- [ ] Build `SmearCaption.astro` — caption-as-headline (oversized type below
      a full-bleed image).

**Exit criteria:** one example MDX project page exists for each layout
(`template: slabs` and `template: smear`), both render correctly at phone,
tablet, desktop, with light + dark + reduced-motion variants honoring R9 / P5.

---

### Phase 3 — Content collections and dynamic routing

**Goal:** new project = drop a file. Index updates itself.

- [ ] Define `content/config.ts` with Zod schemas for `projects` and `pages`
      collections matching the frontmatter spec in §3.
- [ ] Implement `pages/projects/[slug].astro` — dynamic route over the
      `projects` collection.
- [ ] Implement `pages/[slug].astro` — dynamic route over the `pages`
      collection.
- [ ] Implement `pages/index.astro` — auto-generates the project list/grid
      from the `projects` collection, sorted by `order`.
- [ ] Add build-time check: every `hero.type: image` has non-empty `alt`.
- [ ] Add a `draft: true` filter so unpublished pages don't ship.

**Exit criteria:** add a new MDX file, `pnpm build` ships it as a routed page
and updates the index — no other edits required.

---

### Phase 4 — Scroll-scene layout

**Goal:** the Apple-style scroll-driven animation is a one-line opt-in per page.

- [ ] Build `ScrollScene.astro` — a wrapper component that:
  - pins itself for a configurable scroll distance,
  - scrubs an animation timeline tied to scroll progress,
  - releases and continues normal scroll afterward.
- [ ] Build a minimum of two reference scenes (e.g. an "explode/implode
      assembly" with a sequence of images, and a video-scrubbing scene).
- [ ] Use GSAP `matchMedia()` to define mobile fallbacks (typically: skip the
      pin, render statically, optionally show a single representative frame).
- [ ] Honor `prefers-reduced-motion`: render the static fallback.
- [ ] Document the authoring contract: what assets a scene needs, how to
      declare them in MDX.

**Exit criteria:** one project page in the repo uses `ScrollScene` and works
correctly on desktop + mobile + reduced-motion.

---

### Phase 5 — Content migration

**Goal:** every keepable page from Squarespace lives in this repo.

- [ ] Establish the asset pipeline: large originals live outside the repo
      (or under Git LFS), `public/media/` holds the optimized derivatives.
      Decide on Git LFS now or never — switching later is painful.
- [ ] Migrate one page end-to-end as the reference; iterate on layout tweaks
      until it feels right.
- [ ] Migrate remaining pages one by one. Flag anything that needs a custom
      component as a separate task.
- [ ] Re-implement any Squarespace-specific embeds (contact form, etc.).
      Likely substitutes: a `mailto:` link, Formspree, or a static "email me"
      block. Avoid third-party JS where possible.
- [ ] Generate `404.astro` and a basic `robots.txt`.
- [ ] Generate `sitemap.xml` (via `@astrojs/sitemap`).
- [ ] Add Open Graph + Twitter Card meta tags per page.
- [ ] Add a favicon set and Apple touch icons.

**Exit criteria:** local build matches or exceeds the Squarespace site in
content coverage.

---

### Phase 6 — CI and deployment to GitHub Pages

**Goal:** push to `main` → live in under two minutes.

- [ ] Enable GitHub Pages on the repo, source = "GitHub Actions".
- [ ] Add `.github/workflows/deploy.yml`:
  - triggers: `push` to `main`, `workflow_dispatch`,
  - jobs: install (pnpm), build (`astro build`), upload Pages artifact, deploy.
- [ ] Add a `.github/workflows/preview.yml` for pull requests:
  - build only (no deploy), upload `dist/` as an artifact for inspection,
  - optional: post a deploy preview via a service (deferred).
- [ ] Add basic build-time checks to CI: type check, lint, broken-link check
      against built `dist/` (e.g. `lychee` or `linkinator`).
- [ ] First end-to-end deploy: confirm the site is live at
      `thirtytwobits.github.io/32bits` (or whatever the repo URL is) before
      DNS cutover.

**Exit criteria:** the staging URL serves the new site exactly as the local
build does.

---

### Phase 7 — Domain cutover

**Goal:** `https://32bits.io/` serves from GitHub Pages with no downtime.

- [ ] Pre-flight at the registrar: confirm DNS edit access, current records,
      TTLs (lower TTLs to 300s ~24 hours before the switch to make rollback
      fast).
- [ ] In the repo, add a `public/CNAME` file containing `32bits.io` (this is
      what GitHub Pages uses to claim the custom domain).
- [ ] In repo Settings → Pages, set the custom domain to `32bits.io` and
      enable "Enforce HTTPS" once the cert is provisioned.
- [ ] Update DNS at the registrar:
  - **Apex `32bits.io`** → four A records pointing to GitHub Pages IPs:
    `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
    (and AAAA records if IPv6 is desired).
  - **`www.32bits.io`** → CNAME to `thirtytwobits.github.io`.
  - Verify DNS propagation with `dig 32bits.io +short` and
    `dig www.32bits.io +short`.
- [ ] Wait for GitHub to issue the Let's Encrypt certificate (usually minutes
      to a few hours). Then enable "Enforce HTTPS".
- [ ] Test from a clean browser / incognito / mobile network: HTTP → HTTPS
      redirect, `www` → apex (or apex → `www`, pick one) redirect, all routes
      load.
- [ ] Restore TTLs to a normal value (e.g. 3600s).
- [ ] Decommission Squarespace: cancel the plan, archive the export, remove
      Squarespace's DNS records if any are still around.

**Exit criteria:** `https://32bits.io/` loads from GitHub Pages, HTTPS works,
all internal links resolve, no Squarespace billing renews.

---

### Phase 8 — Polish, observability, and docs

**Goal:** the site is pleasant to maintain six months from now.

- [ ] Performance pass: run Lighthouse on every page; budget targets are
      LCP < 2.5s, CLS < 0.1, INP < 200ms. Optimize the heaviest media first.
- [ ] Optional: privacy-respecting analytics (Plausible, GoatCounter, or
      Cloudflare Web Analytics — none require cookie banners). Skip if not
      needed.
- [ ] Add `CONTRIBUTING.md` (or extend the README) covering: how to add a
      page, how to add a `ScrollScene`, how to optimize media, how the build
      and deploy work.
- [ ] Document the recovery path: how to roll back a bad deploy (revert
      commit, re-run workflow) and how to revert DNS to Squarespace if
      everything goes wrong inside the cutover window.
- [ ] Add a Renovate or Dependabot config to keep dependencies fresh.
- [ ] Add a quarterly checklist (in the README) for routine maintenance:
      bump dependencies, re-run Lighthouse, verify backups of source media.

**Exit criteria:** the README answers the question "how do I add a new
project page?" without me having to remember anything.

---

## 5. Risk Register

| Risk                                                    | Mitigation                                                                                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| GitHub Pages outage                                     | DNS TTLs lowered before cutover; documented rollback to Squarespace within the cancel window |
| Let's Encrypt cert provisioning delays after DNS change | Plan cutover for a low-traffic window; "Enforce HTTPS" stays off until cert is ready         |
| Large media bloating the repo                           | Decide Git LFS vs external storage in Phase 5 before bulk migration                          |
| GSAP commercial licensing if site monetizes later       | Track usage; their personal/portfolio use is fine; license if scope changes                  |
| Scroll animations feel bad on low-end mobile            | Mandatory `matchMedia()` mobile fallback in every `ScrollScene`                              |
| Frontmatter schema drift as new page types appear       | Zod schema in content collections; build fails on invalid frontmatter                        |
| Loss of Squarespace contact form                        | Replace with `mailto:` or Formspree before cutover, not after                                |
| Future me forgetting how this works                     | README + Phase 8 docs are not optional                                                       |

---

## 6. Out-of-Scope (Future Work)

- Visual CMS layer (TinaCMS) on top of the file-based content.
- RSS feed for project posts.
- Multilingual content.
- Headless commerce or service booking.
- Newsletter integration.

These are listed so the architecture can stay simple now without forgetting
what was deferred.

---

## 7. Rough Sequencing

A realistic ordering, not a calendar:

1. Phase 0 (audit) — short, but blocks everything.
2. Phases 1–4 (scaffold, design, content collections, scroll scene) —
   the bulk of the build, done before any real content moves.
3. Phase 5 (content migration) — proportional to how many pages exist.
4. Phase 6 (CI + Pages staging) — small once the build is stable.
5. Phase 7 (domain cutover) — short, but irreversible-ish; do it last.
6. Phase 8 (polish, docs) — ongoing.

Phases 1–4 should be completed and demonstrable before bulk migration in
Phase 5 begins, to avoid re-doing pages when conventions shift.
