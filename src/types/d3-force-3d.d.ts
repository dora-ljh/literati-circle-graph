declare module 'd3-force-3d' {
  export interface SimulationNode {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLink<N> {
    source: string | number | N;
    target: string | number | N;
  }

  export interface Force<N> {
    (alpha?: number): void;
    initialize?: (nodes: N[]) => void;
  }

  export interface Simulation<N extends SimulationNode, L extends SimulationLink<N>> {
    nodes(): N[];
    nodes(nodes: N[]): this;
    force(name: string): Force<N> | undefined;
    force(name: string, force: Force<N> | null): this;
    alpha(value: number): this;
    alphaTarget(value: number): this;
    alphaDecay(value: number): this;
    velocityDecay(value: number): this;
    tick(iterations?: number): this;
    stop(): this;
    restart(): this;
    on(event: string, listener: () => void): this;
    numDimensions(n: 1 | 2 | 3): this;
    links(): L[];
    links(links: L[]): this;
  }

  export function forceSimulation<N extends SimulationNode, L extends SimulationLink<N> = SimulationLink<N>>(
    nodes?: N[],
    numDimensions?: 1 | 2 | 3,
  ): Simulation<N, L>;

  export interface ManyBodyForce<N> extends Force<N> {
    strength(): (node: N, i: number, nodes: N[]) => number;
    strength(strength: number | ((node: N, i: number, nodes: N[]) => number)): this;
    distanceMin(value: number): this;
    distanceMax(value: number): this;
  }
  export function forceManyBody<N extends SimulationNode>(): ManyBodyForce<N>;

  export interface LinkForce<N, L> extends Force<N> {
    links(): L[];
    links(links: L[]): this;
    id(idAccessor: (node: N) => string | number): this;
    distance(): (link: L, i: number, links: L[]) => number;
    distance(distance: number | ((link: L, i: number, links: L[]) => number)): this;
    strength(strength: number | ((link: L, i: number, links: L[]) => number)): this;
  }
  export function forceLink<N extends SimulationNode, L extends SimulationLink<N> = SimulationLink<N>>(
    links?: L[],
  ): LinkForce<N, L>;

  export interface CenterForce<N> extends Force<N> {
    x(value: number): this;
    y(value: number): this;
    z(value: number): this;
    strength(value: number): this;
  }
  export function forceCenter<N extends SimulationNode>(x?: number, y?: number, z?: number): CenterForce<N>;

  export interface CollideForce<N> extends Force<N> {
    radius(radius: number | ((node: N, i: number, nodes: N[]) => number)): this;
    strength(strength: number): this;
    iterations(iterations: number): this;
  }
  export function forceCollide<N extends SimulationNode>(
    radius?: number | ((node: N, i: number, nodes: N[]) => number),
  ): CollideForce<N>;

  export interface AxisForce<N> extends Force<N> {
    x(value: number | ((node: N, i: number, nodes: N[]) => number)): this;
    y(value: number | ((node: N, i: number, nodes: N[]) => number)): this;
    z(value: number | ((node: N, i: number, nodes: N[]) => number)): this;
    strength(value: number | ((node: N, i: number, nodes: N[]) => number)): this;
  }
  export function forceX<N extends SimulationNode>(
    x?: number | ((node: N, i: number, nodes: N[]) => number),
  ): AxisForce<N>;
  export function forceY<N extends SimulationNode>(
    y?: number | ((node: N, i: number, nodes: N[]) => number),
  ): AxisForce<N>;
  export function forceZ<N extends SimulationNode>(
    z?: number | ((node: N, i: number, nodes: N[]) => number),
  ): AxisForce<N>;
}
