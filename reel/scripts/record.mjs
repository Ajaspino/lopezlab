// Graba recorridos MÓVILES de la web en local con un iPhone emulado (390×844, escala 3, táctil, UA de iPhone).
// Cada fotograma se captura a 1170×2532 con el reloj de la página controlado (tiempo virtual): scroll, menú y
// pulsaciones salen fluidos, sin saltos ni esperas muertas, y el resultado es nítido.
// Uso: node scripts/record.mjs [home|work|project|about ...]   (sin argumentos graba todos)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
const log = (...a) => process.env.LOG && appendFileSync('/tmp/rec.log', a.join(' ') + '\n');
import { once } from 'node:events';

const BASE = process.env.SITE || 'http://localhost:4330';
const W = 390, H = 844, DSF = 3, FPS = 30, DT = 1000 / FPS;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';
mkdirSync('public/clips', { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Pulsación visible (círculo) y limpieza de cualquier cosa que ensucie la grabación (se inyecta al grabar; no toca el código de la web)
const INIT = () => {
  // Mantiene el reloj virtual en marcha aunque la página esté quieta (si no, un paso de tiempo nunca termina)
  setInterval(() => {}, 4);
  // y un punto de 1 px casi invisible que cambia en cada fotograma, para que Chrome genere uno nuevo aunque la página esté quieta
  let k = 0, dot;
  const tick = () => {
    if (!dot && document.documentElement) { dot = document.createElement('div'); dot.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;background:#808080;z-index:2147483646;pointer-events:none'; document.documentElement.appendChild(dot); }
    if (dot) dot.style.opacity = (k++ % 2 ? 0.012 : 0.02);
    requestAnimationFrame(tick);
  };
  tick();
  const add = () => {
    const st = document.createElement('style');
    st.textContent = 'astro-dev-toolbar,#cookie-banner,[id*="cookie" i],[class*="cookie" i],[class*="consent" i],[class*="popup" i]{display:none!important} html{scrollbar-width:none} ::-webkit-scrollbar{display:none}';
    document.documentElement.appendChild(st);
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', add) : add();
  addEventListener('touchstart', (ev) => {
    const t = ev.touches[0]; const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${t.clientX - 28}px;top:${t.clientY - 28}px;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.6);border:2px solid rgba(20,20,22,.6);z-index:2147483647;pointer-events:none`;
    document.documentElement.appendChild(d);
    d.animate([{ transform: 'scale(.35)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' }).onfinish = () => d.remove();
  }, { capture: true, passive: true });
};

class Clip {
  constructor(name, page, cdp) {
    this.name = name; this.page = page; this.cdp = cdp; this.n = 0; this.events = [];
    this.out = `public/clips/${name}.mp4`;
    this.ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-movflags', '+faststart', '-an', this.out], { stdio: ['pipe', 'inherit', 'inherit'] });
  }
  // Evaluar JS y tocar la pantalla directamente por CDP (los métodos de Playwright esperan fotogramas que con el reloj congelado nunca llegan)
  async ev(fn, arg) {
    const r = await this.cdp.send('Runtime.evaluate', { expression: `(${fn.toString()})(${JSON.stringify(arg ?? null)})`, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async touch(x, y) {
    await this.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await this.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  // Reloj de la página: congelado, y avanza solo cuando se pide un fotograma
  async freeze() { await this.cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' }); }
  async live() { await this.cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance' }); }
  async advance(ms) {
    const done = new Promise((r) => this.cdp.once('Emulation.virtualTimeBudgetExpired', r));
    await this.cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms });
    await done;
  }
  async frame() {
    log('frame', this.n);
    await this.advance(DT); log('  advanced');
    // El recorte va en coordenadas de documento: hay que pedir justo la parte que se ve (scrollY actual)
    const top = await this.ev(() => scrollY);
    const r = await this.cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, fromSurface: true, clip: { x: 0, y: top, width: W, height: H, scale: DSF } });
    log('  captured', r.data.length);
    if (!this.ff.stdin.write(Buffer.from(r.data, 'base64'))) { log('  waiting drain'); await once(this.ff.stdin, 'drain'); }
    log('  written');
    this.n++;
  }
  async hold(sec) { for (let i = 0, n = Math.round(sec * FPS); i < n; i++) await this.frame(); }
  // Desplazamiento con easing; "to" es un número (px) o un selector (su borde superior queda bajo la cabecera)
  async glide(to, sec) {
    log('glide', to, sec);
    const target = await this.ev((to) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = typeof to === 'number' ? to : document.querySelector(to).getBoundingClientRect().top + scrollY - 70;
      return Math.max(0, Math.min(max, y));
    }, to);
    const from = await this.ev(() => scrollY);
    const n = Math.max(1, Math.round(sec * FPS));
    for (let i = 1; i <= n; i++) {
      if (i % 10 === 0) log('  frame', i, '/', n);
      const y = from + (target - from) * easeInOut(i / n);
      await this.ev((y) => scrollTo(0, y), y);
      await this.frame();
    }
  }
  async by(px, sec) { await this.glide((await this.ev(() => scrollY)) + px, sec); }
  // Pulsación táctil en el centro de un elemento (si no está a la vista, se desplaza antes)
  async tap(sel, rippleSec = 0.4) {
    let r = await this.ev((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, h: innerHeight }; }, sel);
    if (r.y < 90 || r.y > r.h - 90) { await this.glide(sel, 0.6); r = await this.ev((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); }
    this.events.push({ t: Number((this.n / FPS).toFixed(2)), x: Math.round(r.x), y: Math.round(r.y), sel });
    await this.touch(r.x, r.y);
    await this.hold(rippleSec);
  }
  // Cambio de página: el reloj corre libre mientras carga y se vuelve a congelar con todo cargado (corte limpio en el montaje)
  async navigate(waitForUrl) {
    await this.live();
    if (waitForUrl) await this.page.waitForURL(waitForUrl);
    await prepare(this.page);
    await this.freeze();
  }
  async finish() {
    this.ff.stdin.end();
    await once(this.ff, 'close');
    return { file: `clips/${this.name}.mp4`, duration: Number((this.n / FPS).toFixed(2)), frames: this.n, taps: this.events };
  }
}

// Todo cargado antes de congelar: fuentes e imágenes (las diferidas se fuerzan a "eager" solo durante la grabación)
async function prepare(page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; })))), new Promise((r) => setTimeout(r, 8000))]);
    scrollTo(0, 0);
  });
  await sleep(400);
}

const clips = {
  // 1) Portada: titular, imagen, frase del método, bloque destacado y rejilla
  async home(c) {
    await c.page.goto(BASE + '/'); await prepare(c.page); await c.freeze();
    await c.hold(0.9);
    await c.glide('.method', 1.6); await c.hold(0.5);
    await c.glide('.spotlight', 1.5); await c.hold(0.7);
    await c.glide('.feed', 1.6); await c.hold(0.3);
    await c.by(560, 1.3); await c.hold(0.3);
  },
  // 2) Work: rejilla y filtro por categoría
  async work(c) {
    await c.page.goto(BASE + '/work/'); await prepare(c.page); await c.freeze();
    await c.hold(0.8);
    await c.glide(820, 1.6); await c.hold(0.3);
    await c.glide(0, 1.0); await c.hold(0.3);
    await c.tap('.filters a[href*="brands"]');
    await c.navigate(/brands/); await c.hold(0.6);
    await c.glide(760, 1.5); await c.hold(0.3);
  },
  // 3) Proyecto: de la rejilla a una página interior y su secuencia editorial
  async project(c) {
    await c.page.goto(BASE + '/work/'); await prepare(c.page); await c.freeze();
    await c.hold(0.4);
    await c.glide('a.card[href*="cc-amstel-corporate-identity"]', 1.5); await c.hold(0.3);
    await c.tap('a.card[href*="cc-amstel-corporate-identity"]');
    await c.navigate(/cc-amstel/); await c.hold(0.8);
    await c.glide(640, 1.5); await c.hold(0.4);
    await c.glide(1700, 1.8); await c.hold(0.4);
    await c.glide(3000, 1.8); await c.hold(0.3);
  },
  // 4) Menú, idiomas y clientes
  async about(c) {
    await c.page.goto(BASE + '/about/'); await prepare(c.page); await c.freeze();
    await c.hold(0.7);
    await c.tap('#menu-toggle', 0.4); await c.hold(1.1);
    await c.tap('.menu-lang a[hreflang="es"]', 0.35);
    await c.navigate(/\/es\/about/); await c.hold(0.7);
    await c.glide('#clients', 1.9); await c.hold(0.3);
    await c.by(700, 1.6); await c.hold(0.3);
  },
};

const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const manifest = existsSync('public/clips/manifest.json') ? JSON.parse(readFileSync('public/clips/manifest.json', 'utf8')) : {};
for (const name of Object.keys(clips)) {
  if (only.length && !only.includes(name)) continue;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF, isMobile: true, hasTouch: true, userAgent: UA, locale: 'en-GB', colorScheme: 'light', reducedMotion: 'no-preference' });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const clip = new Clip(name, page, cdp);
  const t0 = Date.now();
  await clips[name](clip);
  manifest[name] = await clip.finish();
  console.log(name, 'listo', manifest[name], `${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await ctx.close();
}
await browser.close();
writeFileSync('public/clips/manifest.json', JSON.stringify(manifest, null, 1));
