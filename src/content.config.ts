import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    status: z.enum(['draft', 'published', 'revised']).default('draft'),
    kind: z.enum(['essay', 'paper', 'case-study', 'note', 'talk']).default('essay'),
    topics: z.array(z.string()).default([]),
    lang: z.string().default('en'),
  }),
});

export const collections = { writing };
