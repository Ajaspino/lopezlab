// Acento por proyecto: el color más "presente y saturado" de la portada, oscurecido hasta cumplir AA (>=4.5) sobre blanco.
import sharp from 'sharp';
import fs from 'node:fs';
const projects = JSON.parse(fs.readFileSync('src/data/projects.json', 'utf8'));
const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
const lum = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255]; };
const out = {};
for (const p of projects) {
  if (!p.cover) continue;
  const { data } = await sharp(`../_crawl/images/${p.cover}`).resize(48, 48, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]; const [h, s, v] = hsv(r, g, b);
    if (s < .25 || v < .2) continue; const k = buckets[Math.floor(h / 30) % 12]; const w = s * s * v; k.w += w; k.r += r * w; k.g += g * w; k.b += b * w;
  }
  const best = buckets.sort((a, b) => b.w - a.w)[0];
  let [r, g, b] = best.w > 0.5 ? [best.r / best.w, best.g / best.w, best.b / best.w] : [40, 40, 40];
  for (let i = 0; i < 60 && 1.05 / (lum(r, g, b) + .05) < 5; i++) [r, g, b] = [r * .94, g * .94, b * .94];
  out[p.slug] = '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
fs.writeFileSync('src/data/accents.json', JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, 'acentos');
