import type { ImageMetadata } from 'astro';
import projects from '../data/projects.json';
import accents from '../data/accents.json';

const all = import.meta.glob<{ default: ImageMetadata }>('/src/assets/work/*.{jpg,jpeg,png,gif,webp}', { eager: true });

export function img(file?: string | null): ImageMetadata | undefined {
  if (!file) return undefined;
  return all['/src/assets/work/' + file]?.default;
}
export const isGif = (file?: string | null) => !!file && /\.gif$/i.test(file);

export type Project = (typeof projects)[number];
import covers from '../data/covers.json';
// Portadas retocadas y recortadas a 16:9 (scripts/covers.mjs); si una no existe (p. ej. las animadas) se usa la original
const coverFor = (slug: string, orig: string | null) => (covers as Record<string, string>)[slug] ?? orig;
export const allProjects: Project[] = projects.map((p) => ({ ...p, cover: coverFor(p.slug, p.cover) }));
export { coverFor };
import coverAlt from '../data/coverAlt.json';
/** Portada anterior (la del listado antiguo), para el bloque destacado de la home cuando la tarjeta usa otra imagen */
export const spotlightCover = (slug: string, fallback: string | null) => (coverAlt as Record<string, string>)[slug] ?? fallback;
export const accentOf = (slug: string): string => (accents as Record<string, string>)[slug] ?? '#1d1d20';
export const projectBySlug = (slug: string) => allProjects.find((p) => p.slug === slug)!;

/** Proporción de la portada, acotada para que la composición no se rompa */
export function coverRatio(file?: string | null, min = 0.8, max = 1.5) {
  const m = img(file);
  if (!m) return '4 / 3';
  return `${Math.min(max, Math.max(min, m.width / m.height)).toFixed(3)} / 1`;
}

/** Categorías únicas encontradas en los proyectos */
export function allCategories() {
  const map = new Map<string, string>();
  for (const p of allProjects) for (const c of p.categories) map.set(c.slug, c.name);
  return [...map].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Cabecera de proyecto: la misma portada ya retocada y recortada (así la transición desde la tarjeta es exacta) */
export const heroOf = (p: Project): string | null => p.cover;

import { localize, type Lang } from './i18n';
const cache = new Map<Lang, Project[]>();
/** Proyectos con textos en el idioma pedido (inglés si falta la traducción) */
export function projectsFor(lang: Lang): Project[] {
  if (!cache.has(lang)) cache.set(lang, localize(allProjects, lang, 'projects'));
  return cache.get(lang)!;
}
export function categoriesFor(lang: Lang) {
  const map = new Map<string, string>();
  for (const p of projectsFor(lang)) for (const c of p.categories) map.set(c.slug, c.name);
  return [...map].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, lang));
}
