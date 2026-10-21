import React from 'react';

// Mockup de iPhone dibujado con código: marco, isla dinámica, botones laterales y reflejo suave.
export const SCREEN_W = 406;
export const SCREEN_H = 879; // misma proporción que la grabación (390×844)
const B = 13; // bisel

export const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const outerW = SCREEN_W + B * 2;
  const outerH = SCREEN_H + B * 2;
  const R = 66;
  return (
    <div style={{ position: 'relative', width: outerW, height: outerH }}>
      {/* botones laterales */}
      {[{ top: 150, h: 42 }, { top: 230, h: 78 }, { top: 326, h: 78 }].map((b, i) => (
        <div key={i} style={{ position: 'absolute', left: -5, top: b.top, width: 5, height: b.h, background: '#2b2b2f', borderRadius: '3px 0 0 3px' }} />
      ))}
      <div style={{ position: 'absolute', right: -5, top: 262, width: 5, height: 120, background: '#2b2b2f', borderRadius: '0 3px 3px 0' }} />
      {/* cuerpo */}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: R, background: '#08080a',
          border: '3px solid #46464b',
          boxShadow: '0 60px 120px rgba(0,0,0,.45), 0 20px 40px rgba(0,0,0,.35), inset 0 0 0 2px #151518',
        }}
      />
      {/* pantalla */}
      <div style={{ position: 'absolute', left: B, top: B, width: SCREEN_W, height: SCREEN_H, borderRadius: R - B, overflow: 'hidden', background: '#fff' }}>
        {children}
        {/* isla dinámica */}
        <div style={{ position: 'absolute', top: 12, left: '50%', marginLeft: -56, width: 112, height: 33, borderRadius: 17, background: '#000' }} />
        {/* reflejo */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(112deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 26%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};
