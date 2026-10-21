# Reel de Instagram: "Nueva web"

Vídeo vertical (1080×1920, 30 fps, 29,6 s, sin música) que anuncia la web nueva de Lopezlab. Todo sale del proyecto:
tipografía y colores de `site/src/styles/global.css`, logo de `site/public/favicon.svg`, textos y grabaciones de la propia web.

**Resultado:** `lopezlab-reel-nueva-web.mp4`

## Cómo se hizo
1. `scripts/record.mjs` graba la web en local con un iPhone emulado (390×844, escala 3, táctil, UA de iPhone). Cada fotograma se
   captura a 1170×2532 con el reloj de la página controlado, así el scroll, el menú y las pulsaciones salen fluidos y nítidos.
   Los clips quedan en `public/clips/` (portada, Work, proyecto, menú/idiomas/clientes) con las pulsaciones anotadas en `manifest.json`.
2. `src/` es el montaje en Remotion: gancho, cuatro escenas con el iPhone dibujado con código (perspectiva y movimiento), cierre.

## Cambiar algo
- **Textos:** `src/texts.ts`. **Duración y velocidad de cada escena:** `src/timeline.ts`. **Colores y tipografía:** `src/theme.ts`.
- Vista previa: `npm run studio`. Con las franjas rojas de las zonas seguras de Instagram, la composición `Reel-safe`.
- Exportar de nuevo: `npm run render` (genera `lopezlab-reel-nueva-web.mp4`).

## Volver a grabar la web
```bash
cd ../site && npm run build && npx astro preview --port 4330   # en otra terminal
cd ../reel && npm run record                                    # o: node scripts/record.mjs home work
```
Hace falta Google Chrome instalado y `ffmpeg` (Homebrew).
