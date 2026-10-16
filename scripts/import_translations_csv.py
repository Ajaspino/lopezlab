"""Importa TRADUCCIONES/traducciones.csv (editado por Mariola) a site/src/data/i18n/{es,gl,nl}.json.
Uso: python3 -I scripts/import_translations_csv.py
Mantén las etiquetas HTML (<strong>, <br/>, <a href=...>) de cada celda; el script avisa si cambian."""
import csv, json, re
src = json.load(open('_i18n/source.json'))
tags = lambda t: [len(re.findall(p, t)) for p in (r'<strong>', r'<em>', r'<br\s*/?>', r'<a ')]
out = {'es': {}, 'gl': {}, 'nl': {}}
with open('TRADUCCIONES/traducciones.csv', encoding='utf-8-sig', newline='') as f:
    for row in csv.DictReader(f):
        i = row['id']
        for lang, col in (('es', 'Español'), ('gl', 'Galego'), ('nl', 'Nederlands')):
            t = row[col].strip()
            if not t: continue
            if tags(t) != tags(src[i]): print(f'AVISO {lang} {i}: las etiquetas HTML no coinciden con el original')
            out[lang][i] = t
for lang, d in out.items():
    json.dump(d, open(f'site/src/data/i18n/{lang}.json', 'w'), ensure_ascii=False, indent=0)
    print(lang, len(d), 'cadenas')
