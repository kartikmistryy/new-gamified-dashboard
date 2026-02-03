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
};

export type TooltipState = {
  show: boolean;
  x: number;
  y: number;
  content: string;
};
