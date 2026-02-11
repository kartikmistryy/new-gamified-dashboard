import { line as d3Line, curveMonotoneX } from "d3-shape";
import type { OrgPerformanceDataPoint } from "../charts/performanceChart/orgPerformanceChartData";
import type { ChartEvent, ChartAnnotation } from "../types";

export const CHART_WIDTH = 900;
export const CHART_HEIGHT = 420;
export const MARGIN = { top: 70, right: 30, bottom: 50, left: 60 };

export type OrgPerformanceChartGeometry = {
  xScale: (date: string) => number;
  yScale: (value: number) => number;
  linePath: string;
  innerWidth: number;
  innerHeight: number;
  xMin: Date;
  xMax: Date;
  holidays: Array<ChartEvent & { x: number; closestDate: string }>;
  annotations: Array<ChartAnnotation & { x: number; y: number; dataPoint: OrgPerformanceDataPoint }>;
  xTicks: string[];
  yTicks: number[];
};

function findClosestDateIndex(data: OrgPerformanceDataPoint[], targetDate: string): number {
  const targetTime = new Date(targetDate).getTime();
  let closestIdx = 0;
  let minDiff = Infinity;
  data.forEach((d, i) => {
    const diff = Math.abs(new Date(d.date).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  });
  return closestIdx;
}

export function buildOrgPerformanceChartGeometry(
  data: OrgPerformanceDataPoint[],
  holidays: ChartEvent[],
  annotations: ChartAnnotation[],
  width: number = CHART_WIDTH,
  height: number = CHART_HEIGHT,
  margin: { top: number; right: number; bottom: number; left: number } = MARGIN
): OrgPerformanceChartGeometry {
  if (!data.length) {
    return {
      xScale: () => 0,
      yScale: () => 0,
      linePath: "",
      innerWidth: 0,
      innerHeight: 0,
      xMin: new Date(),
      xMax: new Date(),
      holidays: [],
      annotations: [],
      xTicks: [],
      yTicks: [0, 30, 40, 60, 70, 100],
    };
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xMin = new Date(data[0].date);
  const xMax = new Date(data[data.length - 1].date);
  const xMinTime = xMin.getTime();
  const xMaxTime = xMax.getTime();
  const xRange = xMaxTime - xMinTime || 1;

  const xScale = (date: string) => {
    const t = (new Date(date).getTime() - xMinTime) / xRange;
    return margin.left + t * innerWidth;
  };

  const yScale = (value: number) => {
    const t = Math.max(0, Math.min(100, value)) / 100;
    return margin.top + (1 - t) * innerHeight;
  };

  const lineGen = d3Line<OrgPerformanceDataPoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);
  const linePath = lineGen(data) ?? "";

  const holidaysWithX = holidays.map((holiday) => {
    const idx = findClosestDateIndex(data, holiday.date);
    return { ...holiday, x: xScale(data[idx].date), closestDate: data[idx].date };
  });

  const annotationsWithXY = annotations.map((ann) => {
    const idx = findClosestDateIndex(data, ann.date);
    const dataPoint = data[idx];
    return {
      ...ann,
      x: xScale(dataPoint.date),
      y: yScale(dataPoint.value),
      dataPoint,
    };
  });

  const seenMonth = new Set<string>();
  const xTicks = data
    .filter((d) => {
      const key = `${new Date(d.date).getMonth()}-${new Date(d.date).getFullYear()}`;
      if (seenMonth.has(key)) return false;
      seenMonth.add(key);
      return true;
    })
    .filter((_, i) => i % 2 === 0)
    .map((d) => d.date);

  const yTicks = [0, 30, 40, 60, 70, 100];

  return {
    xScale,
    yScale,
    linePath,
    innerWidth,
    innerHeight,
    xMin,
    xMax,
    holidays: holidaysWithX,
    annotations: annotationsWithXY,
    xTicks,
    yTicks,
  };
}
