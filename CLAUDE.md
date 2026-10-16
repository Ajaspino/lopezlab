# Lopezlab: rehacer lopezlab.com

Web nueva en Astro (`site/`), solo inglés, mobile-first. Sustituye a lopezlab.com.

## Reglas del proyecto
- **Textos literales**: el copy sale de `_crawl/text` y `site/src/data/*.json` (generados por `scripts/build_content.py` y `scripts/build_pages.py`). No reescribir. La guía `lopezlab-style-guide.md` dice no copiar textos; aquí manda la petición del usuario: es su propia web y los textos se mantienen tal cual.
- **Imágenes**: originales en `_crawl/images` (se copian a `site/src/assets/work`). Se optimizan y recortan de nuevo con `astro:assets`; no editar los originales.
- Dirección visual: ver `PRODUCT.md` y `/Users/chenchulopez/Downloads/lopezlab-style-guide.md` (interfaz casi monocroma, sans serif, imágenes protagonistas, acento por proyecto).
- Verificar siempre a 390, 768, 1024 y 1440 px; sin overflow horizontal.
- Sin dependencias innecesarias; sin gradientes, glassmorphism ni sombras decorativas.

## Decisiones tomadas
- Contacto sin formulario: correo grande, dirección y teléfono. Sin backend.

## Pendiente de decidir con el usuario
- Typo "Accesible" en el título de Cancer Centre Amsterdam y duplicados en la lista de clientes de About (se mantienen tal cual salvo el marcador "Name of client", que se omite).
