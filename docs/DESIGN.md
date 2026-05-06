# 32bits.io Design Requirements

This document captures the **owner-stated requirements** for the new
[32bits.io](https://32bits.io/) site. These are the primary inputs for every
design and implementation decision. When in doubt, anything in this file
overrides what's in the [ROADMAP](../ROADMAP.md) or in code.

Status: **stable**. Changes here should be deliberate, dated, and noted in the
change log at the bottom.

---

## 1. Owner Profile

The site owner is the primary author and audience-of-one for the maintenance
experience. Capturing this so design decisions stay grounded in who is actually
going to live with the result.

- **Discipline:** embedded engineer, not a front-end developer.
- **Stance toward front end:** wants AI to handle the visual/CSS work; not
  interested in becoming a CSS/animation expert.
- **Maintenance posture:** wants to reuse existing open-source work and not
  "own" the technology stack.
- **Authoring frequency:** intermittent. The site must be approachable to edit
  after months of not touching it.

This profile is the lens for every "is this simple enough?" question.

---

## 2. Hard Requirements (verbatim)

The original brief, preserved as written. Each is given a stable ID so other
documents (PRs, design notes, code comments) can reference them.

### R1. Very simple composition model: WYSIWYG

A page should be authorable without learning a complex publishing pipeline.
What the author sees while editing should match what ships.

> **Interpretation in this project:** the WYSIWYG surface is a local dev server
> with hot reload, _not_ a drag-and-drop visual editor. Pages are MDX files;
> editing one and seeing it instantly in the browser is the working definition
> of WYSIWYG here. AI assistance is the substitute for direct visual
> manipulation.

### R2. Media-first portfolio

The site is "mostly pictures and video of projects with some commentary." Text
exists to support media, not the other way around. Layouts, typography, and
spacing must be tuned around media being the dominant element on every page.

### R3. Big-and-dumb scrolling

No fussy controls. The site is a scrolling page. There is no carousel,
accordion, tabs, mega-menu, modal, sidebar, or other UI machinery as the
default mode. If a control is added later, it must justify itself against this
requirement.

### R4. Scroll-driven animations

Selected pages support Apple-style scroll-driven animations: an element pins
in place, an animation timeline scrubs as the user scrolls (e.g. an assembly
explodes then implodes), then the page releases and scrolls normally. This is
an opt-in capability per page, not a default.

### R5. Easy to maintain

> "I don't want to own the technology. I want to reuse existing, open source
> work."

Every dependency must be open source, well-maintained, and replaceable. No
in-house framework, no exotic build system, no bespoke runtime.

### R6. Easy to update — config-driven and automatable

Adding a page must not require edits to global navigation, indexes, sitemaps,
or templates. Page creation is a single-file action. The build figures out the
rest.

### R7. Easy to build — AI-friendly

The chosen stack and conventions must lean toward what current AI tooling
handles well, so the owner can delegate front-end work and review results
rather than write CSS by hand.

### R8. Very simple chrome

> "Almost no chrome or navigation elements. The site should feel like a bunch
> of media with almost no menus or separators or other elements that are just
> the content itself. Airy, modern, unstructured, media-first."

No header nav menu by default. No sidebars. Footer is minimal (name, contact,
year). Whitespace and media carry the page; structural UI does not.

### R9. Responsive (single source)

The site adapts to phone, tablet, and desktop from a **single source**. There
is no "mobile version" authored alongside the desktop version. Breakpoints are
defined once; layouts and animations adjust within that one source.

### R10. Two-level information architecture (zoom model)

The site has exactly two zoom levels and no more.

- **Level 0 — Home.** A single overview page that shows all project pages in a
  specified order.
- **Level 1 — Project page.** A single project's scrolling content.

Navigation between levels is minimal, consistent, and the only navigation in
the site:

- **Zoom in:** clicking a project on Home goes to that project page.
- **Zoom out:** on every project page, a small **floating brand mark**
  ("the rock" — a polygonal vector logo) sits in the **top-left** and acts as
  the link back to Home. The brand mark _is_ the zoom-out control — there is
  no separate "Home" or "Back" button, no breadcrumb, and no header bar.
- **Lateral (within Level 1):** at the **bottom** of every project page, two
  link-style controls — "Previous" and "Next" — navigate to the adjacent
  project in Home's order. Visual format: chevron + project title, opposite
  ends of the row (see existing site reference screenshot). The list does
  **not wrap**: on the first project, "Previous" is absent (or rendered as a
  disabled chevron); on the last project, "Next" is absent (same treatment).
- **Footer:**
  - **On Home:** tagline on the left (currently "I like to make things.";
    revisit during Phase 2), small icon row on the right linking to external
    profiles (LinkedIn primary; GitHub acceptable). No other footer content.
  - **On project pages:** **no tagline.** The brand mark in the top-left
    carries the identity. The right-side social icon row may still appear in
    the footer; final decision deferred to Phase 2 implementation.

There is no third zoom level. There are no categories, tags, taxonomies,
related-project recommendations, search, or filters.

### R11. Typography as a first-class visual element

Typography is part of the design, not chrome — it carries the brand weight
that the (deliberately absent) navigation chrome would normally carry.

- **Two faces**, paired (typically: a display face for headings/titles, a
  body face for prose).
- **Self-hosted** via local `@font-face`. No Google Fonts CDN, no third-party
  font services.
- Where text appears it should be "beautiful and elegant" — type sizing,
  leading, measure (line length), letter-spacing, and vertical rhythm get
  deliberate attention rather than framework defaults.
- A well-maintained open-source typography or layout helper (e.g. a fluid
  type scale, a typographic CSS reset like Tailwind Typography) is acceptable
  if it improves the result without conflicting with R5.

---

## 3. Derived Design Principles

These are not new requirements; they are the principles that fall out of R1–R9
and that we'll hold ourselves to during implementation.

### P1. Static-first

The default page is plain HTML and CSS. JavaScript is added only for features
that genuinely need it (smooth scroll, ScrollTrigger scenes). This follows from
R5 (less to maintain) and R7 (less to debug).

### P2. Convention over configuration

There is one way to add a project page, one way to add a top-level page, and
one way to add a scroll scene. Conventions are documented. Variation requires
justification. Follows from R6 and R7.

### P3. Frontmatter as the "config layer"

Page-level configuration lives in MDX frontmatter, validated by a schema. The
build fails on invalid frontmatter rather than producing a broken page.
Follows from R6.

### P4. Mobile-first, then enhance

Layouts are written for mobile first; tablet and desktop are progressive
enhancements. Animations have a defined mobile behavior (often: skip the pin,
just scroll past). Follows from R9 and R4.

### P5. Reduce-motion and accessibility floor

`prefers-reduced-motion` is honored everywhere. Smooth scroll and ScrollTrigger
pinning are disabled for users who request reduced motion; static fallbacks
render in their place. All media has alt text; color contrast meets WCAG AA;
the site is keyboard-navigable. Follows from R5 (don't ship something that
quietly degrades for some users) and from general professional practice.

### P6. No required third-party JS for content

The site renders content without third-party scripts. Analytics, embeds, and
form services are optional add-ons, never load-bearing. Follows from R5 and
R8.

### P7. The repo is the truth

The Git repo is the entire site: content, code, media references, and
deployment workflow. There is no external CMS, database, or admin panel that
holds state the repo doesn't see. Follows from R5 and R6.

---

## 4. Non-Goals

Things that are _not_ part of this design, listed so they can be cited when
proposals try to sneak them in:

- A drag-and-drop visual page editor.
- Site-wide navigation menu, search, breadcrumbs, or category taxonomy.
- A third level of zoom (sub-pages within a project, project galleries
  separate from the project page itself, etc.). Levels are exactly Home and
  Project — see R10.
- A CMS, database, or auth system.
- E-commerce, comments, or user-generated content.
- A contact form. External profile links (LinkedIn, GitHub) replace a contact
  page entirely.
- Newsletter, RSS, or notification integrations (deferrable; revisit if
  requested).
- Multiple language variants.
- Page-by-page bespoke layouts that bypass the layout system.

---

## 5. Decision Heuristics

When a design choice is ambiguous, apply these in order:

1. **Does the simpler option satisfy the requirement?** If yes, pick it.
2. **Does the proposed change make page creation harder?** (R6) If yes,
   reject it or find a way to absorb the complexity into a layout/component
   instead of into the authoring surface.
3. **Does the proposed change add a runtime dependency?** (R5, P6) If yes,
   it must justify itself; default is no.
4. **Does it add chrome?** (R8) Default is no. Removing chrome rarely needs
   justification; adding it does.
5. **Will an AI tool produce this reliably from a short prompt?** (R7) If
   not, prefer a more conventional approach that will.
6. **Does this work on a phone?** (R9) Not "can it be made to" — does the
   default behavior work on a phone.

---

## 6. Acceptance Heuristics for "Done"

A page or feature is done when:

- It loads on mobile (≤375px wide) without horizontal scroll, layout shift, or
  broken media.
- It loads on desktop (≥1280px wide) with the intended composition.
- It works with `prefers-reduced-motion` set.
- All media has alt text or a documented reason for not having any.
- Adding a similar page later does not require touching this page.
- The build passes type check and lint.
- Lighthouse on the page shows no critical accessibility issues.

This list is intentionally short. Detailed performance budgets and analytics
goals live in the [ROADMAP](../ROADMAP.md), not here.

---

## 7. Open Questions

Tracked here so they don't get lost. Answer in place and date the answer.

### Resolved

- **Light/dark mode** _(resolved 2026-05-06)_ — Tri-state toggle:
  **light / dark / system**. Implemented as **iconography only**, no text
  labels. Must be subtle enough not to violate R8 (very simple chrome). Sits
  in or near the footer rather than as a header element.
- **Typography pairing** _(resolved 2026-05-06)_ — **Two faces**, both
  **self-hosted**. Promoted to a hard requirement (R11) given the importance
  the owner places on it.
- **Large-media storage** _(resolved 2026-05-06)_ — **Git LFS**. Adopt before
  bulk migration in Phase 5 of the roadmap. All large images and video go
  through LFS; small UI assets stay in regular Git.
- **Contact mechanism** _(resolved 2026-05-06)_ — **No contact form, no
  mailto.** The footer's external profile icons (LinkedIn primary; GitHub
  acceptable) replace a contact page. Removes a whole component category
  from the build.
- **Featured / hidden projects** _(resolved 2026-05-06)_ — `order` is
  sufficient for ordering on Home. Add a **`hidden: true`** frontmatter flag
  so a project page can be authored, committed, deployed, and previewed at
  its URL while being excluded from the Home overview and from the
  Previous/Next ring. (This is distinct from `draft: true`, which excludes
  the page from the build entirely.)

### Resolved (continued)

- **Previous/Next wrap behavior** _(resolved 2026-05-06)_ — **Terminate, do
  not wrap.** On the first project, "Previous" is absent (or a disabled
  chevron); on the last project, "Next" is absent. Folded into R10.
- **Tagline on project pages** _(resolved 2026-05-06)_ — **No tagline on
  project pages.** The floating brand mark in the top-left carries the
  identity instead. Folded into R10.

### Still open

- **Tagline copy on Home** — keep "I like to make things." (current site) or
  rewrite? Decide during Phase 2 / content migration.
- **Footer social icons on project pages** — show or hide? Defaulting to
  _show_ unless the design feels too crowded once assembled. Revisit after
  the first project page is built.
- **Body/display face selection** — specific typeface choices to satisfy R11.
  Decide during Phase 2.
- **Brand mark asset** — the polygonal "rock" logo from the existing site
  needs to be exported as an SVG (or recreated cleanly as one) before R10's
  zoom-out element can be implemented. Capture in Phase 0 inventory.

---

## Change Log

- **2026-05-06** — Initial version. Captures R1–R9 from the original brief
  plus the responsive requirement added in conversation.
- **2026-05-06** — Added R10 (two-level zoom IA with Home → Project, top-of-
  page zoom-out, bottom-of-page Previous/Next, footer with tagline + social
  icons) and R11 (typography as a first-class element; two self-hosted
  faces). Resolved five open questions: tri-state icon-only theme switch,
  two self-hosted faces, Git LFS for media, no contact form (LinkedIn link
  only), and `hidden: true` frontmatter flag for staged projects. Added
  "third zoom level" and "contact form" to non-goals.
- **2026-05-06** — Refined R10: the **floating "rock" brand mark in the
  top-left of project pages is the zoom-out control** (no separate Back
  button); Previous/Next **terminates at the list ends** rather than
  wrapping; **no tagline on project pages**. Surfaced a new open question
  for the brand mark SVG asset.
