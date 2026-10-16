"""Incorpora _i18n/<lang>.chunk_credits.json a site/src/data/i18n/<lang>.json (sin tocar el resto) y valida enlaces y separadores."""
import json, re, sys
D = 'site/src/data/i18n'
src = json.load(open('_i18n/chunk_credits.json'))
hrefs = lambda t: sorted(re.findall(r'href="([^"]+)"', t))
ok = True
for lang in ('es', 'gl', 'nl'):
    tr = json.load(open(f'_i18n/{lang}.chunk_credits.json'))
    miss = [k for k in src if k not in tr]; extra = [k for k in tr if k not in src]
    bad = [k for k in src if k in tr and (hrefs(src[k]) != hrefs(tr[k]) or src[k].count(' / ') != tr[k].count(' / ') or src[k].count('<a ') != tr[k].count('<a ') or not tr[k].strip())]
    print(lang, len(tr), 'cadenas | faltan', len(miss), '| sobran', len(extra), '| con enlaces/separadores distintos', len(bad), bad[:3])
    ok &= not (miss or extra or bad)
    if not (miss or extra or bad):
        d = json.load(open(f'{D}/{lang}.json')); d.update(tr)
        json.dump(d, open(f'{D}/{lang}.json', 'w'), ensure_ascii=False, indent=0)
print('OK' if ok else 'REVISAR'); sys.exit(0 if ok else 1)
