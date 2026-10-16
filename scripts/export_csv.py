"""Regenera TRADUCCIONES/traducciones.csv desde los diccionarios actuales (EN | ES | GL | NL)."""
import json, csv, re
src = json.load(open('_i18n/source.json')); paths = json.load(open('site/src/data/i18n/paths.json'))
D = {l: json.load(open(f'site/src/data/i18n/{l}.json')) for l in ('es', 'gl', 'nl')}
projects = json.load(open('site/src/data/projects.json')); where = {}
for path, i in paths.items():
    if i in where: continue
    m = re.match(r'projects\.(\d+)\.(.*)', path)
    where[i] = (f"Proyecto: {projects[int(m.group(1))]['slug']} ({m.group(2)})" if m else path.replace('pages.', 'Página: ').replace('ui.', 'Interfaz: '))
with open('TRADUCCIONES/traducciones.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['id', 'dónde aparece', 'English (original)', 'Español', 'Galego', 'Nederlands'])
    for i, t in src.items(): w.writerow([i, where.get(i, ''), t, D['es'].get(i, ''), D['gl'].get(i, ''), D['nl'].get(i, '')])
print(len(src), 'filas')
