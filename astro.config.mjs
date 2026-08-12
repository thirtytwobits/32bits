// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// Keystatic's admin routes are SSR-only (they need a request handler
// to write files). Our production build is `output: 'static'` for
// GitHub Pages, which can't host SSR routes without an adapter — and
// we don't want an adapter, GitHub Pages is static-only.
//
// Compromise: include Keystatic ONLY when running `astro dev`. Production
// builds skip the integration entirely; admin is a local-only dev tool.
const isDev = process.env.NODE_ENV !== 'production';

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
  // In dev we serve at root (`/`) so the Keystatic admin can hit its
  // own /api/keystatic endpoints without a base prefix — Keystatic's
  // React UI doesn't know about Astro's `base` config and otherwise
  // 404s its API calls. In the production build we keep `/32bits`
  // because GitHub Pages serves project repos at <user>.github.io/<repo>/.
  base: isDev ? '/' : '/32bits',
  trailingSlash: 'ignore',

  // React + Keystatic must come before MDX. Keystatic adds the
  // /keystatic admin route and an /api/keystatic write endpoint; the
  // admin UI is React-based.
  //
  // In production builds we skip Keystatic entirely (its SSR routes
  // require an adapter the static GitHub Pages output doesn't have).
  integrations: [react(), ...(isDev ? [keystatic()] : []), mdx(), sitemap()],

  // Static for the public site. Keystatic's admin works in dev mode
  // (where it writes files directly to the filesystem). For an
  // always-on admin in production we'd switch to a deploy adapter and
  // configure GitHub OAuth — deferred; see docs/DESIGN.md.
  output: 'static',

  vite: {
    // Cast: @keystatic/astro pulls in Vite 7, Astro core itself runs on
    // Vite 6. The `tailwindcss()` plugin gets typed against Vite 7 here
    // but works fine at runtime against Astro's Vite 6. When Astro 6
    // lands (or Keystatic downgrades) this cast can come out.
    plugins: [/** @type {any} */ (tailwindcss())],
    // Force a single React instance across Astro's React renderer and
    // Keystatic's pre-bundled admin chunk. Without this, Vite's
    // optimizeDeps creates a separate bundled React for Keystatic and
    // hooks panic with "Invalid hook call" at runtime.
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },

  // Default to JPEG/AVIF responsive variants; tweak per-image as needed.
  image: {
    // Astro's built-in Sharp service handles image optimization at build time.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
