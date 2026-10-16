import sys, os, re, json, glob
from bs4 import BeautifulSoup
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
inv = {}
for f in sorted(glob.glob(src + '/*.html')):
    name = os.path.basename(f)[:-5]
    s = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
    title = s.title.get_text(strip=True) if s.title else ''
    md = s.find('meta', attrs={'name': 'description'})
    main = s.find('main')
    imgs = []
    if main:
        for i in main.find_all('img'):
            imgs.append({'src': i.get('src') or i.get('data-src'), 'alt': i.get('alt', ''), 'w': i.get('width'), 'h': i.get('height')})
        for t in main.find_all(style=True):
            for u in re.findall(r'url\(["\']?([^)"\']+)', t['style']):
                imgs.append({'src': u, 'alt': 'bg', 'w': None, 'h': None})
        for t in main.find_all(attrs={'data-src': True}):
            if t.name != 'img': imgs.append({'src': t['data-src'], 'alt': 'data-src', 'w': None, 'h': None})
        for v in main.find_all(['video', 'source', 'iframe']):
            imgs.append({'src': v.get('src'), 'alt': v.name, 'w': None, 'h': None})
    text = main.get_text('\n', strip=True) if main else ''
    open(f'{out}/{name}.txt', 'w').write(f'TITLE: {title}\nDESC: {md["content"] if md else ""}\n\n{text}\n')
    inv[name] = imgs
json.dump(inv, open(f'{out}/_images.json', 'w'), indent=1)
print(len(inv), 'páginas;', sum(len(v) for v in inv.values()), 'imágenes (con repetidas)')
