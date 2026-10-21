import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, W_HEAD, W_LABEL } from '../theme';

// Línea de titular que sube (o entra de lado) tras una máscara
export const Line: React.FC<{
  text: React.ReactNode; size: number; color: string; delay?: number; dir?: 'up' | 'left' | 'right'; weight?: number;
  tracking?: string; lh?: number; config?: { damping: number; stiffness: number; mass: number };
}> = ({ text, size, color, delay = 0, dir = 'up', weight = W_HEAD, tracking = '-0.03em', lh = 0.98, config }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: config ?? { damping: 17, stiffness: 150, mass: 0.8 } });
  const t = dir === 'up' ? `translateY(${(1 - p) * 118}%)` : dir === 'left' ? `translateX(${(1 - p) * -112}%)` : `translateX(${(1 - p) * 112}%)`;
  return (
    <div style={{ overflow: 'hidden', paddingTop: size * 0.05, paddingBottom: size * 0.14, marginBottom: -size * 0.14 }}>
      <div style={{ fontSize: size, fontWeight: weight, color, letterSpacing: tracking, lineHeight: lh, transform: t, whiteSpace: 'nowrap', fontFamily: FONT }}>{text}</div>
    </div>
  );
};

// Etiqueta micro en mayúsculas (el sistema tipográfico de la web: tracking .08em)
export const Label: React.FC<{ text: string; color: string; delay?: number; size?: number; opacity?: number }> = ({ text, color, delay = 0, size = 26, opacity = 0.75 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: W_LABEL + 100, letterSpacing: '0.1em', color, opacity: p * opacity, transform: `translateY(${(1 - p) * 14}px)`, textTransform: 'uppercase' }}>{text}</div>
  );
};

// Palabras que saltan con un pequeño giro, una tras otra
export const PopWords: React.FC<{ words: string[]; size: number; color: string; delay?: number; stagger?: number }> = ({ words, size, color, delay = 0, stagger = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.26}px`, fontFamily: FONT, fontSize: size, fontWeight: W_HEAD, letterSpacing: '-0.03em', lineHeight: 1, color }}>
      {words.map((w, i) => {
        const p = spring({ frame: f - delay - i * stagger, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
        return <span key={i} style={{ display: 'inline-block', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 70}px) scale(${0.7 + 0.3 * p}) rotate(${(1 - p) * -7}deg)` }}>{w}</span>;
      })}
    </div>
  );
};

// Número que cuenta hasta su valor
export const CountUp: React.FC<{ to: number; start?: number; dur?: number }> = ({ to, start = 0, dur = 28 }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [start, start + dur], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  return <>{v}</>;
};

// Texto que se repite y se desplaza en bucle
export const Marquee: React.FC<{ text: string; size: number; color: string; speed?: number; opacity?: number }> = ({ text, size, color, speed = 5, opacity = 0.6 }) => {
  const f = useCurrentFrame();
  const unit = text.length * size * 0.66;
  const x = -((f * speed) % unit);
  return (
    <div style={{ overflow: 'hidden', width: '100%', whiteSpace: 'nowrap' }}>
      <div style={{ transform: `translateX(${x}px)`, fontFamily: FONT, fontSize: size, fontWeight: W_LABEL + 100, letterSpacing: '0.08em', color, opacity, display: 'inline-block' }}>{text.repeat(6)}</div>
    </div>
  );
};

// Sello "NEW": círculo amarillo que gira y entra con rebote
export const Sticker: React.FC<{ text: string; size?: number; delay?: number; rot?: number }> = ({ text, size = 190, delay = 0, rot = -12 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 140, mass: 0.7 } });
  return (
    <div style={{ width: size, height: size, minWidth: size, minHeight: size, flexShrink: 0, borderRadius: '50%', background: C.yellow, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: size * 0.3, letterSpacing: '0.06em', transform: `scale(${p}) rotate(${rot + (1 - p) * 90 + Math.sin((f - delay) / 22) * 4}deg)`, boxShadow: '0 12px 30px rgba(0,0,0,.25)' }}>{text}</div>
  );
};
