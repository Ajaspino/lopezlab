"""Añade a las traducciones (sin cambiar los ids existentes) los créditos de los proyectos y los textos nuevos del
pie de proyecto. Es idempotente. Escribe _i18n/chunk_credits.json con lo que falta por traducir.
NOTA: los ids de cadena están fijados; no vuelvas a ejecutar build_i18n_source.py (renumeraría todo)."""
import json
D = 'site/src/data/i18n'
src = json.load(open('_i18n/source.json')); paths = json.load(open(f'{D}/paths.json')); ui = json.load(open(f'{D}/ui.en.json'))
dic = {l: json.load(open(f'{D}/{l}.json')) for l in ('es', 'gl', 'nl')}
byText = {t: i for i, t in src.items()}
def add(path, text, tr=None):
    if text not in byText:
        i = 's%04d' % (max(int(k[1:]) for k in src) + 1); src[i] = text; byText[text] = i
        if tr:
            for l, v in tr.items(): dic[l][i] = v
    paths[path] = byText[text]
# textos de interfaz del pie de proyecto (los reemplazan por otros más cortos)
NEW_UI = {
    'ui.project.next':     ('Next',      {'es': 'Siguiente', 'gl': 'Seguinte', 'nl': 'Volgende'}),
    'ui.project.prev':     ('Previous',  {'es': 'Anterior',  'gl': 'Anterior', 'nl': 'Vorige'}),
    'ui.project.nextAria': ('Previous and next project', {'es': 'Proyecto anterior y siguiente', 'gl': 'Proxecto anterior e seguinte', 'nl': 'Vorig en volgend project'}),
    'ui.project.credits':  ('Credits',   {'es': 'Créditos', 'gl': 'Créditos', 'nl': 'Credits'}),
}
for key, (en, tr) in NEW_UI.items(): add(key, en, tr); ui[key] = en
projects = json.load(open('site/src/data/projects.json'))
new_ids = []
for i, p in enumerate(projects):
    if p.get('credits'):
        add(f'projects.{i}.credits', p['credits'])
# ids que ya no usa ninguna ruta (p. ej. "Next project")
used = set(paths.values())
for i in [k for k in src if k not in used]:
    del src[i]
    for l in dic: dic[l].pop(i, None)
json.dump(src, open('_i18n/source.json', 'w'), indent=0, ensure_ascii=False)
json.dump(paths, open(f'{D}/paths.json', 'w'), indent=0, ensure_ascii=False)
json.dump(ui, open(f'{D}/ui.en.json', 'w'), indent=1, ensure_ascii=False)
for l, d in dic.items(): json.dump(d, open(f'{D}/{l}.json', 'w'), ensure_ascii=False, indent=0)
chunk = {i: src[i] for i in src if all(i not in dic[l] for l in dic)}
json.dump(chunk, open('_i18n/chunk_credits.json', 'w'), indent=0, ensure_ascii=False)
print(len(src), 'cadenas;', len(chunk), 'por traducir (créditos)')
