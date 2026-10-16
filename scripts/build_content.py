import re, os, json, glob, collections
from bs4 import BeautifulSoup
H='_crawl/html'; OUT='site/src/data'; os.makedirs(OUT, exist_ok=True)
def soup(f): return BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
def fname(u): return re.sub(r'/', '__', u.split('?')[0].split('/data/')[1]) if '/data/' in u else None
def num(v):
    m = re.fullmatch(r'\d+', str(v or '').strip())
    return int(m.group()) if m else None
def clean(t): return re.sub(r'\s+', ' ', t.replace('\xa0', ' ')).strip()
def inner(el):
    for tag in el.find_all(True):
        if tag.name not in ('strong','em','b','i','br','a','span'): tag.unwrap()
        else:
            keep = {'href'} if tag.name=='a' else set()
            tag.attrs = {k:v for k,v in tag.attrs.items() if k in keep}
    return re.sub(r'(<br/?>\s*)+$|^(\s*<br/?>)+', '', el.decode_contents().replace('\xa0',' ').strip())
# tarjetas del listado
cards = {}
for f, ex in ((f'{H}/en__work.html', None), ('_crawl/work_cards_more.html', 1)):
    s = soup(f)
    for a in s.select('article.post a'):
        slug = a['href'].rstrip('/').split('/')[-1]
        img = a.find('img'); l = a.select_one('.post-piefoto'); t = a.select_one('.post-tit')
        cards[slug] = {'slug': slug, 'label': clean(l.get_text()) if l else '', 'title': clean(t.get_text()) if t else a.get('title',''),
                       'cover': fname(img['src']) if img else None, 'coverAlt': img.get('alt','') if img else ''}
projects = []; tags = collections.Counter()
for f in sorted(glob.glob(f'{H}/en__project__*.html')):
    slug = os.path.basename(f)[:-5].split('__')[-1]
    s = soup(f); body = s.select_one('.post-txt'); h1 = s.select_one('h1.post-tit')
    cats = [{'name': clean(a.get_text()), 'slug': a['href'].rstrip('/').split('/')[-1]} for a in s.select('.post-cat a')]
    sub = s.select_one('.post-sub')
    blocks = []
    for el in body.find_all(True, recursive=False):
        tags[el.name] += 1
        if el.name == 'p':
            media = el.find_all(['img','iframe'])
            if media:
                for m in el.find_all('iframe'): m.string = ''
                for m in media:
                    if m.name == 'img': blocks.append({'type':'image','file':fname(m['src']),'w':num(m.get('width')),'h':num(m.get('height')),'alt':m.get('alt','')})
                    else:
                        vid = re.search(r'video/(\d+)', m.get('src',''))
                        if vid: blocks.append({'type':'video','id':vid.group(1),'title':m.get('title','')})
                for m in media: m.extract()
            if clean(el.get_text()): blocks.append({'type':'p','html':inner(el)})
        elif el.name in ('h2','h3','h4'):
            blocks.append({'type':'h','html':inner(el)})
        elif el.name in ('ul','ol'):
            blocks.append({'type':el.name,'items':[inner(li) for li in el.find_all('li')]})
        elif el.name in ('div','iframe','figure','video','blockquote'):
            for v in el.find_all(['iframe','video']):
                vid = re.search(r'video/(\d+)', v.get('src') or '')
                if vid: blocks.append({'type':'video','id':vid.group(1),'title':v.get('title','')})
            for i in el.find_all('img'): blocks.append({'type':'image','file':fname(i['src']),'w':num(i.get('width')),'h':num(i.get('height')),'alt':i.get('alt','')})
            if el.name=='blockquote' and clean(el.get_text()): blocks.append({'type':'quote','html':inner(el)})
    # Créditos: bloque final "Credits:" (post-bottom). Se conserva el texto tal cual, con sus enlaces.
    credits = ''
    pb = s.select_one('.post-bottom')
    if pb:
        tit = next((t for t in pb.select('span.bot-tit') if clean(t.get_text()).lower().startswith('credits')), None)
        body = tit.find_next_sibling('span') if tit else None
        if body:
            ps = body.find_all('p')
            parts = [inner(x) for x in ps] if ps else [inner(body)]
            credits = '<br/>'.join(x for x in parts if x and clean(re.sub(r'<[^>]+>', ' ', x)))
    if credits.lower().strip(' .') in ('yet to know', 'tbc', 'tba'): credits = ''   # marcador de plantilla sin rellenar en el original
    c = cards.get(slug, {})
    cover = c.get('cover') or next((b['file'] for b in blocks if b['type']=='image' and not b['file'].endswith('.gif')), None)  # sin portada en el listado: primera imagen del cuerpo
    projects.append({'slug':slug,'title':clean(h1.get_text()),'label':c.get('label',''),'cover':cover,'categories':cats,'lead':clean(sub.get_text()) if sub else '','credits':credits,'blocks':blocks,'listed':slug in cards,'metaTitle':s.title.get_text(strip=True)})
print('tags', dict(tags)); print(len(projects),'proyectos', sum(p['listed'] for p in projects),'en listado')
order = list(cards)   # orden del listado
projects.sort(key=lambda p: order.index(p['slug']) if p['slug'] in order else 999)
json.dump(projects, open(f'{OUT}/projects.json','w'), indent=1, ensure_ascii=False)
