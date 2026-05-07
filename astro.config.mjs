// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Currently deploying to the GitHub Pages staging URL — the project
// repo is served at `thirtytwobits.github.io/32bits/`, so `base` must
// match that subpath. When the apex custom domain is cut over (Phase 7),
// flip these values:
//   site: 'https://32bits.io',  base: '/'
// and add a `public/CNAME` file containing `32bits.io`.
//
// All internal paths in code go through `src/lib/url.ts` (the `url()`
// helper) so the base prefix is applied uniformly when this changes.
export default defineConfig({
  site: 'https://thirtytwobits.github.io',
  base: '/32bits',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Generate static HTML for everything; no SSR.
  output: 'static',
  // Default to JPEG/AVIF responsive variants; tweak per-image as needed.
  image: {
    // Astro's built-in Sharp service handles image optimization at build time.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
