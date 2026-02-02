import { area as d3Area, curveMonotoneX } from "d3-shape";
import type { DeveloperPoint, ClassifiedPoint, BandPoint, TrendLine, OwnershipTimeRangeKey } from "./ownershipScatterTypes";

export const WIDTH = 700;
export const HEIGHT = 350;
export const MARGIN = { top: 24, right: 24, bottom: 48, left: 64 };

export const NORMAL_COUNT_BY_RANGE: Record<OwnershipTimeRangeKey, number> = {
  "1m": 55,
  "3m": 120,
  "1y": 180,
  max: 220,
};

export const RANGE_SLICE_RATIO: Record<OwnershipTimeRangeKey, number> = {
  "1m": 0.25,
  "3m": 0.5,
  "1y": 0.75,
  max: 1,
};

export function computeRegression(points: DeveloperPoint[]) {
  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.totalKarmaPoints, 0);
  const sumY = points.reduce((acc, p) => acc + p.ownershipPct, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    const dx = p.totalKarmaPoints - meanX;
    const dy = p.ownershipPct - meanY;
    num += dx * dy;
    den += dx * dx;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

export function computeClassifiedPoints(points: DeveloperPoint[]): {
  classified: ClassifiedPoint[];
  slope: number;
  intercept: number;
  stdRes: number;
} {
  const { slope, intercept } = computeRegression(points);
  const withResiduals: ClassifiedPoint[] = points.map((p) => {
    const yPred = slope * p.totalKarmaPoints + intercept;
    const residual = p.ownershipPct - yPred;
    return { ...p, residual, inNormalRange: false };
  });
  const meanRes = withResiduals.reduce((acc, p) => acc + p.residual, 0) / withResiduals.length;
  const variance =
    withResiduals.reduce((acc, p) => acc + (p.residual - meanRes) ** 2, 0) / withResiduals.length;
  const stdRes = Math.sqrt(variance || 1);
  const threshold = 1.5 * stdRes;
  const classified = withResiduals.map((p) => ({
    ...p,
    inNormalRange: Math.abs(p.residual) <= threshold,
  }));
  return { classified, slope, intercept, stdRes };
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function generateSyntheticPoints(range: OwnershipTimeRangeKey): DeveloperPoint[] {
  const points: DeveloperPoint[] = [];
  const normalCount = NORMAL_COUNT_BY_RANGE[range];
  const baseSlope = 0.00025;
  const baseIntercept = 2;

  for (let i = 0; i < normalCount; i++) {
    const r = pseudoRandom(i + 1);
    const kp = 500 + r * 280000;
    const noise = (pseudoRandom(i + 101) - 0.5) * 6;
    const ownership = baseSlope * kp + baseIntercept + noise;
    points.push({
      name: `Dev ${i + 1}`,
      team: `Team ${((i % 5) + 1).toString()}`,
      totalKarmaPoints: kp,
      ownershipPct: Math.max(0, Math.min(80, ownership)),
    });
  }

  const manualOutliers: DeveloperPoint[] = [
    { name: "Sky Wilson 105", team: "Backend", totalKarmaPoints: 5000, ownershipPct: 25 },
    { name: "Alex Davis 495", team: "Backend", totalKarmaPoints: 7000, ownershipPct: 21.6 },
    { name: "Riley Taylor 550", team: "Backend", totalKarmaPoints: 7000, ownershipPct: 17.7 },
    { name: "Avery Patel 340", team: "Backend", totalKarmaPoints: 2000, ownershipPct: 16.6 },
    { name: "Avery Thomas 577", team: "DevOps", totalKarmaPoints: 107000, ownershipPct: 0.7 },
    { name: "Jordan Patel 375", team: "DevOps", totalKarmaPoints: 31000, ownershipPct: 2.4 },
  ];

  return [...points, ...manualOutliers];
}

export type OwnershipChartData = {
  points: (ClassifiedPoint & { cx: number; cy: number })[];
  bandPath: string | undefined;
  xTicks: { value: number; x: number }[];
  yTicks: { value: number; y: number }[];
  xLabelMin: number;
  xLabelMax: number;
  trendLine: TrendLine;
};

export function buildOwnershipChartData(
  data: DeveloperPoint[] | undefined,
  range: OwnershipTimeRangeKey,
  width: number = WIDTH,
  height: number = HEIGHT,
  margin: { top: number; right: number; bottom: number; left: number } = MARGIN
): OwnershipChartData {
  const fullData = data && data.length > 1 ? data : generateSyntheticPoints(range);
  const ratio = data && data.length > 1 ? RANGE_SLICE_RATIO[range] : 1;
  const base = ratio >= 1 ? fullData : fullData.slice(0, Math.max(2, Math.ceil(fullData.length * ratio)));
  const { classified, slope, intercept, stdRes } = computeClassifiedPoints(base);

  const xs = classified.map((p) => p.totalKarmaPoints);
  const ys = classified.map((p) => p.ownershipPct);
  const xMin = Math.min(0, ...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, Math.min(...ys));
  const yMax = Math.max(80, Math.max(...ys));

  const X_TICK_STEP = 50000;
  const xTickValues: number[] = [];
  for (let v = 0; v <= Math.ceil(xMax / X_TICK_STEP) * X_TICK_STEP; v += X_TICK_STEP) {
    xTickValues.push(v);
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = (x: number) =>
    ((x - xMin) / Math.max(1, xMax - xMin)) * innerWidth + margin.left;
  const yScale = (y: number) =>
    height - margin.bottom - ((y - yMin) / Math.max(1, yMax - yMin)) * innerHeight;

  const bandPoints: BandPoint[] = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = xMin + t * (xMax - xMin);
    const center = slope * x + intercept;
    bandPoints.push({
      x,
      yLower: center - 1.5 * stdRes,
      yUpper: center + 1.5 * stdRes,
    });
  }

  const areaGen = d3Area<BandPoint>()
    .x((d) => xScale(d.x))
    .y0((d) => yScale(d.yLower))
    .y1((d) => yScale(d.yUpper))
    .curve(curveMonotoneX);
  const bandPath = areaGen(bandPoints) ?? undefined;

  const yTickCount = 4;
  const yTickValues = Array.from(
    { length: yTickCount + 1 },
    (_, i) => yMin + ((yMax - yMin) * i) / yTickCount
  );

  const scaledPoints = classified.map((p) => ({
    ...p,
    cx: xScale(p.totalKarmaPoints),
    cy: yScale(p.ownershipPct),
  }));

  const yMinLine = slope * xMin + intercept;
  const yMaxLine = slope * xMax + intercept;
  const trendLine: TrendLine = {
    x1: xScale(xMin),
    y1: yScale(yMinLine),
    x2: xScale(xMax),
    y2: yScale(yMaxLine),
  };

  return {
    points: scaledPoints,
    bandPath,
    xTicks: xTickValues.map((v) => ({ value: v, x: xScale(v) })),
    yTicks: yTickValues.map((v) => ({ value: v, y: yScale(v) })),
    xLabelMin: xMin,
    xLabelMax: xMax,
    trendLine,
  };
}
