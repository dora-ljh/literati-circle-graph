export type Dynasty = '唐' | '宋';
export type Relation = '提及' | '寄' | '赠' | '赠别' | '寄和' | '新和' | '和' | '哀挽';

export interface Poet {
  id: string;
  name: string;
  zi?: string;
  hao?: string;
  birth?: number;
  death?: number;
  dynasty: Dynasty;
  bio?: string;
}

export interface PoemEdge {
  source: string;
  target: string;
  relation: Relation;
  poem: {
    title: string;
    body: string;
  };
}

export interface DynastyDataset {
  poets: Poet[];
  edges: PoemEdge[];
}
