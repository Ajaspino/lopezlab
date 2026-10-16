// @ts-check
import { defineConfig } from 'astro/config';
import redirects from './redirects.json' with { type: 'json' };

export default defineConfig({
  // Dominio final: se usa para canónicas, sitemap e imagen para compartir
  site: 'https://www.lopezlab.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  image: { responsiveStyles: false },
  // Redirecciones desde las URLs de la web antigua (respaldo HTML; los 301 reales van en public/_redirects)
  redirects,
});
