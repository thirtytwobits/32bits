// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 32bits.io is hosted on GitHub Pages with the apex custom domain.
// `site` is the public URL — used by the sitemap, canonical tags, and
// any absolute-URL helpers. With a custom apex domain, `base` stays at '/'.
//
// See ROADMAP.md §6 (CI / Pages) and docs/DESIGN.md R10 (IA).
export default defineConfig({
  site: 'https://32bits.io',
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
