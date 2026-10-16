import pages from '../data/pages.json';
import { allProjects, allCategories } from '../lib/images';
import { LOCALES, hrefFor, TRANSLATIONS_INDEXABLE, SITE_URL, type Lang } from '../lib/i18n';

const routes = [
  '/', '/work/', '/about/', '/contact/',
  ...allCategories().map((c) => `/work/${c.slug}/`),
  ...allProjects.map((p) => `/project/${p.slug}/`),
  ...Object.keys(pages.posts).map((s) => `/post/${s}/`),
];
const abs = (l: Lang, r: string) => SITE_URL + hrefFor(l, r);
const langs: readonly Lang[] = TRANSLATIONS_INDEXABLE ? LOCALES : ['en'];

export const GET = () => {
  const urls = langs.flatMap((l) =>
    routes.map((r) => {
      const alts = TRANSLATIONS_INDEXABLE
        ? LOCALES.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${abs(a, r)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${abs('en', r)}"/>`
        : '';
      return `<url><loc>${abs(l, r)}</loc>${alts}</url>`;
    }),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
