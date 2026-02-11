/** SPOF Distribution Chart Utilities */

import type { SpofDataPoint } from "../../mocks/spofMockData";

/** Create histogram bins for stacked bar chart */
export function createHistogramBins(data: SpofDataPoint[], visibleTeams: string[], binSize: number = 0.3) {
  const bins: Record<string, Record<string, number>> = {};
  const numBins = Math.ceil(6 / binSize);

  for (let i = 0; i < numBins; i++) {
    const binStart = i * binSize;
    const binCenter = binStart + binSize / 2;
    bins[binCenter.toFixed(2)] = {};
    visibleTeams.forEach((team) => {
      bins[binCenter.toFixed(2)][team] = 0;
    });
  }

  data.forEach((point) => {
    const binIndex = Math.floor(point.score / binSize);
    const binStart = binIndex * binSize;
    const binCenter = binStart + binSize / 2;
    const binKey = binCenter.toFixed(2);
    if (bins[binKey] && bins[binKey][point.team] !== undefined) {
      bins[binKey][point.team]++;
    }
  });

  return { bins, binSize };
}

/** Generate normal distribution curve data */
export function generateNormalCurve(mean: number, std: number, totalCount: number, numPoints: number = 200) {
  const points: { x: number; y: number }[] = [];
  const binSize = 0.3;

  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * 6;
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    const y = ((totalCount * binSize) / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    points.push({ x, y });
  }

  return points;
}
