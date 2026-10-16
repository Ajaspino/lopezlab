// @ts-check
import { defineConfig } from 'astro/config';
import redirects from './redirects.json' with { type: 'json' };

// SITE_URL y BASE_PATH permiten publicar en GitHub Pages (https://ajaspino.github.io + /lopezlab). Sin ellas: dominio final y raíz.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  // Dominio final: se usa para canónicas, sitemap e imagen para compartir
  site: process.env.SITE_URL || 'https://www.lopezlab.com',
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  image: { responsiveStyles: false },
  // Redirecciones desde las URLs de la web antigua (respaldo HTML; los 301 reales van en public/_redirects)
  // Las redirecciones de la web antigua solo tienen sentido en el dominio final (ruta base '/')
  redirects: base === '/' ? redirects : {},
});
