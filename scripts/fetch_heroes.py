# Descarga la versión original (más grande) de cada portada del listado para usarla como cabecera del proyecto.
import json, os, subprocess
from PIL import Image
P = json.load(open('site/src/data/projects.json'))
out = {}
for p in P:
    c = p['cover']
    if not c or '___mini__work_listado__' not in c: continue
    path = c.replace('___mini__work_listado__', '__').replace('__', '/').replace('/images/', '/images/', 1)
    # blog__160__images___mini__work_listado__679__politie-2.jpg -> blog/160/images/679/politie-2.jpg
    url = 'https://www.lopezlab.com/data/' + path
    name = f"hero__{p['slug']}.jpg"
    dst = f'_crawl/images/{name}'
    if not os.path.exists(dst):
        r = subprocess.run(['/usr/bin/curl', '-sL', '-m', '60', '--fail', '-o', dst, url]).returncode
        if r: print('FALLO', url); continue
    try:
        w, h = Image.open(dst).size
    except Exception as e:
        print('NO IMAGEN', url); os.remove(dst); continue
    cw, ch = Image.open('_crawl/images/' + c).size
    if w > cw:
        subprocess.run(['cp', dst, 'site/src/assets/work/' + name]); out[p['slug']] = name
    print(p['slug'][:30].ljust(30), (cw, ch), '->', (w, h))
json.dump(out, open('site/src/data/heroes.json', 'w'), indent=1)
print(len(out), 'cabeceras en alta')
