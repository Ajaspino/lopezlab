# Lopezlab web

Rediseño de lopezlab.com. Mobile-first, textos literales de la web original, solo inglés por ahora (rutas `/es`, `/gl` y `/nl` preparadas con el inglés como respaldo).

## Arranque

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # genera site/dist
```

## Estructura

- `site/src/pages/[...lang]/` rutas: home, work (con filtros), proyectos, about, contact, posts.
- `site/src/data/` contenido estructurado (proyectos, páginas) generado desde la web original.
- `site/src/assets/work/` imágenes originales; Astro las optimiza (webp responsive) al compilar.
- `site/public/media/` GIFs pesados convertidos a vídeo en bucle.
- `scripts/` herramientas para regenerar el contenido desde la web original.
- `PRODUCT.md`, `CLAUDE.md`, `AUDIT.md` contexto de diseño y decisiones.

## Notas

- Los textos no se reescriben: salen de `site/src/data/*.json`.
- Contenido e imágenes pertenecen a Lopezlab y a sus clientes.

## Publicación

- **Cerrada a buscadores por defecto.** Mientras no se defina `PUBLIC_SITE_LIVE=true` en el hosting, `robots.txt` bloquea todo y las páginas llevan `noindex`. Al lanzar en el dominio final, añade esa variable de entorno en el build de producción.
- **Dominio:** `https://www.lopezlab.com` (en `site/astro.config.mjs` y `site/src/lib/i18n.ts`). Cambia ambos si fuera otro.
- **Redirecciones de la web antigua** (`/en/...` → `/...` y filtros que ya no existen → `/work/`): `site/public/_redirects` (301 en Netlify y Cloudflare Pages) y respaldo HTML con `site/redirects.json`. Se regeneran con `python3 -I scripts/gen_redirects.py`.
- **Traducciones ES/GL/NL:** `TRADUCCIONES/traducciones.csv`. Hasta que Mariola las revise no se indexan; para activarlo pon `TRANSLATIONS_INDEXABLE = true` en `site/src/lib/i18n.ts` (añade hreflang y las incluye en `sitemap.xml`).
- Imagen para compartir: `site/public/og-image.png` (se regenera con `scripts/make_og_image.py`).

## Estadísticas de visitas

- **Contador sin cookies** (`site/src/layouts/Base.astro`): cuenta una visita por sesión del navegador, con su día, país (estimado por la zona horaria), idioma, dispositivo y navegador. Solo en producción, en el dominio real y fuera de `/stats/` y la 404. Respeta "No rastrear".
- Los contadores viven en un servicio público gratuito (abacus). La clave del espacio de nombres y la lista de países, idiomas, dispositivos y navegadores están en `site/src/lib/stats-config.json`.
- **Panel público:** `/stats/` (y `/es/stats/`, `/gl/stats/`, `/nl/stats/`), sin login ni enlace en el menú, con `noindex`. Se genera al compilar: `site/scripts/fetch-stats.mjs` lee los contadores y escribe `site/src/data/stats.json`. GitHub Actions lo vuelve a ejecutar cada 4 horas.
- Para no contar tus propias visitas: botón al final de `/stats/`.
- Limitaciones: cualquiera que conozca el espacio de nombres puede inflar las cifras, y las direcciones IP de los visitantes llegan al servicio del contador (no se guardan en la web). Si hace falta más rigor, hay que pasar a una herramienta con cuenta (Plausible, Umami).
