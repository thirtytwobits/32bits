# 32bits.io

Source for [32bits.io](https://32bits.io) — a media-first portfolio site built
with Astro and deployed to GitHub Pages.

- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Design requirements:** [docs/DESIGN.md](docs/DESIGN.md)

If you're reading this and aren't sure why a decision was made, the answer is
almost certainly in `docs/DESIGN.md`.

## Stack

- [Astro](https://astro.build/) (static output) + MDX content collections
- Tailwind CSS v4 (Vite plugin)
- GSAP + ScrollTrigger for the Apple-style scroll-driven scenes
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling
- Git LFS for large media (photos, video)
- GitHub Actions → GitHub Pages

## Prerequisites

- Node 20+ (use `nvm use` — the version is pinned in `.nvmrc`)
- pnpm — enable via `corepack enable pnpm` (one-time, ships with Node)
- Git LFS — `brew install git-lfs && git lfs install` (one-time per machine)

## Common tasks

```sh
pnpm install         # install dependencies
pnpm dev             # start the dev server with hot reload — the WYSIWYG surface
pnpm build           # type-check + build to ./dist
pnpm preview         # serve the built ./dist locally to verify a production build
pnpm format          # apply Prettier
pnpm format:check    # verify formatting (CI runs this)
pnpm check           # run astro check (TypeScript + .astro template diagnostics)
```

## Adding a project

This is the operation most of this project's design exists to make easy.

1. Create `src/content/projects/<slug>.mdx`.
2. Fill in the frontmatter (schema in `src/content.config.ts`):

   ```yaml
   ---
   title: 'My New Project'
   order: 30
   hero:
     type: image
     src: /media/my-new-project/hero.jpg
     alt: 'What the hero image shows'
   summary: 'One-liner shown on the Home overview.'
   layout: default # or `scroll-scene`
   draft: false # true = excluded from build entirely
   hidden: false # true = built and deployed but excluded from Home
   ---
   ```

3. Drop the media into `public/media/<slug>/` (binary files go through Git LFS
   automatically — see `.gitattributes`).
4. Write the body in MDX below the frontmatter.
5. Push. GitHub Actions builds and deploys.

There is no global navigation, sitemap, or index file to update. The Home page
auto-generates the project list from the `projects` collection sorted by
`order` ascending. Previous/Next on each project page is computed from the
same list and terminates (no wrap) at the ends.

## Deployment

`main` is the deploy branch. Every push runs `.github/workflows/deploy.yml`,
which builds the site and publishes to GitHub Pages.

PRs trigger `.github/workflows/preview.yml` for a build-only check (no deploy)
that runs format check, type check, and build.

The custom-domain (`32bits.io`) cutover is a separate, manual step described
in [ROADMAP.md §4 Phase 7](ROADMAP.md). It involves a `public/CNAME` file,
GitHub Pages settings, and DNS records at the registrar.

## Repo layout

```
.
├── astro.config.mjs            # site URL, integrations, image pipeline
├── src/
│   ├── content.config.ts       # content collection schemas (Zod)
│   ├── content/
│   │   ├── projects/           # one .mdx per project
│   │   └── pages/              # one .mdx per top-level page (about, etc.)
│   ├── layouts/                # BaseLayout, DefaultLayout, ScrollSceneLayout (Phase 2)
│   ├── components/             # BrandMark, Hero, MediaBlock, ScrollScene, Footer (Phase 2)
│   ├── pages/                  # routing entrypoints (mostly thin wrappers over content)
│   └── styles/global.css
├── public/
│   └── media/                  # static media served as-is (LFS-tracked)
├── docs/DESIGN.md              # owner-stated requirements (R1–R11)
├── ROADMAP.md                  # phased migration plan
└── .github/workflows/          # build + deploy CI
```
