# Content Guide

Articles are MDX files in one of two collections:

- `writing/` for essays, notes, papers, case studies, and talks.
- `making/` for dispatches, project notes, and media-heavy maker work.

The filename becomes the public slug. For example, `writing/serious-software.mdx`
publishes at `/writing/serious-software/` when its status is public.

## Frontmatter

Drafts do not need a publication date:

```yaml
---
title: Article Title
description: A concise summary for indexes, SEO, and previews.
status: draft
kind: essay
topics:
  - systems
lang: en
---
```

Published and revised entries must include `published`:

```yaml
published: 2026-09-11
updated: 2026-09-18
status: published
```

Dates are editorial calendar dates in `YYYY-MM-DD` format, not timestamps.
`updated` is optional and should only be present when it adds useful revision
context.

## Valid Values

`status`:

- `draft` - excluded from generated routes, indexes, and RSS.
- `published` - public.
- `revised` - public, with a meaningful post-publication revision.

`kind` for `writing`:

- `essay`
- `paper`
- `case-study`
- `note`
- `talk`

`kind` for `making`:

- `dispatch`
- `project`
- `note`

`topics`:

- Any array of strings is valid.
- Keep topics lowercase and reusable.
- Current examples include `making`, `prototyping`, `cyber-physical systems`,
  `dev kits`, `publishing`, `systems`, and `technical writing`.

`lang`:

- `en` is the current site language.
- The schema accepts a language string, but add new locales to `astro.config.mjs`
  before publishing non-English content.

## Authoring Helpers

Create a writing draft:

```bash
npm run new:writing -- "Article Title"
```

Create a making draft:

```bash
npm run new:making -- "Dispatch Title"
```

Useful options:

```bash
npm run new:writing -- "Article Title" --slug custom-slug --kind note
npm run new:making -- "Dispatch Title" --slug custom-slug --kind project
```

The scaffold creates the MDX file and a matching media directory under
`public/media/<slug>/`.

Publish a draft:

```bash
npm run publish -- writing/article-title
npm run publish -- making/dispatch-title
```

Publishing changes `status: draft` to `status: published`, inserts today's
local `published` date, runs article checks, and runs the Astro content check.

Use an explicit date when importing older work:

```bash
npm run publish -- making/danger-lab --date 2025-03-27
```

Run article-only checks:

```bash
npm run article:check
```

The article checks are intentionally small today: public entries need real
titles, descriptions, publication dates, non-placeholder bodies, and no
placeholder YouTube IDs. This is the hook for stricter publishing checks later.

## MDX Components

Import components when needed:

```mdx
import Figure from "../../components/Figure.astro";
import YouTubeEmbed from "../../components/YouTubeEmbed.astro";
```

Images should live under `public/media/<slug>/` and be referenced with absolute
site paths:

```mdx
<Figure
  src="/media/article-title/image.webp"
  alt="A precise description of the image."
  caption="A caption that explains why the image matters."
  width="wide"
/>
```

Figures are lightbox-enabled by default. Use `lightbox={false}` for images that
should remain ordinary inline media.
