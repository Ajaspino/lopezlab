"""Obtiene del oEmbed público de Vimeo el ancho y alto reales de cada vídeo para que su contenedor tenga la proporción exacta."""
import json, subprocess
ids = sorted({b['id'] for p in json.load(open('site/src/data/projects.json')) for b in p['blocks'] if b['type'] == 'video'})
out = {}
for i in ids:
    r = subprocess.run(['/usr/bin/curl', '-s', '-m', '20', f'https://vimeo.com/api/oembed.json?url=https://vimeo.com/{i}'], capture_output=True, text=True).stdout
    try: d = json.loads(r); out[i] = {'w': d['width'], 'h': d['height'], 'title': d.get('title', '')}
    except Exception as e: print('FALLO', i, r[:80])
json.dump(out, open('site/src/data/vimeo.json', 'w'), indent=1, ensure_ascii=False)
for i, v in out.items(): print(i, f"{v['w']}x{v['h']}", round(v['w'] / v['h'], 3), v['title'][:36])
