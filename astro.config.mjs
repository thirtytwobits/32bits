import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

export default defineConfig({
  site: 'https://32bits.io',
  // Sentry's server instrumentation deadlocks the dev server's module loader on the
  // first MDX page request (@sentry/astro 10.70 + astro 7.2), wedging every later
  // request too. Keep it to production builds until that is fixed upstream.
  integrations: [
    mdx(),
    sitemap(),
    sentry({ enabled: process.env.NODE_ENV === 'production' }),
    spotlightjs(),
  ],
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});