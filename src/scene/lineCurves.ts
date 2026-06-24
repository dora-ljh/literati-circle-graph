// 9 种连接线生成策略，用户可在 UI 里切换比较视觉
import { CatmullRomCurve3, CubicBezierCurve3, QuadraticBezierCurve3, Vector3 } from 'three';
import { createNoise2D, createNoise3D, type NoiseFunction2D, type NoiseFunction3D } from 'simplex-noise';
import { line as lineToken } from '../styles/tokens';

export type LineStyle =
  | 'straight'    // 纯直线 a→b
  | 'quadratic'   // 二次贝塞尔单弧（最早的弧线版本）
  | 'original'    // 4 控制点 Catmull-Rom + 共享 bendDir
  | 'denseCps'    // 8 控制点 Catmull-Rom + 每点独立法向扰动（方向 1）
  | 'fbm'         // hash-based 1D value noise + 3 层 fBm（方向 2，推荐）
  | 'simplex'     // simplex-noise 库 noise2D（方向 3）
  | 'sineSum'     // 多频正弦叠加（方向 4）
  | 'flowField'   // 3D simplex 流场积分（方向 5）
  | 'neural';     // 三次贝塞尔，神经网络风格

export const LINE_STYLES: { id: LineStyle; label: string; brief: string }[] = [
  { id: 'straight',  label: '直线',    brief: '纯 a→b 直线' },
  { id: 'quadratic', label: '弧线',    brief: '二次贝塞尔单弧（最早实现）' },
  { id: 'original',  label: '原始',    brief: '4 控制点 Catmull-Rom，单弓' },
  { id: 'denseCps',  label: '多点',    brief: '8 控制点独立扰动' },
  { id: 'fbm',       label: 'fBm',     brief: '自实现 fBm 噪声（推荐）' },
  { id: 'simplex',   label: 'Simplex', brief: 'Simplex 噪声库' },
  { id: 'sineSum',   label: '正弦',    brief: '三层正弦叠加' },
  { id: 'flowField', label: '流场',    brief: '3D 流场积分' },
  { id: 'neural',    label: '神经',    brief: '三次贝塞尔神经网络风格' },
];

// ─── 工具 ──────────────────────────────────────────────────────────

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hash01(seed: number, i: number): number {
  let x = (seed ^ Math.imul(i, 374761393)) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0x85ebca6b) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 0x100000000;
}

function valueNoise1D(seed: number, t: number, frequency: number): number {
  const tf = t * frequency;
  const i0 = Math.floor(tf);
  const f = tf - i0;
  const a = hash01(seed, i0) * 2 - 1;
  const b = hash01(seed, i0 + 1) * 2 - 1;
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
}

function fBm(seed: number, t: number): number {
  return (
    lineToken.noiseAmp1 * valueNoise1D(seed, t, lineToken.noiseFreq1) +
    lineToken.noiseAmp2 * valueNoise1D(seed, t, lineToken.noiseFreq2) +
    lineToken.noiseAmp3 * valueNoise1D(seed, t, lineToken.noiseFreq3)
  );
}

// 共用：算 dirN / lateral / binormal / bendDir / lineMag
interface BasisData {
  dirN: Vector3;
  lateral: Vector3;
  binormal: Vector3;
  bendDir: Vector3;
  lineMag: number;
  dist: number;
  pairSeed: number;
  edgeSeed: number;
}
function computeBasis(a: Vector3, b: Vector3, pairKey: string, perEdgeKey: string): BasisData | null {
  const dir = b.clone().sub(a);
  const dist = dir.length();
  if (dist < 1e-3) return null;

  const dirN = dir.clone().normalize();
  const upGuess = Math.abs(dirN.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
  const lateral = new Vector3().crossVectors(dirN, upGuess).normalize();
  const binormal = new Vector3().crossVectors(dirN, lateral).normalize();

  const pairSeed = hashStr(pairKey);
  const edgeSeed = hashStr(perEdgeKey);

  const baseAngle = (pairSeed % 360) * (Math.PI / 180);
  const angleJitter = (((edgeSeed >>> 4) % 1000) / 1000 - 0.5) * (Math.PI / 5);
  const lineAngle = baseAngle + angleJitter;
  const bendDir = lateral.clone().multiplyScalar(Math.cos(lineAngle))
    .addScaledVector(binormal, Math.sin(lineAngle));

  const baseMagT = ((pairSeed >>> 16) % 1000) / 1000;
  const baseMag = (lineToken.controlOffsetMin
    + baseMagT * (lineToken.controlOffsetMax - lineToken.controlOffsetMin)) * dist;
  const magJitter = (((edgeSeed >>> 12) % 1000) / 1000 - 0.5) * 0.8;
  const lineMag = baseMag * (1 + magJitter);

  return { dirN, lateral, binormal, bendDir, lineMag, dist, pairSeed, edgeSeed };
}

// ─── 策略 0a: straight — 纯直线 ───────────────────────────────────
function buildStraight(a: Vector3, b: Vector3): Vector3[] {
  return [a.clone(), b.clone()];
}

// ─── 策略 0b: quadratic — 二次贝塞尔单弧（最早的弧线实现）─────────
function buildQuadratic(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { bendDir, lineMag } = basis;
  // 中点沿 bendDir 偏置（无 envelope 因为 quadratic 自然两端归零）
  const mid = a.clone().lerp(b, 0.5).addScaledVector(bendDir, lineMag * 1.4);
  return new QuadraticBezierCurve3(a, mid, b).getPoints(segments);
}

// ─── 策略 1: original — 4 控制点 Catmull-Rom + 共享 bendDir ────────
const ORIG_CP_TS = [0.15, 0.35, 0.55, 0.78];
function buildOriginal(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist, pairSeed, edgeSeed } = basis;
  const zSign = (((pairSeed >>> 7) % 1000) / 1000 - 0.5) * 2;
  void lateral; void binormal;

  const points: Vector3[] = [a.clone()];
  for (let i = 0; i < ORIG_CP_TS.length; i += 1) {
    const t = ORIG_CP_TS[i];
    const base = a.clone().lerp(b, t);
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);
    const cpSeed = (edgeSeed ^ Math.imul(i + 1, 2654435761)) >>> 0;
    const localStrength = 0.75 + ((cpSeed >>> 4) % 1000) / 1000 * 0.25;

    base.addScaledVector(bendDir, lineMag * envelope * localStrength);
    base.z += zSign * dist * 0.08 * envelope * localStrength;
    points.push(base);
  }
  points.push(b.clone());

  return new CatmullRomCurve3(points, false, 'catmullrom', 0.5).getPoints(segments);
}

// ─── 策略 2: denseCps — 8 控制点，每点独立法平面扰动 ──────────────
function buildDenseCps(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist, edgeSeed } = basis;
  const cpCount = 8;
  const points: Vector3[] = [a.clone()];

  for (let i = 1; i <= cpCount; i += 1) {
    const t = i / (cpCount + 1);
    const base = a.clone().lerp(b, t);
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);

    // 主弓（保留趋势）
    base.addScaledVector(bendDir, lineMag * envelope * 0.6);

    // 每点法平面独立 hash 方向 + 1-3% 幅度
    const cpSeed = (edgeSeed ^ Math.imul(i, 2654435761)) >>> 0;
    const angle = (cpSeed % 360) * (Math.PI / 180);
    const mag = (0.01 + ((cpSeed >>> 8) % 1000) / 1000 * 0.025) * dist;
    base.addScaledVector(lateral, Math.cos(angle) * mag * envelope);
    base.addScaledVector(binormal, Math.sin(angle) * mag * envelope);
    points.push(base);
  }
  points.push(b.clone());

  return new CatmullRomCurve3(points, false, 'catmullrom', 0.5).getPoints(segments);
}

// ─── 策略 3: fbm — value noise + 3 层 fBm ─────────────────────────
function buildFbm(a: Vector3, b: Vector3, basis: BasisData, segments: number, perEdgeKey: string): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist } = basis;
  const noiseSeedL = hashStr(`${perEdgeKey}/L`);
  const noiseSeedB = hashStr(`${perEdgeKey}/B`);
  const noiseAmp = lineToken.noiseAmp * dist;

  const points: Vector3[] = new Array(segments + 1);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);
    const p = a.clone().lerp(b, t);
    p.addScaledVector(bendDir, lineMag * envelope);
    p.addScaledVector(lateral, fBm(noiseSeedL, t) * noiseAmp * envelope);
    p.addScaledVector(binormal, fBm(noiseSeedB, t) * noiseAmp * envelope);
    points[i] = p;
  }
  return points;
}

// ─── 策略 4: simplex — simplex-noise noise2D ──────────────────────
let simplexNoise2D: NoiseFunction2D | null = null;
function getSimplex2D(): NoiseFunction2D {
  if (!simplexNoise2D) simplexNoise2D = createNoise2D(() => 0.42); // 固定 seed
  return simplexNoise2D;
}
function buildSimplex(a: Vector3, b: Vector3, basis: BasisData, segments: number, perEdgeKey: string): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist } = basis;
  const noise = getSimplex2D();
  const seedL = hashStr(`${perEdgeKey}/L`) / 0xffffffff * 1000;
  const seedB = hashStr(`${perEdgeKey}/B`) / 0xffffffff * 1000;
  const noiseAmp = lineToken.noiseAmp * dist;

  // simplex 多频叠加：用 fBm 风格采样
  const fBmSimplex = (yOffset: number, t: number): number =>
    1.0  * noise(t * 2.0,  yOffset) +
    0.5  * noise(t * 5.0,  yOffset + 100) +
    0.25 * noise(t * 11.0, yOffset + 200);

  const points: Vector3[] = new Array(segments + 1);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);
    const p = a.clone().lerp(b, t);
    p.addScaledVector(bendDir, lineMag * envelope);
    p.addScaledVector(lateral, fBmSimplex(seedL, t) * noiseAmp * envelope);
    p.addScaledVector(binormal, fBmSimplex(seedB, t) * noiseAmp * envelope);
    points[i] = p;
  }
  return points;
}

// ─── 策略 5: sineSum — 多频正弦叠加 ──────────────────────────────
function buildSineSum(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist, edgeSeed } = basis;
  const TAU = Math.PI * 2;
  const phase = (n: number) => (hash01(edgeSeed, n) * 2 - 1) * Math.PI;
  const phiL1 = phase(1), phiL2 = phase(2), phiL3 = phase(3);
  const phiB1 = phase(4), phiB2 = phase(5), phiB3 = phase(6);
  const noiseAmp = lineToken.noiseAmp * dist;

  const points: Vector3[] = new Array(segments + 1);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);
    const p = a.clone().lerp(b, t);
    p.addScaledVector(bendDir, lineMag * envelope);

    const sL = 1.0 * Math.sin(TAU * t * 2 + phiL1)
             + 0.5 * Math.sin(TAU * t * 5 + phiL2)
             + 0.25 * Math.sin(TAU * t * 11 + phiL3);
    const sB = 1.0 * Math.sin(TAU * t * 2 + phiB1)
             + 0.5 * Math.sin(TAU * t * 5 + phiB2)
             + 0.25 * Math.sin(TAU * t * 11 + phiB3);
    p.addScaledVector(lateral, sL * noiseAmp * envelope);
    p.addScaledVector(binormal, sB * noiseAmp * envelope);
    points[i] = p;
  }
  return points;
}

// ─── 策略 6: flowField — 3D simplex 流场积分 ─────────────────────
let simplexNoise3D: NoiseFunction3D | null = null;
function getSimplex3D(): NoiseFunction3D {
  if (!simplexNoise3D) simplexNoise3D = createNoise3D(() => 0.71);
  return simplexNoise3D;
}
function buildFlowField(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { lateral, binormal, bendDir, lineMag, dist } = basis;
  const noise = getSimplex3D();
  const fieldFreq = 0.015;        // 流场空间频率
  const noiseAmp = lineToken.noiseAmp * dist;

  const points: Vector3[] = new Array(segments + 1);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.55);
    const p = a.clone().lerp(b, t);
    p.addScaledVector(bendDir, lineMag * envelope);

    // 在 (px, py, pz) 处采样 3D simplex 得到一个标量风场强度，投到法平面
    const fL = noise(p.x * fieldFreq, p.y * fieldFreq, p.z * fieldFreq);
    const fB = noise(p.x * fieldFreq + 100, p.y * fieldFreq + 100, p.z * fieldFreq + 100);
    p.addScaledVector(lateral, fL * noiseAmp * envelope);
    p.addScaledVector(binormal, fB * noiseAmp * envelope);
    points[i] = p;
  }
  return points;
}

// ─── 策略 7: neural — 三次贝塞尔，神经网络风格 ───────────────────
function buildNeural(a: Vector3, b: Vector3, basis: BasisData, segments: number): Vector3[] {
  const { dirN, lateral, edgeSeed, dist } = basis;
  // P1 / P2 在 a / b 附近沿 source-target 方向延伸 → "切线水平"出节点
  // 加微弱横向扰动让多条线区分
  const lateralAmp = (((edgeSeed >>> 8) % 1000) / 1000 - 0.5) * 0.06 * dist;
  const cp1 = a.clone().addScaledVector(dirN, dist * 0.45)
    .addScaledVector(lateral, lateralAmp);
  const cp2 = b.clone().addScaledVector(dirN, -dist * 0.45)
    .addScaledVector(lateral, lateralAmp);
  return new CubicBezierCurve3(a, cp1, cp2, b).getPoints(segments);
}

// ─── 分发器 ───────────────────────────────────────────────────────

export function buildEdgeCurve(
  style: LineStyle,
  a: Vector3,
  b: Vector3,
  pairKey: string,
  perEdgeKey: string,
  segments: number,
): Vector3[] {
  const basis = computeBasis(a, b, pairKey, perEdgeKey);
  if (!basis) return [a.clone(), b.clone()];

  switch (style) {
    case 'straight':   return buildStraight(a, b);
    case 'quadratic':  return buildQuadratic(a, b, basis, segments);
    case 'original':   return buildOriginal(a, b, basis, segments);
    case 'denseCps':   return buildDenseCps(a, b, basis, segments);
    case 'fbm':        return buildFbm(a, b, basis, segments, perEdgeKey);
    case 'simplex':    return buildSimplex(a, b, basis, segments, perEdgeKey);
    case 'sineSum':    return buildSineSum(a, b, basis, segments);
    case 'flowField':  return buildFlowField(a, b, basis, segments);
    case 'neural':     return buildNeural(a, b, basis, segments);
  }
}
