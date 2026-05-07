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

export const url = (path: string): string => {
  if (path === '/' || path === '') return BASE;
  const trimmed = path.replace(/^\//, '');
  return `${BASE}${trimmed}`;
};
