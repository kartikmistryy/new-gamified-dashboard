import type { D3TooltipController } from "@/lib/chartTooltip";

export interface SkillData {
  name: string;
  value?: number;
  frequency?: number;
  children?: SkillData[];
}

export type D3HierarchyNode = {
  data: SkillData;
  value?: number;
  depth: number;
  height: number;
  parent: D3HierarchyNode | null;
  children?: D3HierarchyNode[];
  x?: number;
  y?: number;
  r?: number;
  polygon?: [number, number][];
  leaves(): D3HierarchyNode[];
  sum(value: (d: SkillData) => number): D3HierarchyNode;
  sort(compare: (a: { value?: number }, b: { value?: number }) => number): D3HierarchyNode;
};

export type SkillTooltipController = Pick<D3TooltipController, "show" | "move" | "hide">;

// D3 types - using a more flexible approach to work with actual D3 library
/* eslint-disable @typescript-eslint/no-explicit-any */
export type D3Selection = any;

export type D3Library = {
  select(selector: any): any;
  selectAll(selector: any): any;
  hierarchy(data: SkillData): D3HierarchyNode;
  voronoiTreemap?: () => any;
  polygonArea(polygon: [number, number][]): number;
  polygonCentroid(polygon: [number, number][]): [number, number];
  color(color: string): { opacity: number; formatRgb(): string } | null;
};
