# Copilot Instructions for 32bits.io

## Commands

- Use Node 22 (`.nvmrc`); the project requires Node `>=20.10.0`.
- `npm run dev` starts the Astro development server.
- `npm run check` runs Astro and TypeScript validation.
- `npm run build` produces the static site in `dist/`; this is the GitHub Pages CI build.
- `npm run preview` serves a completed production build.
- No test runner or single-test command is configured. Use `npm run check` for targeted source/content validation and `npm run build` for end-to-end static generation.

## Architecture

This is an Astro static site deployed to GitHub Pages. `astro.config.mjs` defines the production site URL, enables MDX and sitemap generation, configures English-only i18n, and adds build-time math rendering with `remark-math` and `rehype-katex`. The GitHub Actions workflow installs with `npm ci`, builds `dist/`, and deploys that artifact when `main` changes.

Writing is the central content pipeline:

1. Author Markdown or MDX in `src/content/writing/`. The `writing` collection in `src/content.config.ts` validates frontmatter and ignores filenames beginning with `_`.
2. `src/pages/writing/[slug].astro` statically generates one route per non-draft entry, and `WritingLayout.astro` renders its metadata and body through `BaseLayout.astro`.
3. The home page, writing index, and RSS endpoint independently read the same non-draft collection, sorted newest first. The home page displays the first three entries.

`BaseLayout.astro` owns document metadata, global font/style imports, the theme initialization script, header, footer, skip link, canonical URLs, RSS discovery, and Open Graph defaults. Keep page-specific content in page/layout components rather than duplicating these document-level concerns.

Global visual ownership is intentionally split: `themes.css` contains semantic light/dark tokens, `global.css` contains page chrome and shared layout primitives, and `prose.css` owns long-form article, code, table, figure, video, math, and print styling. Use the existing semantic tokens rather than raw component colors.

## Content and UI Conventions

- `docs/DESIGN.md` records owner-stated requirements and takes precedence over code or roadmap material. `docs/STYLE_FOUNDATIONS.md` is the detailed visual/editorial specification for the writing-first site.
- Writing frontmatter must provide `title`, `description`, and `published`; use optional `updated`, `status`, `kind`, `topics`, and `lang` exactly as defined in `src/content.config.ts`. Only `draft` entries are excluded from pages, listings, and RSS.
- Keep writing slugs stable: routes and canonical URLs are derived directly from the content entry ID as `/writing/<id>/`.
- In MDX, import local media and use `Figure.astro` for editorial images. It requires meaningful `alt` text and supports `caption`, `credit`, and `width` (`normal`, `wide`, or `full`).
- Use `YouTubeEmbed.astro`, not raw iframes, for talks. Supply a descriptive `title`; use its optional `caption` and `transcript` props when available. It deliberately uses the privacy-enhanced YouTube host and lazy loading.
- Math is authored with `$...$` and `$$...$$`; fenced code uses Astro’s Shiki pipeline. Keep the prose CSS as the authoritative treatment for both.
- Theme preference cycles system/light/dark, persists only explicit light/dark choices under `32bits-theme`, and is applied inline before rendering to avoid a theme flash. Do not change that storage key or bypass the semantic theme tokens.
- Preserve the accessibility baseline: semantic page structure, skip link target `#content`, visible focus styles, descriptive image/embed text, and reduced-motion support.
