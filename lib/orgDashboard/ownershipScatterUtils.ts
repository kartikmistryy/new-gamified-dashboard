import { area as d3Area, curveMonotoneX } from "d3-shape";
import type { DeveloperPoint, ClassifiedPoint, BandPoint, TrendLine, OwnershipTimeRangeKey } from "./ownershipScatterTypes";

export const WIDTH = 720;
export const HEIGHT = 420;
export const MARGIN = { top: 24, right: 24, bottom: 48, left: 64 };

export const X_AXIS_MAX = 300000;
export const Y_AXIS_MAX = 80;
export const X_TICK_STEP = 50000;

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
    return { ...p, residual, inNormalRange: false , outlierType: null};
  });
  const meanRes = withResiduals.reduce((acc, p) => acc + p.residual, 0) / withResiduals.length;
  const variance =
    withResiduals.reduce((acc, p) => acc + (p.residual - meanRes) ** 2, 0) / withResiduals.length;
  const stdRes = Math.sqrt(variance || 1);
  const threshold = 1.5 * stdRes;
  const classified = withResiduals.map((p) => {
    const inNormalRange = Math.abs(p.residual) <= threshold;
    const outlierType: "high" | "low" | null = inNormalRange
      ? null
      : p.residual > 0
        ? "high"
        : "low";
    return { ...p, inNormalRange, outlierType };
  });
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
    { name: "Jamie Lee 802", team: "Platform", totalKarmaPoints: 15000, ownershipPct: 38 },
    { name: "Morgan Kim 803", team: "Frontend", totalKarmaPoints: 40000, ownershipPct: 45 },
    { name: "Sam Chen 801", team: "Platform", totalKarmaPoints: 280000, ownershipPct: 72 },
    { name: "Drew Walsh 901", team: "Platform", totalKarmaPoints: 250000, ownershipPct: 78 },
    { name: "Quinn Hayes 902", team: "Backend", totalKarmaPoints: 220000, ownershipPct: 70 },
    { name: "Blake Reed H1", team: "Frontend", totalKarmaPoints: 10000, ownershipPct: 22 },
    { name: "Jordan Reed H2", team: "Backend", totalKarmaPoints: 12000, ownershipPct: 24 },
    { name: "Casey Reed H3", team: "Platform", totalKarmaPoints: 8000, ownershipPct: 18 },
    { name: "Riley Reed H4", team: "DevOps", totalKarmaPoints: 18000, ownershipPct: 28 },
    { name: "Avery Reed H5", team: "Frontend", totalKarmaPoints: 22000, ownershipPct: 26 },
    { name: "Sam Reed H6", team: "Backend", totalKarmaPoints: 35000, ownershipPct: 42 },
    { name: "Quinn Reed H7", team: "Platform", totalKarmaPoints: 45000, ownershipPct: 48 },
    { name: "Drew Reed H8", team: "DevOps", totalKarmaPoints: 30000, ownershipPct: 38 },
    { name: "Morgan Reed H9", team: "Frontend", totalKarmaPoints: 48000, ownershipPct: 52 },
    { name: "Sky Reed H10", team: "Backend", totalKarmaPoints: 300000, ownershipPct: 75 },
    { name: "Avery Thomas 577", team: "DevOps", totalKarmaPoints: 107000, ownershipPct: 0.7 },
    { name: "Jordan Patel 375", team: "DevOps", totalKarmaPoints: 31000, ownershipPct: 2.4 },
    { name: "Reese Blake 903", team: "DevOps", totalKarmaPoints: 240000, ownershipPct: 8 },
    { name: "Casey Ford 904", team: "Frontend", totalKarmaPoints: 265000, ownershipPct: 5 },
    { name: "Low A", team: "Backend", totalKarmaPoints: 20000, ownershipPct: 5 },
    { name: "Low B", team: "DevOps", totalKarmaPoints: 40000, ownershipPct: 3 },
    { name: "Low C", team: "Frontend", totalKarmaPoints: 95000, ownershipPct: 18 },
    { name: "Low D", team: "Platform", totalKarmaPoints: 100000, ownershipPct: 0 },
    { name: "Low E", team: "Backend", totalKarmaPoints: 155000, ownershipPct: 9 },
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

  const xMin = 0;
  const xMax = X_AXIS_MAX;
  const yMin = 0;
  const yMax = Y_AXIS_MAX;

  const xTickValues: number[] = [];
  for (let v = 0; v <= xMax; v += X_TICK_STEP) {
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
      yLower: Math.max(yMin, center - 1.5 * stdRes),
      yUpper: Math.min(yMax, center + 1.5 * stdRes),
    });
  }

  const areaGen = d3Area<BandPoint>()
    .x((d) => xScale(d.x))
    .y0((d) => yScale(d.yLower))
    .y1((d) => yScale(d.yUpper))
    .curve(curveMonotoneX);
  const bandPath = areaGen(bandPoints) ?? undefined;

  const yTickValues = [0, 20, 40, 60, 80];

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
