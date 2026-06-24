import type { PoemEdge, Poet, Relation } from '../data/types';

export interface RecipientGroup {
  recipientId: string;
  recipientName: string;
  relation: Relation;
  poems: { title: string; body: string }[];
}

export function groupBySender(senderId: string, edges: PoemEdge[], poets: Poet[]): RecipientGroup[] {
  const poetById = new Map(poets.map((p) => [p.id, p]));
  const buckets = new Map<string, { relations: Relation[]; poems: { title: string; body: string }[] }>();

  for (const e of edges) {
    if (e.source !== senderId) continue;
    if (e.target === senderId) continue;
    const bucket = buckets.get(e.target) ?? { relations: [], poems: [] };
    bucket.relations.push(e.relation);
    bucket.poems.push({ title: e.poem.title, body: e.poem.body });
    buckets.set(e.target, bucket);
  }

  const groups: RecipientGroup[] = [];
  for (const [recipientId, bucket] of buckets) {
    const recipient = poetById.get(recipientId);
    if (!recipient) continue;
    const relation = mode(bucket.relations);
    groups.push({
      recipientId,
      recipientName: recipient.name,
      relation,
      poems: bucket.poems,
    });
  }

  groups.sort((a, b) => b.poems.length - a.poems.length);
  return groups;
}

export function totalPoems(senderId: string, edges: PoemEdge[]): number {
  let n = 0;
  for (const e of edges) if (e.source === senderId && e.target !== senderId) n += 1;
  return n;
}

export function totalRecipients(senderId: string, edges: PoemEdge[]): number {
  const set = new Set<string>();
  for (const e of edges) {
    if (e.source !== senderId) continue;
    if (e.target === senderId) continue;
    set.add(e.target);
  }
  return set.size;
}

function mode<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  let best = arr[0];
  let bestCount = 0;
  for (const v of arr) {
    const c = (counts.get(v) ?? 0) + 1;
    counts.set(v, c);
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}
