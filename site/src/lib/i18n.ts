export const LOCALES = ['en', 'es', 'gl', 'nl'] as const;
export type Lang = (typeof LOCALES)[number];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español', gl: 'Galego', nl: 'Nederlands' };
/** Valores del parámetro [...lang]: undefined = inglés en la raíz */
export const LANG_PATHS = [undefined, 'es', 'gl', 'nl'] as const;
export const langStaticPaths = <T extends object>(extra: T[] = [{} as T]) =>
  LANG_PATHS.flatMap((lang) => extra.map((e: any) => ({ ...e, params: { ...(e.params ?? {}), lang } })));

// Ruta base: '' en un dominio propio o en local; '/lopezlab' si se publica en GitHub Pages (https://usuario.github.io/lopezlab/).
// Se define al compilar con la variable BASE_PATH (ver astro.config.mjs).
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Añade la ruta base a una ruta absoluta del sitio (recursos estáticos, etc.) */
export const withBase = (path: string) => BASE + path;
/** Quita la ruta base de un pathname */
export const stripBase = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname);

export const langFrom = (p?: string): Lang => (LOCALES.includes(p as Lang) ? (p as Lang) : 'en');
export const langOfUrl = (url: URL): Lang => langFrom(stripBase(url.pathname).split('/')[1]);
/** Ruta interna con prefijo de idioma (el inglés vive en la raíz) y ruta base */
export const hrefFor = (lang: Lang, path: string) => BASE + (lang === 'en' ? path : `/${lang}${path === '/' ? '/' : path}`);
/** Misma página en otro idioma */
export const switchPath = (url: URL, to: Lang) => {
  const from = langOfUrl(url);
  const p = stripBase(url.pathname);
  let rest = from === 'en' ? p : p.slice(from.length + 1) || '/';
  if (rest.replace(/\/$/, '') === '/404') rest = '/';   // la 404 no existe por idioma: el selector lleva a la portada
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

/** Elegir idioma al entrar según el idioma del navegador (nl, gl, es; el resto, inglés). Solo se aplica una vez, y nunca si la persona ya eligió idioma. */
export const AUTO_LANGUAGE = true;
export const LANG_PREF_KEY = 'lopezlab:lang';

// ---------- Publicación ----------
/** Mientras no se publique en el dominio final la web se mantiene cerrada a buscadores (PUBLIC_SITE_LIVE=true al lanzar) */
export const SITE_LIVE = import.meta.env.PUBLIC_SITE_LIVE === 'true';
/** Poner a true cuando Mariola haya revisado las traducciones para que ES/GL/NL se indexen */
export const TRANSLATIONS_INDEXABLE = false;
/** Origen del sitio (sin barra final): viene de `site` en astro.config.mjs (variable SITE_URL al compilar) */
export const SITE_URL = (import.meta.env.SITE ?? 'https://www.lopezlab.com').replace(/\/$/, '');
