import type { PoemEdge, Poet } from '../data/types';

export interface RankedPoet {
  poet: Poet;
  count: number;
}

export function computeInDegree(edges: PoemEdge[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of edges) {
    if (e.source === e.target) continue;
    m.set(e.target, (m.get(e.target) ?? 0) + 1);
  }
  return m;
}

export function computeOutDegree(edges: PoemEdge[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of edges) {
    if (e.source === e.target) continue;
    m.set(e.source, (m.get(e.source) ?? 0) + 1);
  }
  return m;
}

export function rankBy(poets: Poet[], degree: Map<string, number>, limit?: number): RankedPoet[] {
  const ranked = poets
    .map((p) => ({ poet: p, count: degree.get(p.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
}
