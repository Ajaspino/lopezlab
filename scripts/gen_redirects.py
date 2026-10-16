"""Genera las redirecciones de las URLs de la web antigua (lopezlab.com) a la nueva.
Antes: /en/... (inglés con prefijo), /es|gl|nl/... ; ahora el inglés vive en la raíz.
Salidas: site/redirects.json (respaldo HTML con Astro) y site/public/_redirects (301 reales en Netlify / Cloudflare Pages)."""
import json, re
P = json.load(open('site/src/data/projects.json'))
ours = {p['slug'] for p in P}
cats = {c['slug'] for p in P for c in p['categories']}
old = [u.replace('https://www.lopezlab.com', '') for u in open('_crawl/urls.txt').read().split()]
old += ['/en/post/our-method/', '/en/post/clarity-is-a-strategy/']
R = {}
def dest(path):
    m = re.match(r'^/(en|es|gl|nl)(/.*)?$', path); lang, rest = m.group(1), m.group(2) or '/'
    pre = '' if lang == 'en' else f'/{lang}'
    c = re.match(r'^/work/([^/]+)/$', rest)
    if c and c.group(1) not in cats: return f'{pre}/work/'     # filtros que ya no existen
    return f'{pre}{rest}'
for u in old:
    R[u] = dest(u)
    # los filtros antiguos sin equivalente también existían en los otros idiomas
    c = re.match(r'^/en/work/([^/]+)/$', u)
    if c and c.group(1) not in cats:
        for l in ('es', 'gl', 'nl'): R[f'/{l}/work/{c.group(1)}/'] = f'/{l}/work/'
R = {k: v for k, v in R.items() if k != v and k.startswith('/en') or k.startswith(('/es/work', '/gl/work', '/nl/work'))}
R['/en/'] = '/'
json.dump(R, open('site/redirects.json', 'w'), indent=0, ensure_ascii=False)
lines = ['# Redirecciones desde la web antigua (301). Formato Netlify / Cloudflare Pages.']
for k, v in sorted(R.items()):
    lines.append(f'{k} {v} 301'); lines.append(f'{k.rstrip("/")} {v} 301')
lines += ['/en /  301', '/en/* /:splat 301']
open('site/public/_redirects', 'w').write('\n'.join(lines) + '\n')
print(len(R), 'redirecciones;', sum(1 for v in R.values() if v.endswith('/work/')), 'a /work/ por filtro inexistente')
