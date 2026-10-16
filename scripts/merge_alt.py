"""Une _alt/out_*.json en site/src/data/alt.json (archivo de imagen -> alt en 4 idiomas), valida cobertura y longitudes
y genera TRADUCCIONES/alt-textos.csv para que Mariola pueda revisarlos."""
import json, glob, csv, sys
sheets = json.load(open('_alt/sheets.json'))
expected = {im['file']: s for s in sheets for im in s['images']}
alt = {}
for f in sorted(glob.glob('_alt/out_*.json')): alt.update(json.load(open(f)))
miss = [k for k in expected if k not in alt]; extra = [k for k in alt if k not in expected]
bad = [k for k, v in alt.items() if any(not str(v.get(l, '')).strip() or len(v[l]) > 160 for l in ('en', 'es', 'gl', 'nl'))]
print(len(alt), 'alt |', 'faltan', len(miss), '| sobran', len(extra), '| vacíos o >160:', len(bad))
if miss or extra or bad: print(miss[:3], extra[:3], bad[:3]); sys.exit(1)
json.dump(alt, open('site/src/data/alt.json', 'w'), ensure_ascii=False, indent=0)
with open('TRADUCCIONES/alt-textos.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['archivo', 'proyecto', 'English', 'Español', 'Galego', 'Nederlands'])
    for k, v in alt.items(): w.writerow([k, expected[k]['slug'], v['en'], v['es'], v['gl'], v['nl']])
print('OK')
