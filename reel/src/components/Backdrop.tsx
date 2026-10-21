import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, H, W } from '../theme';
import { BG, SCENES } from '../timeline';

const COLOR: Record<string, string> = { dark: C.dark, brown: C.brown, light: C.light, yellow: C.yellow };
const order = ['hook', 'home', 'work', 'project', 'about', 'close'] as const;

// Fondo: cada escena nueva entra como un círculo de color que se expande desde el iPhone
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLOR[BG.hook] }}>
      {order.slice(1).map((name) => {
        const from = SCENES[name].from;
        const p = interpolate(f, [from - 2, from + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1) });
        if (p <= 0) return null;
        return <AbsoluteFill key={name} style={{ background: COLOR[BG[name]], clipPath: `circle(${p * 2300}px at ${W / 2}px ${H * 0.55}px)` }} />;
      })}
    </AbsoluteFill>
  );
};
