/**
 * Content collections — the "config layer" that satisfies DESIGN.md R6
 * (easy to update; config-driven; adding a page = single file change).
 *
 * Frontmatter is validated at build time. Bad frontmatter = build failure.
 * Schema mirrors DESIGN.md §3 with the additions resolved on 2026-05-06:
 *   - `hidden: true` excludes a project from Home + Prev/Next ring,
 *     but the page still ships at its URL (distinct from `draft`).
 *   - `draft: true` excludes the page from the build entirely.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Hero block — every project page has one. Required `alt` for images
// is enforced via discriminated union below.
const heroImage = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().min(1, 'alt text is required for hero images (DESIGN P5)'),
});

const heroVideo = z.object({
  type: z.literal('video'),
  src: z.string().min(1),
  poster: z.string().optional(),
  alt: z.string().optional(),
});

const hero = z.discriminatedUnion('type', [heroImage, heroVideo]);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(), // defaults to filename
    order: z.number().int().default(0),
    hero,
    // Project page composition template — picks which layout primitives
    // the MDX body uses. Locked in 2026-05-06 (see docs/DESIGN.md). Named
    // `template` rather than `layout` because Astro's MDX integration
    // treats `layout:` as a magic import path and would conflict.
    template: z.enum(['slabs', 'smear']).default('slabs'),
    summary: z.string().optional(), // shown on Home overview
    draft: z.boolean().default(false), // excluded from build
    hidden: z.boolean().default(false), // shipped, but not on Home / Prev-Next
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, pages };
