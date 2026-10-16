"""Genera la imagen para compartir en redes (1200x630) con la tipografía de la web convertida a trazados.
Escribe site/og_tmp.svg; luego `node site/render_og.mjs` la convierte en site/public/og-image.png"""
import re
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
FONT = 'site/node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2'
_cache = {}
def font(w):
    if w not in _cache: _cache[w] = instantiateVariableFont(TTFont(FONT), {'wght': w})
    return _cache[w]
def text_path(txt, size, weight, x, y, tracking_em=0.0):
    f = font(weight); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm; s = size / upm
    d = ''; cx = x; hmtx = f['hmtx']
    for ch in txt:
        g = cmap.get(ord(ch))
        if g is None: continue
        pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y))); d += pen.getCommands()
        cx += gs[g].width * s + tracking_em * size
    d = re.sub(r'-?\d+\.\d+', lambda m: ('%.1f' % float(m.group())).rstrip('0').rstrip('.'), d)
    return d, cx - x
INK, PAPER = '#17181b', '#f7f7f8'
wm, _ = text_path('LOPEZLAB AMSTERDAM.', 26, 650, 72, 100, 0.12)
l1, _ = text_path('Clear stories', 112, 560, 66, 446, -0.02)
l2, _ = text_path('for complex ideas.', 112, 560, 66, 564, -0.02)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="{INK}"/><path fill="{PAPER}" d="{wm}"/><path fill="{PAPER}" d="{l1}"/><path fill="{PAPER}" d="{l2}"/></svg>'
open('site/og_tmp.svg', 'w').write(svg); print(len(svg), 'bytes')
