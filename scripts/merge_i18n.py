"""Fusiona los trozos traducidos (_i18n/<lang>.chunk_N.json) en site/src/data/i18n/<lang>.json,
aplica correcciones neutras de género en cargos y valida claves y etiquetas HTML."""
import json, re, glob, sys
src = json.load(open('_i18n/source.json'))
paths = json.load(open('site/src/data/i18n/paths.json'))
tags = lambda t: [len(re.findall(p, t)) for p in (r'<strong>', r'<em>', r'<br\s*/?>', r'<a ')]
ok = True
for lang in ('es', 'gl', 'nl'):
    d = {}
    for f in sorted(glob.glob(f'_i18n/{lang}.chunk_*.json')): d.update(json.load(open(f)))
    miss = [k for k in src if k not in d]
    extra = [k for k in d if k not in src]
    empty = [k for k in d if not str(d[k]).strip()]
    bad = [k for k in d if k in src and tags(d[k]) != tags(src[k])]
    print(lang, len(d), 'cadenas | faltan', len(miss), '| sobran', len(extra), '| vacías', len(empty), '| etiquetas distintas', len(bad), bad[:5])
    ok &= not (miss or extra or empty or bad)
    # Cargos del equipo: formas neutras (el género de las personas lo decide Mariola)
    roles = {'Designer': {'es': 'Diseño', 'gl': 'Deseño', 'nl': 'Designer'}, 'Digital media designer': {'es': 'Diseño de medios digitales', 'gl': 'Deseño de medios dixitais', 'nl': 'Digital media designer'}}
    for en, tr in roles.items():
        i = next((k for k, v in src.items() if v == en), None)
        if i: d[i] = tr[lang]
    json.dump(d, open(f'site/src/data/i18n/{lang}.json', 'w'), ensure_ascii=False, indent=0)
print('OK' if ok else 'REVISAR')
sys.exit(0 if ok else 1)
