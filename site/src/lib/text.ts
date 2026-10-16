/** Párrafos con listas escritas como "– a<br/>– b": se separan en introducción + ítems (el texto no cambia). */
export function splitDashes(html: string): { intro: string; items: string[] } | null {
  const parts = html.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
  const first = parts.findIndex((s) => /^[–-]\s/.test(s));
  if (first === -1 || parts.slice(first).some((s) => !/^[–-]\s/.test(s))) return null;
  return { intro: parts.slice(0, first).join('<br/>'), items: parts.slice(first).map((s) => s.replace(/^[–-]\s*/, '')) };
}

/** El original escribe algunos rótulos en mayúsculas: se muestran con solo la primera letra en mayúscula */
export const sentenceCase = (t: string) => (t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t);
