import { SITE_LIVE, SITE_URL } from '../lib/i18n';
export const GET = () =>
  new Response(
    SITE_LIVE
      ? `User-agent: *\nAllow: /\nDisallow: /stats/\nDisallow: /es/stats/\nDisallow: /gl/stats/\nDisallow: /nl/stats/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
      : '# Web en preparación: cerrada a buscadores hasta el lanzamiento\nUser-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
