// Builds links that respect the site's base path (/pradhidas on GitHub Pages, / on a custom domain).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = ''): string {
  const clean = path.replace(/^\//, '');
  return `${BASE}/${clean}`;
}
