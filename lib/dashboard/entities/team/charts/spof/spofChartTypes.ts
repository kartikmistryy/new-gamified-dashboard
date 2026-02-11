import type * as d3 from "d3";

export type SpofChartDimensions = {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
};

export type SpofChartScales = {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
};

export type StackedBinData = {
  x0: number;
  x1: number;
  stacks: { team: string; y0: number; y1: number }[];
};
