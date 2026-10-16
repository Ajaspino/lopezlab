export const LOCALES = ['en', 'es', 'gl', 'nl'] as const;
export type Lang = (typeof LOCALES)[number];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español', gl: 'Galego', nl: 'Nederlands' };
/** Valores del parámetro [...lang]: undefined = inglés en la raíz */
export const LANG_PATHS = [undefined, 'es', 'gl', 'nl'] as const;
export const langStaticPaths = <T extends object>(extra: T[] = [{} as T]) =>
  LANG_PATHS.flatMap((lang) => extra.map((e: any) => ({ ...e, params: { ...(e.params ?? {}), lang } })));

export const langFrom = (p?: string): Lang => (LOCALES.includes(p as Lang) ? (p as Lang) : 'en');
export const langOfUrl = (url: URL): Lang => langFrom(url.pathname.split('/')[1]);
/** Ruta interna con prefijo de idioma (el inglés vive en la raíz) */
export const hrefFor = (lang: Lang, path: string) => (lang === 'en' ? path : `/${lang}${path === '/' ? '/' : path}`);
/** Misma página en otro idioma */
export const switchPath = (url: URL, to: Lang) => {
  const from = langOfUrl(url);
  const rest = from === 'en' ? url.pathname : url.pathname.slice(from.length + 1) || '/';
  return hrefFor(to, rest);
};

// ---------- Traducciones ----------
// Las cadenas se identifican por ruta (p. ej. "projects.3.blocks.2.html") -> id de texto; cada idioma tiene su diccionario id -> traducción.
// Si falta una traducción se muestra el inglés.
import paths from '../data/i18n/paths.json';
import uiEn from '../data/i18n/ui.en.json';
import es from '../data/i18n/es.json';
import gl from '../data/i18n/gl.json';
import nl from '../data/i18n/nl.json';

const dicts: Record<string, Record<string, string>> = { es, gl, nl };
const P = paths as Record<string, string>;

export function tr(lang: Lang, path: string, fallback: string): string {
  if (lang === 'en') return fallback;
  const id = P[path];
  return (id && dicts[lang]?.[id]) || fallback;
}
/** Texto de interfaz (menú, etiquetas, etc.) */
export const ui = (lang: Lang, key: keyof typeof uiEn): string => tr(lang, key as string, uiEn[key]);

/** Copia profunda de `obj` con las cadenas traducidas al idioma pedido */
export function localize<T>(obj: T, lang: Lang, path: string): T {
  if (lang === 'en') return obj;
  const walk = (o: any, p: string): any => {
    if (typeof o === 'string') return tr(lang, p, o);
    if (Array.isArray(o)) return o.map((x, i) => walk(x, `${p}.${i}`));
    if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, walk(v, `${p}.${k}`)]));
    return o;
  };
  return walk(obj, path);
}

// ---------- Publicación ----------
/** Mientras no se publique en el dominio final la web se mantiene cerrada a buscadores (PUBLIC_SITE_LIVE=true al lanzar) */
export const SITE_LIVE = import.meta.env.PUBLIC_SITE_LIVE === 'true';
/** Poner a true cuando Mariola haya revisado las traducciones para que ES/GL/NL se indexen */
export const TRANSLATIONS_INDEXABLE = false;
export const SITE_URL = 'https://www.lopezlab.com';
