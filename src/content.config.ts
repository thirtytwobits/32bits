import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isCalendarDate = (value: string) => {
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(value);

  if (!match?.groups) {
    return false;
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const dateOnly = z.union([z.string(), z.date()]).transform((value, ctx) => {
  const calendarDate = value instanceof Date ? value.toISOString().slice(0, 10) : value;

  if (!isCalendarDate(calendarDate)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Use a real YYYY-MM-DD calendar date.',
    });

    return z.NEVER;
  }

  return calendarDate;
});
const status = z.enum(['draft', 'published', 'revised']).default('draft');
const requirePublicationDate = (data: { status: z.infer<typeof status>; published?: string }, ctx: z.RefinementCtx) => {
  if (data.status !== 'draft' && !data.published) {
    ctx.addIssue({
      code: 'custom',
      path: ['published'],
      message: 'Published and revised entries must include a published date.',
    });
  }
};

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      published: dateOnly.optional(),
      updated: dateOnly.optional(),
      status,
      kind: z.enum(['essay', 'paper', 'case-study', 'note', 'talk']).default('essay'),
      topics: z.array(z.string()).default([]),
      lang: z.string().default('en'),
      /** Path (relative to the repo root) to a BibTeX/CSL-JSON file for this article's citations. */
      bibliography: z.string().optional(),
      /** CSL style id or path overriding the site default ('vancouver') for this article. */
      csl: z.string().optional(),
    })
    .superRefine(requirePublicationDate),
});

const making = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/making' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      published: dateOnly.optional(),
      updated: dateOnly.optional(),
      status,
      kind: z.enum(['dispatch', 'project', 'note']).default('dispatch'),
      topics: z.array(z.string()).default([]),
      lang: z.string().default('en'),
      /** Path (relative to the repo root) to a BibTeX/CSL-JSON file for this article's citations. */
      bibliography: z.string().optional(),
      /** CSL style id or path overriding the site default ('vancouver') for this article. */
      csl: z.string().optional(),
    })
    .superRefine(requirePublicationDate),
});

export const collections = { writing, making };
