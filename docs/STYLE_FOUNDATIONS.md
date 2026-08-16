# 32bits.io Style Foundations

Status: draft.

This document defines the visual and editorial styling foundation for the new
32bits.io site. The site is a writing-first professional archive for serious
software engineering work with some maker portfolio gallery side notes. It
is not a, marketing page, resume, or social blog.

The style system should make long-form technical writing feel durable,
readable, and worth citing while also allowing for graphic moments where a project
has more media content interspersed. Typography is a first-class product requirement.

---

## 1. Design Position

The site should feel like:

- a personal journal of record
- an engineering monograph
- a small independent research practice
- a professional archive built to last

The site should not feel like:

- an influencer blog
- a startup landing page
- a social feed
- a visual portfolio grid
- a resume template
- a documentation theme with a name swapped in

The visual language should be quiet, precise, and confident. It should leave
room for demanding material: essays, working papers, diagrams, code, equations,
and professional reflection.

---

## 2. Typography Principles

Typography carries the site. Layout, color, motion, and imagery must support the
reading experience rather than compete with it.

Requirements:

- Use self-hosted web fonts.
- Avoid third-party font CDNs in production.
- Use a serif text face for long-form reading.
- Use a sans-serif UI face for navigation, metadata, labels, and compact
  interface text.
- Use a monospace face designed for code, tables, and technical notation.
- Keep line length comfortable for sustained reading.
- Make mathematical notation, inline code, block code, and diagrams feel native
  to the page.
- Support light, dark, and system color modes.
- Preserve excellent rendering on phones, tablets, laptops, desktop monitors,
  and print.

Recommended first font stack:

```css
:root {
  --font-body: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-ui: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono",
    monospace;
}
```

Rationale:

- `Source Serif 4` gives essays a serious published quality without feeling
  antiquarian.
- `Inter` is a neutral, highly legible UI face that works well for metadata and
  navigation.
- `IBM Plex Mono` has a technical character without the brittle feel of many
  code fonts.

Implementation preference:

- Use `@fontsource` packages or checked-in WOFF2 files.
- Subset fonts later if build size becomes material.
- Define `font-display: swap` or use the equivalent provided by the chosen font
  package.

---

## 3. Type Scale

Use a restrained type scale. The site should not use oversized marketing
headlines. Large type is reserved for the home page statement and article
titles.

Base assumptions:

```css
:root {
  --step--1: 0.875rem;
  --step-0: 1rem;
  --step-1: 1.125rem;
  --step-2: 1.375rem;
  --step-3: 1.75rem;
  --step-4: 2.25rem;
  --step-5: 3rem;
}
```

Body copy:

- Use `--step-1` for article body text on larger screens.
- Use `--step-0` or `--step-1` on small screens depending on final font
  rendering.
- Use line height between `1.58` and `1.72` for prose.
- Use line height between `1.35` and `1.5` for headings.
- Do not use negative letter spacing.
- Do not scale font size directly with viewport width.

Reading measure:

```css
.prose {
  max-width: 68ch;
}
```

Some pages may use a wider grid to make room for marginal notes, figures, or
code, but the main reading column should remain stable.

---

## 4. Color System

The site must support:

- light mode
- dark mode
- system mode

Use semantic tokens. Components should consume semantic tokens, not raw colors.

Light theme:

```css
:root,
:root[data-theme="light"] {
  color-scheme: light;

  --color-bg: #f7f6f1;
  --color-surface: #ffffff;
  --color-text: #1c1b18;
  --color-muted: #67635c;
  --color-subtle: #8c867c;
  --color-rule: #d9d4c9;
  --color-accent: #245f73;
  --color-accent-strong: #17495a;
  --color-code-bg: #ebe7dd;
  --color-code-text: #1f2a2e;
  --color-selection-bg: #cfe4eb;
  --color-selection-text: #101315;
}
```

Dark theme:

```css
:root[data-theme="dark"] {
  color-scheme: dark;

  --color-bg: #171817;
  --color-surface: #20211f;
  --color-text: #ece8dd;
  --color-muted: #b6afa2;
  --color-subtle: #8e887d;
  --color-rule: #3a3935;
  --color-accent: #83bccb;
  --color-accent-strong: #a9d7e1;
  --color-code-bg: #242824;
  --color-code-text: #f1eadf;
  --color-selection-bg: #315c68;
  --color-selection-text: #fffaf0;
}
```

System preference:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;

    --color-bg: #171817;
    --color-surface: #20211f;
    --color-text: #ece8dd;
    --color-muted: #b6afa2;
    --color-subtle: #8e887d;
    --color-rule: #3a3935;
    --color-accent: #83bccb;
    --color-accent-strong: #a9d7e1;
    --color-code-bg: #242824;
    --color-code-text: #f1eadf;
    --color-selection-bg: #315c68;
    --color-selection-text: #fffaf0;
  }
}
```

Theme behavior:

- Default to system preference.
- Store an explicit user choice only when the user selects light or dark.
- Keep the theme switch small and secondary.
- Include the correct `color-scheme` declaration so browser controls match the
  theme.
- Do not make dark mode pure black.
- Do not make light mode pure white as the page background.

---

## 5. Layout

Initial navigation should stay flat:

- Home
- Writing
- About

The page frame should be simple:

- a restrained header
- one reading-focused content area
- a quiet footer

Default layout:

```css
:root {
  --page-inline: clamp(1.25rem, 4vw, 3rem);
  --page-max: 72rem;
  --prose-max: 68ch;
}

.page-shell {
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--page-inline);
}
```

Article layout:

- Title, dek/description, date, status, and topics above the body.
- Main prose column centered or slightly left-weighted.
- Figures may break wider than the prose column when useful.
- Code blocks may break wider than the prose column on desktop.
- Avoid sidebars in the first version.
- Avoid card-heavy layouts.

---

## 6. Tailwind Decision

Do not use Tailwind Typography for the first version.

Reason:

- The site's prose style is the core identity, not a commodity content surface.
- Tailwind Typography is convenient but opinionated.
- Overriding it deeply would create an unnecessary dependency between the
  site's editorial voice and a plugin's defaults.

Acceptable Tailwind use:

- Tailwind CSS may be used later for utility composition if it proves useful.
- If Tailwind is adopted, typography should still be owned by project CSS.
- Do not use Tailwind Typography as the authoritative article style system.

Initial preference:

- plain CSS
- CSS custom properties
- Astro scoped component styles
- one global prose stylesheet

This keeps the visual system legible, portable, and easy to maintain over a
decade.

---

## 7. Prose Styling

The `.prose` layer is the most important stylesheet in the project.

It must define:

- paragraphs
- headings
- links
- lists
- blockquotes
- figures
- captions
- tables
- inline code
- code blocks
- mathematical notation
- footnotes
- horizontal rules

Prose direction:

- Paragraphs should have generous spacing, not cramped blog rhythm.
- Links should be visible without looking loud.
- Headings should feel like document structure, not landing-page banners.
- Blockquotes should be austere and readable.
- Lists should be compact enough for technical material.
- Footnotes should be supported from the beginning.
- Print styles should produce usable paper/PDF output.

Initial prose shape:

```css
.prose {
  max-width: var(--prose-max);
  font-family: var(--font-body);
  font-size: var(--step-1);
  line-height: 1.66;
}

.prose :where(h1, h2, h3, h4) {
  font-family: var(--font-ui);
  line-height: 1.38;
  font-weight: 650;
}

.prose a {
  color: var(--color-accent);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}
```

---

## 8. Media: Images, Figures, and Talks

Images should be editorial, not decorative. Every image should carry a point:
evidence, architecture, artifact, diagram, environment, result, or reference.

Use Astro's image pipeline for local images whenever possible.

Figure requirements:

- Always require meaningful `alt` text, except for explicitly decorative images.
- Support captions.
- Support source/credit text when needed.
- Support normal, wide, and full-bleed figure widths.
- Preserve aspect ratio to avoid layout shift.
- Avoid dark, cropped, atmospheric hero imagery when the subject needs to be
  inspected.

Recommended authoring pattern in MDX:

```mdx
import controlLoop from "../assets/control-loop.png";
import Figure from "../../components/Figure.astro";

<Figure
  src={controlLoop}
  alt="Block diagram of a distributed control loop."
  caption="A simplified distributed control loop."
  width="wide"
/>
```

Talk embeds are supported content.

YouTube requirements:

- Use a dedicated `YouTubeEmbed` component instead of raw iframe markup in
  articles.
- Use YouTube's privacy-enhanced embed host, `www.youtube-nocookie.com`.
- Require a descriptive `title`.
- Support an optional caption.
- Support an optional transcript link or local transcript path.
- Use a stable aspect ratio to avoid layout shift.
- Use `loading="lazy"`.
- Do not autoplay.
- Do not show YouTube embeds as decorative hero media.
- Prefer placing talks in the article body where the surrounding text explains
  why the talk matters.

Recommended authoring pattern in MDX:

```mdx
import YouTubeEmbed from "../../components/YouTubeEmbed.astro";

<YouTubeEmbed
  id="VIDEO_ID"
  title="Talk title and venue"
  caption="Talk presented at Conference Name, 2026."
  transcript="/writing/talk-title/transcript/"
/>
```

Recommended iframe baseline:

```astro
<iframe
  src={`https://www.youtube-nocookie.com/embed/${id}`}
  title={title}
  loading="lazy"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>
```

---

## 9. Code

Code is first-class content. It should look calm, precise, and printable.

Requirements:

- Use Astro's Shiki support for syntax highlighting.
- Use a light and dark Shiki theme pair or CSS-variable-based Shiki theme.
- Support fenced code blocks in Markdown and MDX.
- Support language labels if useful.
- Support line wrapping only when explicitly requested; default to horizontal
  scrolling for long code.
- Ensure inline code fits naturally in prose.
- Preserve copy/paste fidelity.

Example authoring:

````md
```rust
fn saturating_deadband(input: i16, threshold: i16) -> i16 {
    if input.abs() < threshold {
        0
    } else {
        input
    }
}
```
````

Code style should not look like a dark IDE dropped into a page. It should be
part of the document.

---

## 10. Mathematical Notation

Mathematical notation should be supported from the first implementation.

Use:

- `remark-math`
- `rehype-katex`
- local KaTeX CSS imported by the article layout

Requirements:

- Support inline math with `$...$`.
- Support display math with `$$...$$`.
- Render math at build time.
- Avoid client-side MathJax JavaScript for the default path.
- Ensure equations fit small screens with horizontal overflow when needed.
- Ensure equation color follows light/dark theme.

Example authoring:

```md
Inline: $e^{i\pi} + 1 = 0$

Block:

$$
x_{k+1} = A x_k + B u_k
$$
```

---

## 11. Accessibility

Requirements:

- Meet WCAG AA contrast for body text and interactive elements.
- Use semantic HTML.
- Preserve keyboard navigation.
- Provide visible focus states.
- Use `prefers-reduced-motion`.
- Do not require JavaScript to read content.
- Ensure theme selection works without trapping keyboard users.
- Keep skip links.
- Keep heading order meaningful.
- For embedded talks, prefer captions and provide a transcript or substantial
  written summary when available.

Focus states:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

---

## 12. SEO and Metadata

Every public page should have:

- unique title
- unique description
- canonical URL
- Open Graph metadata
- article metadata when applicable
- video metadata when a page embeds a talk as primary content
- language metadata
- RSS inclusion when applicable
- sitemap inclusion

Writing pages should expose:

- published date
- updated date when revised
- status when useful
- topics
- description/dek

The design should support these metadata without making pages look like blog
posts.

---

## 13. Internationalization

The first version may publish only English content, but routes and metadata
should not block future translation.

Requirements:

- Configure Astro i18n from the beginning.
- Start with `en` as the only locale.
- Keep language in content frontmatter.
- Use language-aware dates.
- Keep URLs stable.
- Do not expose a language switcher until more than one locale exists.

---

## 14. Motion

Motion is optional and should be rare.

Rules:

- No scroll-jacking.
- No animation libraries in the first version.
- Respect `prefers-reduced-motion`.
- Use CSS transitions only where they clarify state.
- Avoid theatrical entrance animations.

This site should earn attention through substance, not motion.

---

## 15. Implementation Summary

Recommended initial stack:

- Astro
- MDX
- plain CSS
- self-hosted fonts
- Astro image optimization
- Shiki syntax highlighting
- KaTeX through `remark-math` and `rehype-katex`
- sitemap
- RSS
- GitHub Pages deployment

Recommended initial file structure:

```text
src/
  assets/
    fonts/
    images/
  components/
    Figure.astro
    SiteHeader.astro
    ThemeToggle.astro
    YouTubeEmbed.astro
  content/
    writing/
  layouts/
    BaseLayout.astro
    WritingLayout.astro
  pages/
    index.astro
    about.astro
    writing/
      index.astro
      [slug].astro
  styles/
    global.css
    prose.css
    themes.css
```

CSS ownership:

- `themes.css`: semantic color tokens and theme behavior
- `global.css`: reset, base layout, typography tokens, accessibility defaults
- `prose.css`: long-form document styling
- component `<style>` blocks: local component details

---

## 16. Open Design Questions

The following decisions should be made during implementation:

- Whether `Source Serif 4` is the final body face after real article testing.
- Whether `IBM Plex Mono` or another mono face gives better code density.
- Whether the home page should use the serif or sans-serif face for the primary
  statement.
- Whether the visible theme toggle should be text, icon, or both.
- Whether article pages need a generated table of contents after the archive
  has enough long pieces to justify it.
