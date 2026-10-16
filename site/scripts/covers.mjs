// Retoque y recorte de portadas: 16:9 con encuadre por atención, sin tocar el color (solo un enfoque suave).
// También prepara la foto principal de la home sin la banda naranja que traía incrustada.
import sharp from 'sharp';
import fs from 'node:fs';

const projects = JSON.parse(fs.readFileSync('src/data/projects.json', 'utf8'));
const heroes = JSON.parse(fs.readFileSync('src/data/heroes.json', 'utf8'));
const overrides = fs.existsSync('scripts/cover-focus.json') ? JSON.parse(fs.readFileSync('scripts/cover-focus.json', 'utf8')) : {};
const OUT = 'src/assets/work';
// Portadas elegidas a mano (slug -> imagen de origen): sustituyen a la miniatura del listado antiguo
const chosen = {
  'ontspannen-nederland': 'blog__imagesTiny__8adba561c08b9725a53fad23ee88f9e1.jpg',
  'good-farming-different-ways': 'blog__imagesTiny__4e3622c44ed9b3a204502df3e6786a17.jpg',
  'regenerative-farming-framed': 'blog__imagesTiny__3f0b70291e4676b6303315fbba34208e.jpg',
  'alizent': 'blog__imagesTiny__0003476e22967ada44343a5011f4bd33.jpg',
  'een-thuis-voor-asr': 'blog__imagesTiny__e83484a2401ba61b359d7140fb0761e9.jpg',
};
const covers = {};

// 1) Foto principal: la banda naranja ocupa las filas 0-97 de la original (2233x1363)
{
  const src = '../_crawl/images/edicion__EDC-0041__hero-image-4.jpg';
  const meta = await sharp(src).metadata();
  const top = 102;
  await sharp(src).extract({ left: 0, top, width: meta.width, height: meta.height - top })
    .sharpen({ sigma: 0.6 }).jpeg({ quality: 90, mozjpeg: true }).toFile(`${OUT}/hero-home.jpg`);
  console.log('hero-home.jpg', meta.width, meta.height - top);
}

// 2) Portadas 16:9
const alt = {};   // portada original (para el bloque destacado de la home cuando la tarjeta usa una imagen elegida a mano)
async function make(file, name, focus, slug) {
  const src = `${OUT}/${file}`;
  const m = await sharp(src).metadata();
  // Defecto de las imágenes originales de la web antigua: junto a un borde hay una tira recortada de la misma foto y una
  // columna (o fila) blanca antes de la imagen real. Se detecta en los cuatro bordes y se recorta lo que queda fuera.
  const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const stat = (len, at) => { let min = 255, sum = 0, sum2 = 0; for (let k = 0; k < len; k++) { const v = at(k); if (v < min) min = v; sum += v; sum2 += v * v; } const mean = sum / len; return { min, std: Math.sqrt(Math.max(0, sum2 / len - mean * mean)) }; };
  const colWhite = (x) => { const s = stat(H, (y) => data[y * W + x]); return s.min >= 238 && s.std <= 8; };
  const rowWhite = (y) => { const s = stat(W, (x) => data[y * W + x]); return s.min >= 238 && s.std <= 8; };
  // Busca, en el tramo [from, to) de un eje, la primera tira blanca de al menos `minRun`
  const findRun = (isWhite, from, to, minRun) => { for (let i = from; i < to; i++) { let run = 0; while (i + run < to + minRun && isWhite(i + run)) run++; if (run >= minRun) { let end = i + run; while (end < (isWhite === colWhite ? W : H) && isWhite(end)) end++; return [i, end]; } } return null; };
  const minX = Math.max(5, Math.round(W * 0.004)), minY = Math.max(5, Math.round(H * 0.004));
  let left = 0, right = W, top = 0, bottom = H;
  const rr = findRun(colWhite, Math.floor(W * 0.90), Math.floor(W * 0.985), minX); if (rr) right = rr[0];
  const rl = findRun(colWhite, 1, Math.floor(W * 0.10), minX); if (rl && !colWhite(rl[0] - 1)) left = rl[1];      // solo si hay foto antes de la tira (si no, es el fondo)
  const rb = findRun(rowWhite, Math.floor(H * 0.90), Math.floor(H * 0.985), minY); if (rb) bottom = rb[0];
  const rt = findRun(rowWhite, 1, Math.floor(H * 0.10), minY); if (rt && !rowWhite(rt[0] - 1)) top = rt[1];
  // franja blanca inferior pegada al borde
  let edge = 0; while (edge < H * 0.12 && rowWhite(H - 1 - edge) && bottom === H) edge++; if (edge >= 3) bottom = H - edge;
  const region = { left, top, width: right - left, height: bottom - top };
  if (left || top || right < W || bottom < H) console.log('recorte', slug, { izq: left, arriba: top, der: W - right, abajo: H - bottom });
  // 16:9 sin ampliar: si el origen es más ancho que 16:9 se recortan los lados en vez de escalar la imagen
  const w = Math.min(2400, region.width, Math.floor((region.height * 16) / 9)); const h = Math.round((w * 9) / 16);
  const opts = focus
    ? { width: w, height: h, fit: 'cover', position: focus }       // 'top' | 'bottom' | 'left' | 'right' | 'centre'
    : { width: w, height: h, fit: 'cover', position: sharp.strategy.attention };
  await sharp(src).extract(region).resize(opts).sharpen({ sigma: 0.5 }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/${name}`);
}
for (const p of projects) {
  if (!p.cover || p.cover.endsWith('.gif')) continue;
  const orig = heroes[p.slug] ?? p.cover;
  await make(chosen[p.slug] ?? orig, `cover__${p.slug}.jpg`, overrides[p.slug], p.slug);
  covers[p.slug] = `cover__${p.slug}.jpg`;
  if (chosen[p.slug]) { await make(orig, `cover-alt__${p.slug}.jpg`, undefined, p.slug); alt[p.slug] = `cover-alt__${p.slug}.jpg`; }
}
fs.writeFileSync('src/data/covers.json', JSON.stringify(covers, null, 1));
fs.writeFileSync('src/data/coverAlt.json', JSON.stringify(alt, null, 1));
console.log(Object.keys(covers).length, 'portadas');
