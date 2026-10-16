# Auditoría lopezlab.com (16/10/2026)

## Qué es
Estudio de comunicación estratégica y diseño en Ámsterdam, liderado por Mariola López Mariño. Equipo: Claudia Lasarte, André Grobbée. Contacto: hello@lopezlab.com, +31 6 4420 5667, LinkedIn, Instagram.

## Estructura actual
- Idiomas: `/en`, `/es`, `/gl`, `/nl` (selector con `javascript:dropdownMenu(...)`)
- Home: hero "Pitching & Strategic Communication" → "Explore our method" → proyectos destacados (Regenerative Farming Framed, Politie Amsterdam, Cancer Centre Amsterdam, a.s.r., Naar een ontspannen Nederland, College van Rijksadviseurs) → post "Clarity is a strategy" → Uxua, Kloosterplaats Farm, Alizent, CC Amstel → "The work of listening" → "Who we work with"
- `/work`: rejilla con "load more", categorías (Brand identity, visual strategy…)
- `/about`: What we do, Who we are, equipo, Our method, clientes por sector (Green & Sustainability, Health & Care, Brands & Corporate, Culture & Society, Public Institutions & Policy)
- `/contact`, `/project/<slug>`, `/post/<slug>`

## Identidad visual
- Tipografías: Roboto Condensed (títulos, mayúsculas, bold), MarcinTpwr (monoespaciada tipo máquina de escribir, subtítulos), Roboto
- Banda naranja-rojo bajo el header, mucho blanco/gris, fotografía grande en B/N y a color
- Tono: sobrio, editorial, directo ("Clear stories for complex ideas")

## Problemas detectados
**Técnicos**
- CMS propio de 2021 (jQuery, jQuery Validate, SDK de Facebook cargado en todas las páginas)
- Imágenes con carga diferida que dejan grandes huecos en blanco al hacer scroll rápido
- Selector de idioma con `javascript:` en el href (no accesible, no indexable)
- Home de ~5.500 px de alto en desktop

**Mobile**
- El hero se ve casi blanco/desvanecido durante la carga (animación de entrada tapa el contenido)
- "COMMUNICATION" se sale del ancho en 375 px (h1 de 48 px, sin ajuste)
- Títulos de proyecto en la home se desbordan por el borde derecho ("REGENERATIVE")
- Texto en monoespaciada con mucho tracking: se lee pesado en párrafos de 3–4 líneas
- Un solo proyecto por pantalla, poca jerarquía entre destacado y secundarios

**Contenido / UX**
- Clientes en `/about` con duplicados y restos ("name of client", "asr" y "a.s.r.", "esero" dos veces)
- Etiquetas incoherentes en `/work` ("AMSTERDAM, AMSTERDAM" como tipo de proyecto)
- Typos: "ACCESIBLE" en el título de Cancer Centre Amsterdam
- Tres proyectos en la home enlazan al mismo destino (Kloosterplaats / Regenerative Farming) y el primero del hero enlaza a "this-is-not-flamenco"
- Propuesta de valor repartida entre hero, método y "Clarity is a strategy" sin un CTA claro de contacto

## Qué conservar
- La voz y el posicionamiento (claridad, estructura, narrativa)
- El portfolio: es fuerte (Politie Amsterdam, a.s.r., CC Amstel, Uxua)
- Cuatro idiomas (EN/ES/GL/NL)
- La lógica de método: entender → estructurar → dar forma

## Revisión de contenido (ronda 2)
Crawl completo guardado en `_crawl/` (HTML original en `html/`, texto literal por página en `text/*.txt`, inventario de imágenes en `text/_images.json`). Script: `scripts/extract.py`.

- **53 URLs en el sitemap** (todas /en): home, about, contact, work, 16 filtros de work (sectores y capacidades) y **36 proyectos**. Además hay 2 posts (`our-method`, `clarity-is-a-strategy`) que no están en el sitemap.
- **Solo el inglés es contenido real.** En /es, /gl y /nl, About contiene Lorem ipsum y textos a medio traducir ("We are a small team of 6, with some unique superpowers", "Name comes here"); los proyectos se sirven en inglés en los 4 idiomas, y `/nl/project/...` devuelve el listado de Work. Hay que decidir si la web nueva es solo EN o multilingüe con traducciones reales.
- **~9.300 palabras** en los textos de proyectos, a conservar tal cual (extraídos sin tocar).
- **345 imágenes únicas, ~180 MB** en total; la mayor pesa 12,6 MB y hay GIFs de ~6 MB. Anchos típicos de 2368 px. Vídeos en Vimeo (embeds de fondo, silenciados).
- Meta description de la home: "Lopezlab is a brand consultancy and design company located in Amsterdam." — no coincide con el posicionamiento actual ("Pitching & strategic communication").
