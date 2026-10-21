// Línea de tiempo (30 fps). Total 888 fotogramas = 29,6 s.
export const SCENES = {
  hook: { from: 0, dur: 78 },
  home: { from: 78, dur: 200 },
  work: { from: 278, dur: 165 },
  project: { from: 443, dur: 185 },
  about: { from: 628, dur: 170 },
  close: { from: 798, dur: 90 },
} as const;
export const TOTAL = 888;

// Grabaciones (public/clips): recorte inicial (s), velocidad y pulsaciones (s del clip + posición en px del móvil, de manifest.json)
export const CLIPS = {
  home: { file: 'clips/home.mp4', trim: 0.2, rate: 1.25, taps: [] as { t: number; x: number; y: number; z: number; raw?: boolean }[] },
  work: { file: 'clips/work.mp4', trim: 0.1, rate: 1.2, taps: [{ t: 4.0, x: 149, y: 198, z: 1.3 }] },
  project: { file: 'clips/project.mp4', trim: 0.2, rate: 1.5, taps: [{ t: 2.2, x: 195, y: 198, z: 1.3 }] },
  about: { file: 'clips/about.mp4', trim: 0.0, rate: 1.4, taps: [{ t: 1.3, x: 330, y: 60, z: 1.0 }, { t: 2.8, x: 0, y: 430, z: 1.4, raw: true }] },
};

// Fondo de cada escena (color) y color de texto
export const BG = { hook: 'dark', home: 'brown', work: 'light', project: 'yellow', about: 'dark', close: 'light' } as const;
