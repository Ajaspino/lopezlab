"""Extrae todas las cadenas traducibles de projects.json y pages.json (+ textos de interfaz).
Genera, deduplicando por texto:
  site/src/data/i18n/paths.json  ruta -> id de cadena
  _i18n/source.json              id -> texto en inglés
  _i18n/chunk_<n>.json           trozos para traducir
"""
import json, re
D = 'site/src/data'
projects = json.load(open(f'{D}/projects.json'))
pages = json.load(open(f'{D}/pages.json'))

UI = {
 'ui.skip': 'Skip to content', 'ui.nav.main': 'Main',
 'ui.nav.work': 'Work', 'ui.nav.about': 'About', 'ui.nav.contact': 'Contact',
 'ui.footer.mail': 'Mail', 'ui.footer.visit': 'Visit', 'ui.footer.call': 'Call', 'ui.footer.follow': 'Follow', 'ui.footer.language': 'Language',
 'ui.work.title': 'Work', 'ui.work.description': 'Selected work by Lopezlab.', 'ui.work.all': 'All', 'ui.work.filter': 'Filter by category', 'ui.work.selected': 'Selected work',
 'ui.project.next': 'Next project', 'ui.project.nextAria': 'Next project',
 'ui.home.who': 'WHO WE WORK WITH',
 'ui.contact.intro': 'Ready to get started? We are here for you. Say hi!',
 'ui.contact.mail': 'Mail', 'ui.contact.visit': 'Visit', 'ui.contact.call': 'Call',
 'ui.contact.titleTag': 'Contact',
 'ui.about.title': 'About',
}
# Textos de interfaz añadidos después: se registran al final para no desplazar los ids ya traducidos
UI_LATE = {'ui.home.title': 'Pitching & Strategic Communication', 'ui.menu.open': 'Open menu', 'ui.menu.close': 'Close menu'}
TEXT_KEYS = {'title','label','lead','sub','html','role','cta','text','sector','outro','metaDescription'}
paths = {}; texts = {}; byText = {}
def add(path, text):
    text = text.strip()
    if not text: return
    if text not in byText:
        i = 's%04d' % len(byText); byText[text] = i; texts[i] = text
    paths[path] = byText[text]
for k, v in UI.items(): add(k, v)
def walk(o, path, parent_key=None, in_video=False):
    if isinstance(o, dict):
        vid = o.get('type') == 'video'
        for k, v in o.items():
            if isinstance(v, str):
                if k in TEXT_KEYS and not vid and k != 'slug': add(f'{path}.{k}', v)
                elif k == 'name' and 'categories' in path: add(f'{path}.{k}', v)
            elif isinstance(v, list):
                if k == 'items' and all(isinstance(x, str) for x in v):
                    for j, x in enumerate(v): add(f'{path}.{k}.{j}', x)
                elif k in ('words', 'names', 'metaTitle'): continue
                else: walk(v, f'{path}.{k}')
            elif isinstance(v, dict): walk(v, f'{path}.{k}')
    elif isinstance(o, list):
        for j, x in enumerate(o): walk(x, f'{path}.{j}')
walk(pages, 'pages')
walk(projects, 'projects')
for k, v in UI_LATE.items(): add(k, v)
UI.update(UI_LATE)
json.dump(paths, open(f'{D}/i18n/paths.json', 'w'), indent=0, ensure_ascii=False)
json.dump(UI, open(f'{D}/i18n/ui.en.json', 'w'), indent=1, ensure_ascii=False)
json.dump(texts, open('_i18n/source.json', 'w'), indent=0, ensure_ascii=False)
# trozos de ~equal tamaño por nº de palabras
words = lambda t: len(t.split())
total = sum(words(t) for t in texts.values()); n = 2; per = total / n
chunks = [{}]; acc = 0
for i, t in texts.items():
    if acc > per * len(chunks) and len(chunks) < n: chunks.append({})
    chunks[-1][i] = t; acc += words(t)
for c, ch in enumerate(chunks, 1):
    json.dump(ch, open(f'_i18n/chunk_{c}.json', 'w'), indent=0, ensure_ascii=False)
print(len(paths), 'rutas;', len(texts), 'cadenas únicas;', total, 'palabras;', [len(c) for c in chunks], 'cadenas por trozo;', [sum(words(t) for t in c.values()) for c in chunks], 'palabras por trozo')
