import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { C, FONT, FPS, H, SAFE_BOTTOM, SAFE_TOP, W, W_HEAD } from './theme';
import { T } from './texts';
import { BG, CLIPS, SCENES, TOTAL } from './timeline';
import { Phone, SCREEN_H, SCREEN_W } from './components/Phone';
import { Backdrop } from './components/Backdrop';
import { CountUp, Label, Line, Marquee, PopWords, Sticker } from './components/Kinetic';

export { TOTAL };

const FG: Record<string, string> = { dark: C.onDark, brown: C.onDark, light: C.ink, yellow: C.ink };
const fgOf = (scene: keyof typeof BG) => FG[BG[scene]];

// La tipografía real de la web (Schibsted Grotesk) se carga antes de pintar nada
const useBrandFont = () => {
  const [handle] = useState(() => delayRender('fuente'));
  useEffect(() => {
    const ff = new FontFace('Schibsted Grotesk', `url(${staticFile('fonts/schibsted-grotesk-latin-wght-normal.woff2')})`, { weight: '400 800' });
    ff.load().then(() => { document.fonts.add(ff); continueRender(handle); }).catch(() => continueRender(handle));
  }, [handle]);
};

/* ───────────── iPhone: posición y giro por escena, con rebote entre una y otra ───────────── */
type St = { x: number; y: number; rotX: number; rotY: number; rotZ: number; s: number };
const S: Record<string, St> = {
  enter: { x: 0, y: 820, rotX: 22, rotY: -40, rotZ: 12, s: 0.85 },
  home: { x: 0, y: 0, rotX: 5, rotY: -11, rotZ: -1.5, s: 1 },
  work: { x: 0, y: 0, rotX: 4, rotY: 12, rotZ: 1.5, s: 1 },
  project: { x: 0, y: 0, rotX: 6, rotY: -10, rotZ: -1, s: 1 },
  about: { x: 0, y: 0, rotX: 5, rotY: 11, rotZ: 1.5, s: 1 },
  close: { x: 0, y: 1600, rotX: 14, rotY: -24, rotZ: -8, s: 0.9 },
};
const PHONE_SEQ = ['home', 'work', 'project', 'about', 'close'] as const;
const PHONE_TOP = 598; // alto 905 → termina en 1503 (dentro de la zona segura)

const lerpSt = (a: St, b: St, p: number): St => ({
  x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, rotX: a.rotX + (b.rotX - a.rotX) * p,
  rotY: a.rotY + (b.rotY - a.rotY) * p, rotZ: a.rotZ + (b.rotZ - a.rotZ) * p, s: a.s + (b.s - a.s) * p,
});

const PhoneStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < SCENES.home.from - 1) return null;
  let st = S.enter;
  PHONE_SEQ.forEach((name, i) => {
    const from = SCENES[name].from;
    if (f >= from) {
      const prev = i === 0 ? S.enter : S[PHONE_SEQ[i - 1]];
      const cfg = name === 'close' ? { damping: 16, stiffness: 120, mass: 0.8 } : i === 0 ? { damping: 13, stiffness: 70, mass: 1 } : { damping: 12, stiffness: 95, mass: 0.9 };
      st = lerpSt(prev, S[name], spring({ frame: f - from, fps, config: cfg }));
    }
  });
  const drift = { y: Math.sin(f / 36) * 7, rotY: Math.sin(f / 52) * 2.4, rotX: Math.cos(f / 61) * 1.2 };
  return (
    <div style={{ position: 'absolute', left: (W - (SCREEN_W + 26)) / 2, top: PHONE_TOP, transform: `translate(${st.x}px, ${st.y + drift.y}px) perspective(2300px) rotateX(${st.rotX + drift.rotX}deg) rotateY(${st.rotY + drift.rotY}deg) rotateZ(${st.rotZ}deg) scale(${st.s})` }}>
      <Phone>{children}</Phone>
    </div>
  );
};

/* ───────────── Pantalla: grabación + empujes de zoom hacia cada pulsación ───────────── */
const ClipScreen: React.FC<{ name: 'home' | 'work' | 'project' | 'about' }> = ({ name }) => {
  const cfg = CLIPS[name];
  const dur = SCENES[name].dur;
  const f = useCurrentFrame();
  const k = SCREEN_W / 390;
  const base = interpolate(f, [0, dur], [1, 1.06]);
  let z = 1, ox = SCREEN_W / 2, oy = SCREEN_H / 2;
  cfg.taps.forEach((tap) => {
    const tf = ((tap.t - cfg.trim) / cfg.rate) * FPS;
    const p = interpolate(f, [tf - 12, tf - 2, tf + 3, tf + 13], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    if (p > 0.001) { z = 1 + (tap.z - 1) * p; const m = tap.raw ? 1 : 0.6; ox = tap.x * k * m + (SCREEN_W / 2) * (1 - m); oy = tap.y * k * m + (SCREEN_H / 2) * (1 - m); }
  });
  return (
    <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${base})`, transformOrigin: '50% 30%' }}>
      <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px` }}>
        <OffthreadVideo src={staticFile(cfg.file)} startFrom={Math.round(cfg.trim * FPS)} playbackRate={cfg.rate} muted style={{ width: SCREEN_W, height: SCREEN_H, objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  );
};

/* ───────────── Sello NEW sobre el iPhone (escenas 2–5) ───────────── */
const PhoneSticker: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.home.from + 14;
  const out = interpolate(f, [SCENES.about.from + SCENES.about.dur - 6, SCENES.close.from + 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (f < from || out <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 700, top: 548, opacity: out }}>
      <Sequence from={from}><Sticker text={T.badge} size={150} rot={-14} /></Sequence>
    </div>
  );
};

/* ───────────── Escenas de texto ───────────── */
const Block: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = SAFE_TOP + 14 }) => (
  <div style={{ position: 'absolute', left: 84, top, width: 912, fontFamily: FONT }}>{children}</div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const fg = fgOf('hook');
  const hl = interpolate(f, [26, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const out = interpolate(f, [SCENES.hook.dur - 8, SCENES.hook.dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Block top={SAFE_TOP + 20}><Label text={T.hookLabel} color={fg} delay={2} size={28} /></Block>
      <Block top={400}>
        <Line text={T.hook[0]} size={214} color={fg} dir="left" delay={0} config={{ damping: 12, stiffness: 160, mass: 0.7 }} />
        <Line text={T.hook[1]} size={214} color={fg} dir="right" delay={5} config={{ damping: 12, stiffness: 160, mass: 0.7 }} />
        <div style={{ position: 'relative', width: 'fit-content', marginTop: 10 }}>
          <div style={{ position: 'absolute', left: -14, right: -14, top: 18, bottom: 6, background: C.yellow, transformOrigin: '0 50%', transform: `scaleX(${hl})` }} />
          <div style={{ position: 'relative', color: hl > 0.55 ? C.ink : fg }}>
            <Line text={T.hook[2]} size={214} color={hl > 0.55 ? C.ink : fg} dir="up" delay={22} />
          </div>
        </div>
      </Block>
      <div style={{ position: 'absolute', left: 700, top: 360 }}>
        <Sequence from={14}><Sticker text={T.badge} size={250} rot={-12} /></Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 1290, width: W }}>
        <Marquee text={T.marquee} size={46} color={fg} speed={9} opacity={0.5} />
      </div>
    </AbsoluteFill>
  );
};

const exitFade = (f: number, dur: number) => interpolate(f, [dur - 7, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const HomeText: React.FC = () => {
  const f = useCurrentFrame();
  const fg = fgOf('home');
  return (
    <AbsoluteFill style={{ opacity: exitFade(f, SCENES.home.dur) }}>
      <Block><Label text={T.taglineLabel} color={fg} delay={10} />
        <div style={{ height: 22 }} />
        <Line text={T.tagline[0]} size={96} color={fg} delay={14} />
        <Line text={T.tagline[1]} size={96} color={fg} delay={20} />
      </Block>
    </AbsoluteFill>
  );
};

const WorkText: React.FC = () => {
  const f = useCurrentFrame();
  const fg = fgOf('work');
  return (
    <AbsoluteFill style={{ opacity: exitFade(f, SCENES.work.dur) }}>
      <Block><Label text={T.workLabel} color={fg} delay={10} />
        <div style={{ height: 22 }} />
        <Line text={<><CountUp to={T.workCount} start={8} dur={30} /> {T.work[0]}</>} size={104} color={fg} delay={12} weight={700} />
        <Line text={T.work[1]} size={104} color={fg} delay={19} />
      </Block>
    </AbsoluteFill>
  );
};

const ProjectText: React.FC = () => {
  const f = useCurrentFrame();
  const fg = fgOf('project');
  return (
    <AbsoluteFill style={{ opacity: exitFade(f, SCENES.project.dur) }}>
      <Block><Label text={T.projectLabel} color={fg} delay={10} opacity={0.8} />
        <div style={{ height: 26 }} />
        <PopWords words={['Every', 'project,']} size={108} color={fg} delay={12} />
        <div style={{ height: 6 }} />
        <PopWords words={['in', 'depth.']} size={108} color={fg} delay={22} />
      </Block>
    </AbsoluteFill>
  );
};

const LangChips: React.FC<{ delay: number }> = ({ delay }) => {
  const f = useCurrentFrame();
  const active = Math.floor(Math.max(0, f - delay) / 14) % 4;
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
      {T.langs.map((l, i) => {
        const p = interpolate(f, [delay + i * 3, delay + i * 3 + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const on = f >= delay && i === active;
        return (
          <div key={l} style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px) scale(${on ? 1.08 : 1})`, fontFamily: FONT, fontWeight: 650, fontSize: 34, letterSpacing: '0.06em', padding: '9px 24px', borderRadius: 40, border: `2px solid ${on ? C.yellow : 'rgba(240,240,240,.45)'}`, background: on ? C.yellow : 'transparent', color: on ? C.ink : C.onDark }}>{l}</div>
        );
      })}
    </div>
  );
};

const AboutText: React.FC = () => {
  const f = useCurrentFrame();
  const fg = fgOf('about');
  const split = 98;
  const dur = SCENES.about.dur;
  const o1 = interpolate(f, [split - 7, split], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: exitFade(f, dur) }}>
      {f < split && (
        <AbsoluteFill style={{ opacity: o1 }}>
          <Block><Label text={T.langLabel} color={fg} delay={10} />
            <div style={{ height: 22 }} />
            <Line text={T.lang[0]} size={90} color={fg} delay={12} />
            <Line text={T.lang[1]} size={90} color={fg} delay={18} />
            <LangChips delay={30} />
          </Block>
        </AbsoluteFill>
      )}
      {f >= split && (
        <Sequence from={split}>
          <Block><Label text={T.clientsLabel} color={fg} delay={2} />
            <div style={{ height: 22 }} />
            <Line text={T.clients[0]} size={96} color={fg} delay={4} />
            <Line text={T.clients[1]} size={96} color={fg} delay={10} />
          </Block>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fg = fgOf('close');
  const tile = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } });
  const bar = interpolate(f, [34, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1) });
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 84, top: 300, display: 'flex', alignItems: 'center', gap: 28, fontFamily: FONT }}>
        <div style={{ width: 150, height: 150, borderRadius: 30, overflow: 'hidden', transform: `scale(${tile}) rotate(${(1 - tile) * -30}deg)` }}>
          <Img src={staticFile('brand/logo-mark.svg')} style={{ width: 150, height: 150, display: 'block', filter: 'invert(1)' }} />
        </div>
        <div style={{ fontWeight: 650, fontSize: 36, letterSpacing: '0.1em', color: fg, lineHeight: 1.25, opacity: Math.min(1, tile) }}>LOPEZLAB<br />AMSTERDAM.</div>
      </div>
      <div style={{ position: 'absolute', left: 742, top: 270 }}><Sequence from={10}><Sticker text={T.badge} size={168} rot={-10} /></Sequence></div>
      <Block top={600}><Label text={T.closeLabel} color={fg} delay={14} size={30} />
        <div style={{ height: 14 }} />
        <Line text={T.closeCta} size={270} color={fg} delay={16} config={{ damping: 14, stiffness: 150, mass: 0.8 }} />
      </Block>
      <Block top={1010}>
        <div style={{ position: 'relative', width: 'fit-content' }}>
          <Line text={T.url} size={120} color={fg} delay={28} />
          <div style={{ height: 16, background: C.yellow, transformOrigin: '0 50%', transform: `scaleX(${bar})`, marginTop: 10 }} />
        </div>
        <div style={{ marginTop: 34, fontSize: 44, fontWeight: 450, color: fg, opacity: interpolate(f, [46, 58], [0, 0.75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), fontFamily: FONT }}>{T.mail}</div>
      </Block>
    </AbsoluteFill>
  );
};

/* ───────────── Composición ───────────── */
export const Reel: React.FC<{ safe?: boolean }> = ({ safe = false }) => {
  useBrandFont();
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: 'hidden' }}>
      <Backdrop />
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.dur}><Hook /></Sequence>
      <Sequence from={SCENES.home.from} durationInFrames={SCENES.home.dur}><HomeText /></Sequence>
      <Sequence from={SCENES.work.from} durationInFrames={SCENES.work.dur}><WorkText /></Sequence>
      <Sequence from={SCENES.project.from} durationInFrames={SCENES.project.dur}><ProjectText /></Sequence>
      <Sequence from={SCENES.about.from} durationInFrames={SCENES.about.dur}><AboutText /></Sequence>
      <Sequence from={SCENES.close.from} durationInFrames={SCENES.close.dur}><Close /></Sequence>
      <PhoneStage>
        {(['home', 'work', 'project', 'about'] as const).map((n) => (
          <Sequence key={n} from={SCENES[n].from} durationInFrames={SCENES[n].dur}><ClipScreen name={n} /></Sequence>
        ))}
      </PhoneStage>
      <PhoneSticker />
      {safe && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: SAFE_TOP, background: 'rgba(255,0,0,.18)', borderBottom: '3px solid red' }} />
          <div style={{ position: 'absolute', left: 0, top: SAFE_BOTTOM, width: W, height: H - SAFE_BOTTOM, background: 'rgba(255,0,0,.18)', borderTop: '3px solid red' }} />
        </>
      )}
    </AbsoluteFill>
  );
};
