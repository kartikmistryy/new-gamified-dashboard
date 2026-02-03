import * as d3 from "d3";
import type { SpofDataPoint, SpofTeamConfig } from "./spofMockData";
import type { SpofChartDimensions, StackedBinData } from "./spofChartTypes";

// Re-export types and draw utils for convenience
export type { SpofChartDimensions, SpofChartScales, StackedBinData } from "./spofChartTypes";
export {
  drawShadedRegions,
  drawStackedBars,
  drawNormalCurve,
  drawSigmaLines,
  drawAxes,
  drawTitle,
  drawLegend,
} from "./spofChartDrawUtils";

/** Calculate chart dimensions based on container width */
export function getChartDimensions(containerWidth: number): SpofChartDimensions {
  const width = containerWidth;
  const height = 400;
  const margin = { top: 60, right: 180, bottom: 60, left: 60 };
  return {
    width,
    height,
    margin,
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom,
  };
}

/** Create stacked histogram data from SPOF data points */
export function createStackedHistogramData(
  data: SpofDataPoint[],
  visibleTeamConfigs: SpofTeamConfig[],
  xScale: d3.ScaleLinear<number, number>
): { stackedData: StackedBinData[]; maxCount: number; binWidth: number } {
  const binGenerator = d3.bin<SpofDataPoint, number>()
    .value((d) => d.score)
    .domain([0, 6])
    .thresholds(d3.range(0, 6.2, 0.2));

  const allBins = binGenerator(data);
  const binWidth = xScale(0.2) - xScale(0);
  const stackedData: StackedBinData[] = [];

  for (const bin of allBins) {
    const teamCounts: Record<string, number> = {};
    for (const d of bin) {
      teamCounts[d.team] = (teamCounts[d.team] || 0) + 1;
    }

    let cumulative = 0;
    const stacks: { team: string; y0: number; y1: number }[] = [];

    for (const team of [...visibleTeamConfigs].reverse()) {
      const count = teamCounts[team.name] || 0;
      if (count > 0) {
        stacks.push({ team: team.name, y0: cumulative, y1: cumulative + count });
        cumulative += count;
      }
    }

    stackedData.push({ x0: bin.x0 ?? 0, x1: bin.x1 ?? 0, stacks });
  }

  const maxCount = d3.max(stackedData, (d) => d3.max(d.stacks, (s) => s.y1)) || 70;
  return { stackedData, maxCount, binWidth };
}

/** Generate normal distribution curve data */
export function generateNormalCurveData(
  mean: number,
  std: number,
  dataLength: number
): [number, number][] {
  const normalData: [number, number][] = [];
  for (let x = 0; x <= 6; x += 0.05) {
    const pdf = (1 / (std * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
    const scaledPdf = pdf * dataLength * 0.2;
    normalData.push([x, scaledPdf]);
  }
  return normalData;
}
