import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Points,
} from 'three';
import { backgroundStars as bgToken } from '../styles/tokens';
import { getStarCoreTexture } from './textures/starGlow';

// 三层背景星场：
// - tiny  远景细星：数量最多、体积最小、不闪烁，撑起"密度"
// - mid   中景星：适量、中等、缓慢闪烁
// - bright近景亮星：少量、超亮（>1.0）触发 Bloom、明显呼吸
// 所有层 sizeAttenuation=false → 屏幕像素固定，模拟"远星永远是点"。
// 闪烁通过 useFrame 在 CPU 上重写 color buffer 实现（共 5100 floats/帧，性能充足）。

interface Layer {
  geo: BufferGeometry;
  phases: Float32Array;     // 每颗星独立相位 [0, 2π]
  baseColors: Float32Array; // 闪烁前的原始颜色（克隆，避免反复衰减）
}

function makeLayer(
  count: number,
  innerR: number,
  outerR: number,
  alphaMin: number,
  alphaMax: number,
  hueJitter: number,
  seed: number,
): Layer {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  let s = seed >>> 0;
  const rand = () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s) >>> 0;
    s = (s + Math.imul(s ^ (s >>> 7), 61 | s)) >>> 0;
    const v = (s ^ (s >>> 14)) >>> 0;
    return (v % 1_000_000) / 1_000_000;
  };

  for (let i = 0; i < count; i += 1) {
    const u = rand();
    const v = rand();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const rT = rand();
    const r = innerR + Math.cbrt(rT) * (outerR - innerR);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const hueShift = (rand() - 0.5) * hueJitter;
    const lightness = 0.78 + rand() * 0.18;
    const c = new Color().setHSL(0.6 + hueShift, 0.18, lightness);
    const alpha = alphaMin + rand() * (alphaMax - alphaMin);
    colors[i * 3] = c.r * alpha;
    colors[i * 3 + 1] = c.g * alpha;
    colors[i * 3 + 2] = c.b * alpha;

    phases[i] = rand() * Math.PI * 2;
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('color', new BufferAttribute(colors, 3));

  return { geo, phases, baseColors: colors.slice() };
}

interface LayerProps {
  layer: Layer;
  size: number;
  twinkle?: { amp: number; freq: number };
}

function StarLayer({ layer, size, twinkle }: LayerProps) {
  const tex = getStarCoreTexture();
  const ref = useRef<Points>(null);

  useFrame(({ clock }) => {
    if (!twinkle || !ref.current) return;
    const t = clock.elapsedTime;
    const w = t * twinkle.freq * Math.PI * 2;
    const colorAttr = layer.geo.getAttribute('color') as BufferAttribute;
    const arr = colorAttr.array as Float32Array;
    const base = layer.baseColors;
    const phases = layer.phases;
    const amp = twinkle.amp;
    for (let i = 0; i < phases.length; i += 1) {
      const f = 1 + amp * Math.sin(w + phases[i]);
      const j = i * 3;
      arr[j] = base[j] * f;
      arr[j + 1] = base[j + 1] * f;
      arr[j + 2] = base[j + 2] * f;
    }
    colorAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={layer.geo} frustumCulled={false}>
      <pointsMaterial
        map={tex}
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation={false}
        size={size}
        toneMapped={false}
      />
    </points>
  );
}

export function BackgroundStars() {
  const layers = useMemo(
    () => ({
      tiny: makeLayer(
        bgToken.tinyCount,
        bgToken.innerRadius,
        bgToken.outerRadius,
        bgToken.tinyAlphaMin,
        bgToken.tinyAlphaMax,
        bgToken.hueJitter,
        11,
      ),
      mid: makeLayer(
        bgToken.midCount,
        bgToken.innerRadius,
        bgToken.outerRadius,
        bgToken.midAlphaMin,
        bgToken.midAlphaMax,
        bgToken.hueJitter,
        37,
      ),
      bright: makeLayer(
        bgToken.brightCount,
        bgToken.innerRadius,
        bgToken.outerRadius,
        bgToken.brightAlphaMin,
        bgToken.brightAlphaMax,
        0.06,
        73,
      ),
    }),
    [],
  );

  return (
    <>
      <StarLayer layer={layers.tiny} size={bgToken.tinySize} />
      <StarLayer
        layer={layers.mid}
        size={bgToken.midSize}
        twinkle={{ amp: bgToken.midTwinkleAmp, freq: bgToken.midTwinkleFreq }}
      />
      <StarLayer
        layer={layers.bright}
        size={bgToken.brightSize}
        twinkle={{ amp: bgToken.brightTwinkleAmp, freq: bgToken.brightTwinkleFreq }}
      />
    </>
  );
}
