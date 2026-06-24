import type { Dynasty, DynastyDataset } from './types';
import { songData } from './song';
import { tangData } from './tang';

// 1. 过滤掉引用了不存在 poet id 的 edge（防止数据笔误抛 d3-force "node not found"）
// 2. 过滤孤立 poet：只保留至少出现在一条 valid edge 上的诗人
function prune(raw: DynastyDataset): DynastyDataset {
  const validIds = new Set(raw.poets.map((p) => p.id));
  const validEdges = raw.edges.filter(
    (e) => validIds.has(e.source) && validIds.has(e.target),
  );
  if (import.meta.env.DEV && validEdges.length !== raw.edges.length) {
    const dropped = raw.edges.filter(
      (e) => !validIds.has(e.source) || !validIds.has(e.target),
    );
    const ids = new Set<string>();
    for (const e of dropped) {
      if (!validIds.has(e.source)) ids.add(e.source);
      if (!validIds.has(e.target)) ids.add(e.target);
    }
    console.warn(
      `[data] 丢弃 ${dropped.length} 条引用了未声明 poet id 的 edge，缺失 id：`,
      Array.from(ids),
    );
  }
  const used = new Set<string>();
  for (const e of validEdges) {
    used.add(e.source);
    used.add(e.target);
  }
  return {
    poets: raw.poets.filter((p) => used.has(p.id)),
    edges: validEdges,
  };
}

export function getDataset(dynasty: Dynasty): DynastyDataset {
  return prune(dynasty === '宋' ? songData : tangData);
}

export type { Dynasty, DynastyDataset, Poet, PoemEdge, Relation } from './types';
