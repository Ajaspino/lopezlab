// Lee los contadores públicos de visitas (abacus) y los guarda en src/data/stats.json para la página /stats/.
// Se ejecuta en GitHub Actions antes de compilar. Si algo falla, no toca el archivo y la compilación sigue.
import { readFileSync, writeFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync(new URL('../src/lib/stats-config.json', import.meta.url), 'utf8'));
const out = new URL('../src/data/stats.json', import.meta.url);
const countries = [...new Set(Object.values(cfg.timezones)), 'XX'];
const langs = [...cfg.languages, 'other'];
const devices = cfg.devices;
const browsers = cfg.browsers;

// 30 días hasta hoy (UTC), de más antiguo a más reciente
const days = [];
for (let i = cfg.days - 1; i >= 0; i--) days.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));

const keys = ['visits', ...days.map((d) => `d-${d}`), ...countries.map((c) => `c-${c}`), ...langs.map((l) => `l-${l}`), ...devices.map((d) => `dv-${d}`), ...browsers.map((b) => `b-${b}`)];

// El servicio admite 30 peticiones cada 10 s por dirección: tandas de 20 con pausa y, si aun así responde 429, espera y reintenta
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function read(key, tries = 5) {
  const r = await fetch(`${cfg.api}/get/${cfg.namespace}/${key}`);
  if (r.status === 404) return 0; // sin visitas todavía
  if (r.status === 429 && tries > 0) { await sleep(11000); return read(key, tries - 1); }
  if (!r.ok) throw new Error(`${key}: ${r.status}`);
  return Number((await r.json()).value) || 0;
}

try {
  const values = {};
  for (let i = 0; i < keys.length; i += 20) {
    const batch = keys.slice(i, i + 20);
    const res = await Promise.all(batch.map(read));
    batch.forEach((k, j) => (values[k] = res[j]));
    if (i + 20 < keys.length) await sleep(11000);
  }
  const rank = (prefix, list) => list.map((k) => ({ code: k, value: values[`${prefix}-${k}`] })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
  const dayRows = days.map((d) => ({ date: d, visits: values[`d-${d}`] }));
  const data = {
    generatedAt: new Date().toISOString(),
    total: values.visits,
    last30: dayRows.reduce((s, d) => s + d.visits, 0),
    days: dayRows,
    countries: rank('c', countries),
    languages: rank('l', langs),
    devices: rank('dv', devices),
    browsers: rank('b', browsers),
  };
  writeFileSync(out, JSON.stringify(data));
  console.log(`stats: ${data.total} visitas en total, ${data.last30} en 30 días`);
} catch (e) {
  console.warn('stats: no se pudieron leer los contadores, se deja el archivo como está:', e.message);
}
