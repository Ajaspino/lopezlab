import subprocess, json
nxt = 10; html = ''
for _ in range(10):
    r = subprocess.run(['/usr/bin/curl','-s','-m','30','-X','POST','https://www.lopezlab.com/blog/postsFront/ajaxCargarMas','-H','X-Requested-With: XMLHttpRequest','-d',f'codigoIdioma=en&idPostTipoPager=2&idPostTipoCategoriaPager=-1&idPostSiguientePager={nxt}&pagItemsPager=10&tipoListadoPager=busqueda&busquedaPager='],capture_output=True,text=True).stdout
    d = json.loads(r)['data']; html += d['html']; nxt = d['idPostSiguiente']
    if nxt < 0: break
open('_crawl/work_cards_more.html','w').write(html)
print(html.count('<article'), 'tarjetas extra')
