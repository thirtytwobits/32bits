# Phase 0 — Live Site Inventory

Audit of [32bits.io](https://32bits.io/) as it exists on Squarespace, captured
to inform the migration. Snapshot HTML for every page lives under
`_squarespace-snapshot/` (gitignored — local cache only).

Captured: 2026-05-06.

---

## Summary

| Item                      | Value                                |
| ------------------------- | ------------------------------------ |
| Page count                | **27** (1 home, 1 about, 25 gallery) |
| Unique source media files | **208** images (no video)            |
| Brand mark                | 348×346 PNG (hand-drawn polyhedron)  |
| Site title                | "thirty-two"                         |
| Tagline                   | "I like to make things."             |
| Squarespace site ID       | `593de2cd3e00be288f77c692`           |
| Current font              | Poppins (Google Fonts CDN)           |
| Registrar                 | **GoDaddy**                          |
| DNS provider              | **AWS Route 53**                     |
| Current host              | Squarespace (4 A records)            |
| External embeds           | 1 iframe (microbit MakeCode)         |

---

## 1. URL inventory

### Top-level

- `/` — Home (gallery overview)
- `/about` — About / bio page
- `/gallery` — index page (Squarespace-generated; not migrated as-is, the new
  Home subsumes it)

### Gallery pages (curated homepage order)

The order below is the **display order on Home**, not alphabetical. Use these
positions as the `order:` frontmatter values when migrating (recommend
multiples of 10 to leave room for inserts: `10, 20, 30, …`).

Captured to `_squarespace-snapshot/data/homepage-order.txt`.

| #   | Slug (current)                   | Suggested new slug         |
| --- | -------------------------------- | -------------------------- |
| 1   | `danger-lab`                     | `danger-lab`               |
| 2   | `dragon-head-r8b63`              | `dragon-head`              |
| 3   | `8bit-permaproto-computer-xpmnc` | `8bit-permaproto-computer` |
| 4   | `printomatic-wlfnd`              | `printomatic`              |
| 5   | `super-mini`                     | `super-mini`               |
| 6   | `yakindu-toy-rtngn`              | `yakindu-toy`              |
| 7   | `gesture-dimmer-85l48`           | `gesture-dimmer`           |
| 8   | `internet-skylight-kcf25`        | `internet-skylight`        |
| 9   | `body-bus-7m8bh`                 | `body-bus`                 |
| 10  | `microbit-launcher`              | `microbit-launcher`        |
| 11  | `uno-alarm-clock-hkzfy`          | `uno-alarm-clock`          |
| 12  | `microbit-connect3-rb9k5`        | `microbit-connect3`        |
| 13  | `birdsofthedamned-v2-esmnp`      | `birds-of-the-damned-v2`   |
| 14  | `motobit-loud-speaker-a28kd`     | `motobit-loud-speaker`     |
| 15  | `865004006353-dc224`             | `minty-punk-console`       |
| 16  | `starlight-8bsgy`                | `starlight`                |
| 17  | `the-noer-er6lk`                 | `the-noer`                 |
| 18  | `rocket-launcher-35chr`          | `rocket-launcher`          |
| 19  | `pinewood-derby-d8akj`           | `pinewood-derby`           |
| 20  | `blind-robit-ebfah`              | `blind-robit`              |
| 21  | `hsv-bf7ba`                      | `hsv`                      |
| 22  | `breadboard-gas-guage-ye34c`     | `breadboard-gas-gauge`     |
| 23  | `birds-of-the-damned-7yxrc`      | `birds-of-the-damned`      |
| 24  | `ir-thing-fk4gz`                 | `ir-thing`                 |
| 25  | `stacking-stones-7b5zj`          | `stacking-stones`          |

The Squarespace random-suffix slugs (e.g. `-r8b63`) are an artifact of the
CMS; cleaner slugs are recommended for the new site. Project #15
(`865004006353-dc224`) appears to be unnamed — the slug looks like a phone
number or accidentally-generated value. Needs a real title before migration.

### Redirects to plan (Phase 5/6)

For SEO and deep-link continuity, every old URL should redirect to its new
slug. GitHub Pages doesn't support server-side redirects, so the cleanest
options are:

1. Keep the old slugs (no redirects needed). Trades clean URLs for zero
   migration friction.
2. Add `<meta http-equiv="refresh">` redirect pages at each old slug,
   generated automatically from the slug rename map. Crawler-friendly when
   paired with `rel=canonical`.

Decision deferred to Phase 5.

---

## 2. Media inventory

- All media is hosted on `images.squarespace-cdn.com` under the site ID.
- Squarespace serves dynamic-resize variants via `?format=NNNNw` (100, 300,
  500, 750, 1000, 1500, 2500). The base URL without `?format=` is the
  original.
- Full URL list saved to `_squarespace-snapshot/data/all-media-urls.txt`
  (208 lines, originals only).
- **No video assets** were found anywhere on the site. All "media" is still
  imagery (including animated `.gif`).

### Per-project content image count

Excludes site chrome (favicon, GitHub icon, Printables button, brand mark).

| Slug                           |  Images |
| ------------------------------ | ------: |
| super-mini                     |      25 |
| dragon-head-r8b63              |      19 |
| printomatic-wlfnd              |      11 |
| birdsofthedamned-v2-esmnp      |      11 |
| hsv-bf7ba                      |      10 |
| blind-robit-ebfah              |       9 |
| motobit-loud-speaker-a28kd     |       9 |
| pinewood-derby-d8akj           |       7 |
| uno-alarm-clock-hkzfy          |       7 |
| birds-of-the-damned-7yxrc      |       6 |
| rocket-launcher-35chr          |       6 |
| stacking-stones-7b5zj          |       6 |
| starlight-8bsgy                |       6 |
| body-bus-7m8bh                 |       5 |
| gesture-dimmer-85l48           |       5 |
| internet-skylight-kcf25        |       5 |
| yakindu-toy-rtngn              |       5 |
| breadboard-gas-guage-ye34c     |       4 |
| ir-thing-fk4gz                 |       4 |
| microbit-launcher              |       4 |
| the-noer-er6lk                 |       4 |
| 865004006353-dc224             |       3 |
| danger-lab                     |       3 |
| 8bit-permaproto-computer-xpmnc |       2 |
| microbit-connect3-rb9k5        |       2 |
| **Total**                      | **178** |

(208 unique URLs total includes home + about page imagery.)

### Image formats observed

`.jpg`, `.JPG`, `.jpeg`, `.png`, `.PNG`, `.gif`. Some `.gif` files are
animated — `birdsofthedamned-v2-esmnp` and `printomatic-wlfnd` notably use
GIF for animation.

For the new site Astro will convert most of these to optimized AVIF/WebP at
build time. Animated GIFs should be considered for conversion to `.mp4` /
`.webm` muted-autoplay (better compression, more control), but not required
in Phase 5.

### Migration plan for media

1. Bulk-download originals (no `?format=` suffix) to local working storage.
2. Optionally lossless-recompress JPEGs (jpegoptim) and PNGs (oxipng) before
   committing — Astro can also do this at build, but smaller LFS-tracked
   originals = smaller repo.
3. Move per-project under `public/media/<slug>/` with sensible filenames (the
   current filenames are camera defaults like `IMG_0824.JPG`).
4. Reference via Astro's `<Image>` component for responsive variants.

---

## 3. Brand assets

### The "rock" — site logo

Captured locally at `_squarespace-snapshot/assets/brand-mark-rock.png`.

- **Format:** PNG, 348×346, RGBA
- **Style:** hand-drawn line wireframe of an irregular polyhedron (the "rock")
- **Origin URL:** `https://images.squarespace-cdn.com/.../e3644281-…/32+%281%29.png`
- **Squarespace alt text:** `"thirty-two"`
- **Used as:** site header logo (Squarespace's `header-title-logo`)

This is the brand mark referenced in DESIGN.md R10 — the floating top-left
element on project pages. Despite the visual being polyhedral, the source is
**raster, not vector**. Phase 2 should produce a clean SVG (manual trace or
auto-trace + cleanup) for crisp display at all sizes.

### Favicon

Captured at `_squarespace-snapshot/assets/favicon.ico`. Same dimensions as
the rock — likely the same file repurposed. Phase 5 should generate a proper
favicon set (16, 32, 96, apple-touch 180) from the cleaned-up SVG.

---

## 4. Typography on the current site

- **Single typeface in use:** **Poppins** (Google Fonts CDN), weights 300,
  400, 500, 700 with italic variants.
- **No second face** — Squarespace renders headings and body in the same
  face at different sizes/weights.

This violates DESIGN R11 (two paired faces, self-hosted). Phase 2 will pick
the new pairing. Poppins is acceptable to keep as one of the two if desired,
but it must be self-hosted (e.g. via `@fontsource/poppins` or downloaded WOFF2).

No custom color palette tokens were defined in the page source — Squarespace
uses its own CSS variables for theming. The visible site is essentially
black-on-off-white with no accent color. Phase 2 should formally pick a
two-color (or three-color) palette per DESIGN.

---

## 5. Squarespace-specific embeds and migration risks

| Item                               | Found on             | Migration plan                                                             |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| MakeCode microbit iframe           | `microbit-launcher`  | Re-embed as `<iframe>` in MDX; trivial                                     |
| Squarespace gallery block          | All gallery pages    | Replaced by Astro `<MediaBlock>` (Phase 2)                                 |
| Squarespace form blocks            | None found           | n/a (DESIGN: no contact form)                                              |
| Squarespace commerce / cart        | Header has cart icon | Drop entirely (no e-commerce in scope)                                     |
| Squarespace `data-block-type`      | Throughout           | Stripped during migration (block IDs 5, 44, 1337 = image/text/image-newer) |
| External GitHub links              | 6 across pages       | Plain `<a>` tags in MDX                                                    |
| Printables button (`In-Blue-128…`) | Multiple             | Replace with text link or self-hosted icon                                 |

**No** YouTube, Vimeo, CodePen, or other dynamic embeds. **No** video
elements. **No** Squarespace forms. The site is genuinely static text +
images, which makes the migration mechanical.

---

## 6. DNS and registrar

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Registrar      | GoDaddy                                                                              |
| DNS hosted at  | **AWS Route 53** (NS records on `awsdns-*`)                                          |
| Apex A records | `198.49.23.144`, `198.49.23.145`, `198.185.159.144`, `198.185.159.145` (Squarespace) |
| `www` CNAME    | `ext-cust.squarespace.com`                                                           |
| TTLs           | (default Route 53; lower to 300s ~24h before cutover)                                |

**Important for Phase 7:** DNS edits happen in **Route 53**, not at GoDaddy.
The registrar is GoDaddy but nameservers are delegated to AWS, so the change
panel is the AWS console (or `aws route53` CLI).

### Cutover record set (target)

When ready to switch to GitHub Pages:

- Apex `32bits.io` → four A records:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www.32bits.io` → CNAME `thirtytwobits.github.io`
- (Optional) AAAA records:
  - `2606:50c0:8000::153`, `2606:50c0:8001::153`,
    `2606:50c0:8002::153`, `2606:50c0:8003::153`

---

## 7. Decisions / questions surfaced by the audit

These are new items, on top of the open questions still in DESIGN.md §7.

- **Slug rename map** — recommended in §1 above. Locks in clean URLs at
  migration time. Decide before Phase 5.
- **Project #15 needs a real name** — the `865004006353-dc224` slug is a
  placeholder.
- **Animated GIF → MP4 conversion** — opt-in per project; not required.
- **Old-URL redirect strategy** — defer to Phase 5; either keep old slugs or
  emit meta-refresh stubs.
- **Logo vectorization** — needed for crisp display at all sizes. Either
  hand-redraw in SVG (preferred — it's simple) or auto-trace the PNG and
  clean up. Phase 2 task.

---

## 8. Files produced by this audit

```
_squarespace-snapshot/                  (gitignored)
├── html/                               raw HTML for all 27 pages
│   ├── home.html
│   ├── about.html
│   └── <slug>.html  × 25
├── assets/
│   ├── brand-mark-rock.png             the rock, 348×346
│   └── favicon.ico                     same image, .ico container
└── data/
    ├── homepage-order.txt              25 lines, curated order
    └── all-media-urls.txt              208 lines, deduped originals
```

Local-only by design — these are working files for the migration, not
content. The content of value (frontmatter, prose, organized media) ends up
in `src/content/` and `public/media/` during Phase 5.
