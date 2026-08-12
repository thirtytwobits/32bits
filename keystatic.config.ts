/**
 * Keystatic CMS configuration.
 *
 * Schemas here mirror the Zod schemas in `src/content.config.ts` so the
 * admin UI's forms stay aligned with what the build expects. When a new
 * frontmatter field is added, update both files.
 *
 * Storage mode: `local` (writes directly to the filesystem). Run
 * `pnpm dev` and visit `/keystatic` to author content. Files are
 * committed to git via your normal workflow — Keystatic doesn't make
 * commits itself.
 *
 * Body editor: `fields.mdx({ components })` is wired up with
 * componentBlocks for every Slabs and Smear primitive we have. Authors
 * compose the page from those blocks visually; Keystatic writes the
 * MDX files. The components in MDX are bare JSX (no `import`
 * statements) — `src/pages/projects/[slug].astro` provides the runtime
 * components via `<Content components={...} />`.
 *
 * Image uploads: `fields.image` writes to `public/media/`. We
 * intentionally use a flat directory rather than per-project subdirs;
 * Keystatic's image field doesn't natively support per-project paths.
 * Existing per-project paths (`/media/danger-lab/*`) keep working for
 * reading.
 */
import { config, fields, collection } from '@keystatic/core';
import { wrapper, block } from '@keystatic/core/content-components';

const heroSchema = fields.object(
  {
    type: fields.select({
      label: 'Hero type',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
      defaultValue: 'image',
    }),
    src: fields.text({
      label: 'Hero src',
      description: 'Path under /media/<slug>/ or an absolute URL.',
      validation: { length: { min: 1 } },
    }),
    alt: fields.text({
      label: 'Hero alt text',
      description: 'Describe the image for screen readers.',
    }),
  },
  { label: 'Hero' },
);

// Shared image-field config so we get the same upload directory + public
// path on every block that takes an image.
const imageField = (label: string) =>
  fields.image({
    label,
    directory: 'public/media',
    publicPath: '/media/',
  });

// Shared loading attribute selector. "Eager" should only be used for
// above-the-fold images (typically the very first one on a page).
const loadingField = () =>
  fields.select({
    label: 'Loading',
    options: [
      { label: 'Lazy (default)', value: 'lazy' },
      { label: 'Eager — only for above-the-fold', value: 'eager' },
    ],
    defaultValue: 'lazy',
  });

// === Slabs primitives ======================================================

const TextSlab = wrapper({
  label: 'Text Slab',
  description: 'Full-screen solid panel with prose. Children are markdown.',
  schema: {
    variant: fields.select({
      label: 'Variant',
      options: [
        { label: 'Body — paragraph reading size', value: 'body' },
        { label: 'Display — large hook / punchline', value: 'display' },
      ],
      defaultValue: 'body',
    }),
    label: fields.text({
      label: 'Mono label (optional)',
      description: 'Small monospace caption above the content (e.g. "// premise").',
    }),
    align: fields.select({
      label: 'Vertical alignment',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center (default)', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
      defaultValue: 'center',
    }),
  },
});

const ImageOverlay = wrapper({
  label: 'Image with Overlay',
  description: 'Full-bleed image with display-size text overlaid via mix-blend-mode.',
  schema: {
    image: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      description: 'Required. Describe the image for screen readers.',
      validation: { length: { min: 1 } },
    }),
    align: fields.select({
      label: 'Overlay text alignment',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Lower-left', value: 'lower-left' },
      ],
      defaultValue: 'center',
    }),
    loading: loadingField(),
  },
});

const FixedImage = block({
  label: 'Fixed Image',
  description:
    'Sticky 100vh image. Stays pinned at viewport top while subsequent Text Slabs scroll over it. Optional overlay text.',
  schema: {
    image: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      description: 'Required. Describe the image for screen readers.',
      validation: { length: { min: 1 } },
    }),
    overlay: fields.text({
      label: 'Overlay text (optional)',
      description: 'Display-size headline laid on the image. Leave empty for a bare fixed image.',
      multiline: true,
    }),
    align: fields.select({
      label: 'Overlay alignment',
      description: 'Where the overlay text sits in the frame. Ignored when no overlay.',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Lower-left', value: 'lower-left' },
      ],
      defaultValue: 'center',
    }),
    loading: loadingField(),
  },
});

const TitleSlab = block({
  label: 'Title Slab',
  description: 'Project title + meta + optional summary. Use as the first scene.',
  schema: {
    title: fields.text({
      label: 'Title',
      description: 'Use \\n for line breaks in display.',
      multiline: true,
      validation: { length: { min: 1 } },
    }),
    meta: fields.text({
      label: 'Meta (optional)',
      description: 'Small mono caption above the title (e.g. "/projects/danger-lab").',
    }),
    summary: fields.text({
      label: 'Summary (optional)',
      multiline: true,
    }),
  },
});

const Bleed = block({
  label: 'Full-bleed Image',
  description: 'Image alone, no text. Used between scenes for rest.',
  schema: {
    src: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      validation: { length: { min: 1 } },
    }),
    loading: loadingField(),
  },
});

const Scene = wrapper({
  label: 'Scene (cover or reveal)',
  description:
    'Sticky-image scene with a slab covering or revealing it. Children are the slab content.',
  schema: {
    image: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      validation: { length: { min: 1 } },
    }),
    pattern: fields.select({
      label: 'Pattern',
      options: [
        { label: 'Cover — image visible first, slab covers it', value: 'cover' },
        { label: 'Reveal — slab on top, slab departs to expose static image', value: 'reveal' },
      ],
      defaultValue: 'cover',
    }),
    dwellVh: fields.number({
      label: 'Dwell (vh)',
      description: 'How long the revealed image stays sticky (reveal pattern only).',
      defaultValue: 200,
    }),
    loading: loadingField(),
  },
});

// === Smear primitives ======================================================

const SmearHero = block({
  label: 'Smear Hero',
  description: 'First image bleeding off the right edge with title floating bottom-left.',
  schema: {
    title: fields.text({
      label: 'Title',
      multiline: true,
      validation: { length: { min: 1 } },
    }),
    image: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      validation: { length: { min: 1 } },
    }),
    meta: fields.text({
      label: 'Meta (optional)',
    }),
  },
});

const SmearTwoUp = wrapper({
  label: 'Smear Two-Up',
  description: '62/38 image + text composition. Children are the prose column.',
  schema: {
    image: imageField('Image'),
    alt: fields.text({
      label: 'Alt text',
      validation: { length: { min: 1 } },
    }),
    align: fields.select({
      label: 'Image position',
      options: [
        { label: 'Image right (text left)', value: 'right' },
        { label: 'Image left (text right)', value: 'left' },
      ],
      defaultValue: 'right',
    }),
    label: fields.text({
      label: 'Mono label (optional)',
    }),
  },
});

const SmearDisplay = wrapper({
  label: 'Smear Display Heading',
  description: 'Full-width display-type moment, no image. Use sparingly.',
  schema: {
    label: fields.text({
      label: 'Mono label (optional)',
    }),
  },
});

const SmearCaption = wrapper({
  label: 'Smear Caption-as-Headline',
  description: 'Oversized caption below an image (deeper background tone).',
  schema: {
    label: fields.text({
      label: 'Mono label (optional)',
    }),
  },
});

const projectComponents = {
  TextSlab,
  ImageOverlay,
  FixedImage,
  TitleSlab,
  Bleed,
  Scene,
  SmearHero,
  SmearTwoUp,
  SmearDisplay,
  SmearCaption,
};

// ===========================================================================

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: '32bits.io' },
  },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Displayed title of the project.',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'URL slug',
            description: 'Lowercase-hyphenated. Used as the URL path under /projects/.',
          },
        }),
        order: fields.number({
          label: 'Order',
          description:
            'Sort key on Home (ascending). Use multiples of 10 to leave room for inserts.',
          defaultValue: 10,
          validation: { isRequired: true },
        }),
        hero: heroSchema,
        summary: fields.text({
          label: 'Summary',
          description: 'One-liner shown under the title on the Home overview.',
          multiline: true,
        }),
        template: fields.select({
          label: 'Template',
          description:
            'Slabs = sticky-image-with-slabs / Smear = asymmetric editorial. Affects only which primitives suit the page; both layouts share the same MDX context.',
          options: [
            { label: 'Slabs', value: 'slabs' },
            { label: 'Smear', value: 'smear' },
          ],
          defaultValue: 'slabs',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'When checked, the page is excluded from the build.',
          defaultValue: false,
        }),
        hidden: fields.checkbox({
          label: 'Hidden',
          description: 'When checked, the page builds but is excluded from Home and Prev/Next.',
          defaultValue: false,
        }),
        body: fields.mdx({
          label: 'Body',
          description: 'Compose the project page from blocks. Add a block, fill its fields.',
          components: projectComponents,
        }),
      },
    }),

    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'URL slug',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Used in <meta description> and OpenGraph tags.',
          multiline: true,
        }),
        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
        }),
        body: fields.mdx({
          label: 'Body',
          // Pages are mostly prose — no project components. Keystatic
          // still needs an empty components map (or the field rejects
          // unknown elements).
          components: {},
        }),
      },
    }),
  },
});
