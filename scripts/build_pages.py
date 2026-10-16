import re, json
from bs4 import BeautifulSoup
H='_crawl/html'
def soup(f): return BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
def fname(u): return re.sub(r'/', '__', u.split('?')[0].split('/data/')[1])
def clean(t): return re.sub(r'\s+', ' ', t.replace('\xa0', ' ')).strip()
def inner(el):
    for tag in el.find_all(True):
        if tag.name not in ('strong','em','b','i','br','a','span'): tag.unwrap()
        else: tag.attrs = {k:v for k,v in tag.attrs.items() if k=='href'}
    return re.sub(r'^(\s*<br/?>)+|(<br/?>\s*)+$','',re.sub(r'\s+',' ',el.decode_contents().replace('\xa0',' ')).strip()).strip()
def post(f):
    s = soup(f); body = s.select_one('.post-txt'); md = s.find('meta', attrs={'name':'description'})
    blocks = [{'html': inner(p)} for p in body.find_all('p') if clean(p.get_text())]
    return {'title': clean(s.select_one('h1').get_text()), 'sub': clean(s.select_one('.post-sub').get_text()) if s.select_one('.post-sub') else '',
            'blocks': blocks, 'metaTitle': s.title.get_text(strip=True), 'metaDescription': md['content'] if md else ''}
# home
s = soup(f'{H}/en.html'); md = s.find('meta', attrs={'name':'description'})
def card(a):
    img = a.find('img'); return {'slug': a['href'].rstrip('/').split('/')[-1], 'label': clean(a.select_one('.post-piefoto').get_text()), 'title': clean(a.select_one('.post-tit').get_text()), 'cover': fname(img['src']), 'alt': img.get('alt','')}
home = {'metaTitle': s.title.get_text(strip=True), 'metaDescription': md['content'] if md else '',
  'hero': {'title': clean(s.select_one('#hero-tit').get_text()), 'sub': clean(s.select_one('#hero-sub').get_text()), 'image': fname(s.select_one('#hero img')['src']), 'link': s.select_one('#hero a')['href'].rstrip('/').split('/')[-1]},
  'method': {'text': clean(s.select_one('#blq1 p').get_text()), 'cta': clean(s.select_one('#blq1 span').get_text())},
  'feature': {'words': [clean(x.get_text()) for x in s.select('#blq2 h2 span')], 'sub': clean(s.select_one('#blq2 h3').get_text()), 'slug': s.select_one('#blq2 a')['href'].rstrip('/').split('/')[-1]},
  'featured': [card(a) for a in s.select('#work-destacados article a')],
  'postTeaser': {'title': clean(s.select_one('#noticias-destacadas h2').get_text()), 'sub': clean(s.select_one('#noticias-destacadas p').get_text()), 'cta': clean(s.select_one('#noticias-destacadas .post-leermas').get_text())},
  'more': [card(a) for a in s.select('#work-nodestacados article a')]}
tail = s.select_one('#blq3') or s.find(id=re.compile('blq3|who'))
home['rawTail'] = clean(s.select('main section')[-1].get_text(' '))
# about
a = soup(f'{H}/en__about.html')
about = {'metaTitle': a.title.get_text(strip=True),
  'whatWeDo': {'title': clean(a.select_one('#blq1 h1').get_text()), 'text': clean(a.select_one('#blq1 .section-destacado').get_text())},
  'whoWeAre': {'title': clean(a.select_one('#blq2 h2').get_text()), 'text': clean(a.select_one('#blq2 .section-destacado').get_text())},
  'team': [{'name': clean(m.select_one('h2').get_text()), 'role': clean(next(m.select_one('.post-txt').stripped_strings)), 'email': m.select_one('.post-email a').get_text(strip=True), 'photo': fname(m.find('img')['src']), 'alt': m.find('img').get('alt','')} for m in a.select('#team .member')]}
about['method'] = {'title': clean(a.select_one('#blq3 h2').get_text()), 'text': clean(a.select_one('#blq3 > .section-destacado').get_text()),
  'clients': [{'sector': clean(g.select_one('h3').get_text()), 'names': [clean(x.get_text()) for x in g.select('p')]} for g in a.select('#clientes .cliente')],
  'outro': clean(a.select('#blq3 > .section-destacado')[-1].get_text())}
# contact
c = soup(f'{H}/en__contact.html')
contact = {'metaTitle': c.title.get_text(strip=True), 'text': c.select_one('main').get_text('\n', strip=True)}
json.dump({'home': home, 'about': about, 'contact': contact,
           'posts': {'our-method': post(f'{H}/en_post_our-method.html'), 'clarity-is-a-strategy': post(f'{H}/en_post_clarity-is-a-strategy.html')}},
          open('site/src/data/pages.json','w'), indent=1, ensure_ascii=False)
print('ok')
