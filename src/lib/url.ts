/**
 * Path helpers that respect Astro's `base` config.
 *
 * Why this exists: when deploying to a subpath (e.g.,
 * `thirtytwobits.github.io/32bits/`), Astro sets `base: '/32bits'` and
 * `import.meta.env.BASE_URL` becomes `/32bits/`. But Astro does NOT
 * automatically rewrite hardcoded `<a href="/foo">` or `<img src="/foo">`
 * paths in templates — that's our responsibility.
 *
 * Use `url(path)` everywhere we'd otherwise write `/foo`.
 *   url('/brand-mark.png')         → '/32bits/brand-mark.png'
 *   url('/projects/danger-lab')    → '/32bits/projects/danger-lab'
 *   url('/')                       → '/32bits/'
 *   url('foo')                     → '/32bits/foo'   (leading '/' optional)
 *
 * In production (apex custom domain) `base` becomes `/`, BASE_URL
 * becomes `/`, and `url('/foo')` → `/foo`. Same code, both environments.
 */

// Astro doesn't guarantee BASE_URL has a trailing slash — depends on
// `base` and `trailingSlash` config. Normalize so we can safely
// concatenate without duplicate / missing slashes.
const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/**
 * Normalize a path against the configured site base.
 *
 * - External URLs (anything starting with `http://`, `https://`, `//`,
 *   or `data:`) pass through unchanged. This lets components call
 *   `url(src)` indiscriminately on image sources that might be either
 *   local (`/media/foo.jpg`) or external (`https://cdn.example/foo.jpg`).
 * - Root path `/` returns BASE itself (`/` in production, `/32bits/` in
 *   staging).
 * - Anything else has its leading slash stripped and is concatenated
 *   onto BASE.
 */
export const url = (path: string): string => {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  if (path === '/' || path === '') return BASE;
  const trimmed = path.replace(/^\//, '');
  return `${BASE}${trimmed}`;
};
