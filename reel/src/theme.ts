// Marca Lopezlab, sacada del proyecto: site/src/styles/global.css (tokens), accents.json (marrón del bloque destacado)
// y el amarillo del cartel de CC Amstel (imagen real del proyecto, muestreada de la grabación).
export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Zonas seguras de Instagram: nada importante en los 250 px superiores ni en los 400 inferiores
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = H - 400;
export const C = {
  dark: '#0f0f0f', // --bg en modo oscuro
  onDark: '#f0f0f0', // --ink en modo oscuro
  light: '#fcfcfd', // --bg (oklch .995)
  ink: '#17181c', // --ink (oklch .19 .01 260)
  brown: '#6b5244', // acento del bloque destacado "Regenerative Farming Framed"
  yellow: '#dcc800', // amarillo del cartel de CC Amstel
};
export const FONT = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
export const W_HEAD = 550; // --w-head
export const W_LABEL = 500; // --w-label
