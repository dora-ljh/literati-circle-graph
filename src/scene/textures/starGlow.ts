import { CanvasTexture, LinearFilter } from 'three';

let coreTex: CanvasTexture | null = null;
let glowTex: CanvasTexture | null = null;

function makeRadialTexture(stops: [number, string][], size = 256): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  for (const [t, c] of stops) grad.addColorStop(t, c);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function getStarCoreTexture(): CanvasTexture {
  if (!coreTex) {
    coreTex = makeRadialTexture([
      [0.0, 'rgba(255,255,255,1)'],
      [0.18, 'rgba(255,255,255,0.95)'],
      [0.45, 'rgba(255,255,255,0.55)'],
      [0.75, 'rgba(255,255,255,0.18)'],
      [1.0, 'rgba(255,255,255,0)'],
    ]);
  }
  return coreTex;
}

export function getStarGlowTexture(): CanvasTexture {
  if (!glowTex) {
    glowTex = makeRadialTexture([
      [0.0, 'rgba(255,255,255,1)'],
      [0.15, 'rgba(255,255,255,0.55)'],
      [0.4, 'rgba(255,255,255,0.18)'],
      [0.7, 'rgba(255,255,255,0.05)'],
      [1.0, 'rgba(255,255,255,0)'],
    ]);
  }
  return glowTex;
}
