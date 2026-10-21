import React from 'react';
import { Composition } from 'remotion';
import { Reel, TOTAL } from './Reel';
import { FPS, H, W } from './theme';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ safe: false }} />
    {/* Misma composición con las franjas de las zonas seguras de Instagram, solo para revisar */}
    <Composition id="Reel-safe" component={Reel} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ safe: true }} />
  </>
);
