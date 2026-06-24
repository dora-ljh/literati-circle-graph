import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  forceZ,
  type SimulationLink,
  type SimulationNode,
} from 'd3-force-3d';
import type { PoemEdge, Poet } from '../../data/types';

export interface PositionedPoet extends Poet {
  x: number;
  y: number;
  z: number;
  weight: number;
}

export type Axis = 'horizontal' | 'vertical';

export interface LayoutOptions {
  axis: Axis;
  yFlip: boolean;
}

interface ForceNode extends SimulationNode {
  id: string;
  poet: Poet;
  weight: number;
  axisCoord: number;        // 时代轴坐标，按 birth 派生
}

interface ForceLink extends SimulationLink<ForceNode> {
  weight: number;
}

const AXIS_RANGE = 150;     // 时代轴跨度（缩小 25% → 节点向中心收拢）
const AXIS_STRENGTH = 0.25; // 沿 birth 轴拉，加强后北宋/南宋分层仍清晰
const Z_FLATTEN_STRENGTH = 0.06;  // 略加 Z 拍扁，整图偏向饼形

function eraCoord(birth: number | undefined, minBirth: number, maxBirth: number): number {
  if (birth === undefined) return 0;
  const span = Math.max(1, maxBirth - minBirth);
  return ((birth - minBirth) / span - 0.5) * AXIS_RANGE;
}

export function layoutForce(
  poets: Poet[],
  edges: PoemEdge[],
  opts: LayoutOptions = { axis: 'horizontal', yFlip: false },
): PositionedPoet[] {
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  for (const e of edges) {
    if (e.source === e.target) continue;
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    outDegree.set(e.source, (outDegree.get(e.source) ?? 0) + 1);
  }

  // 时代范围：从有 birth 的诗人推
  const births = poets.map((p) => p.birth).filter((y): y is number => typeof y === 'number');
  const minBirth = births.length ? Math.min(...births) : 1000;
  const maxBirth = births.length ? Math.max(...births) : 1300;

  const nodes: ForceNode[] = poets.map((p) => ({
    id: p.id,
    poet: p,
    weight: (inDegree.get(p.id) ?? 0) + (outDegree.get(p.id) ?? 0),
    axisCoord: eraCoord(p.birth, minBirth, maxBirth),
  }));

  const pairWeight = new Map<string, number>();
  for (const e of edges) {
    if (e.source === e.target) continue;
    const k = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
    pairWeight.set(k, (pairWeight.get(k) ?? 0) + 1);
  }

  const links: ForceLink[] = [];
  const seen = new Set<string>();
  for (const e of edges) {
    if (e.source === e.target) continue;
    const k = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
    if (seen.has(k)) continue;
    seen.add(k);
    links.push({ source: e.source, target: e.target, weight: pairWeight.get(k) ?? 1 });
  }

  const sim = forceSimulation<ForceNode, ForceLink>(nodes, 3)
    .force(
      'charge',
      // 斥力削减：苏轼（w≈300）从 -2820 → -1555，整图收拢约 1/3
      forceManyBody<ForceNode>().strength((n) => -55 - n.weight * 5),
    )
    .force(
      'link',
      forceLink<ForceNode, ForceLink>(links)
        .id((n) => n.id)
        .distance((l) => 60 / Math.sqrt(l.weight))    // 连线节点距离缩短 37%
        .strength((l) => Math.min(1, l.weight / 4)),  // 拉力增强
    )
    .force('center', forceCenter<ForceNode>(0, 0, 0).strength(0.12))
    .force(
      'collide',
      // 碰撞半径缩小，允许节点更紧凑
      forceCollide<ForceNode>((n) => 3 + Math.sqrt(n.weight) * 0.65).iterations(2),
    )
    .alphaDecay(0.02)
    .velocityDecay(0.4);

  // 时代轴叠加：横向→沿 X 拉、纵向→沿 Y 拉
  if (opts.axis === 'horizontal') {
    sim.force('era-x', forceX<ForceNode>((n) => n.axisCoord).strength(AXIS_STRENGTH));
  } else {
    sim.force('era-y', forceY<ForceNode>((n) => n.axisCoord).strength(AXIS_STRENGTH));
  }

  // Z 方向贴 0 平面，整图趋向扁圆饼形（默认视角看像球团，旋转时仍可见层次）
  sim.force('flatten-z', forceZ<ForceNode>(0).strength(Z_FLATTEN_STRENGTH));

  sim.tick(400);
  sim.stop();

  return nodes.map((n) => ({
    ...n.poet,
    x: n.x ?? 0,
    y: (n.y ?? 0) * (opts.yFlip ? -1 : 1),
    z: n.z ?? 0,
    weight: n.weight,
  }));
}
