/** Ownership Scatter Plot - Plotly trace and layout builders */

import type { Data, Layout, Config } from "plotly.js";
import type { ProcessedOwnershipData } from "./ownershipScatterUtils";
import { WIDTH, HEIGHT, MARGIN } from "./ownershipScatterUtils";

/** Build Plotly data traces for ownership scatter plot */
export function buildOwnershipTraces(
  points: ProcessedOwnershipData["points"]
): Data[] {
  const traces: Data[] = [];
  const normalPoints = points.filter((p) => p.inNormalRange);
  const highOutliers = points.filter((p) => p.outlierType === "high");
  const lowOutliers = points.filter((p) => p.outlierType === "low");

  if (normalPoints.length > 0) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: normalPoints.map((p) => p.totalKarmaPoints),
      y: normalPoints.map((p) => p.ownershipPct),
      name: "Normal Range",
      marker: { color: "rgba(66, 133, 244, 0.7)", size: 9, line: { width: 0 } },
      text: normalPoints.map(
        (p) =>
          `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
      ),
      hovertemplate: "%{text}<extra></extra>",
      showlegend: false,
    });
  }

  if (highOutliers.length > 0) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: highOutliers.map((p) => p.totalKarmaPoints),
      y: highOutliers.map((p) => p.ownershipPct),
      name: "Outlier (High Ownership)",
      marker: { color: "#22c55e", size: 9, line: { width: 0 } },
      text: highOutliers.map(
        (p) =>
          `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
      ),
      hovertemplate: "%{text}<extra></extra>",
      showlegend: false,
    });
  }

  if (lowOutliers.length > 0) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: lowOutliers.map((p) => p.totalKarmaPoints),
      y: lowOutliers.map((p) => p.ownershipPct),
      name: "Outlier (Low Ownership)",
      marker: { color: "#ef4444", size: 9, line: { width: 0 } },
      text: lowOutliers.map(
        (p) =>
          `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
      ),
      hovertemplate: "%{text}<extra></extra>",
      showlegend: false,
    });
  }

  return traces;
}

/** Build Plotly layout for ownership scatter plot */
export function buildOwnershipLayout(
  trendLine: ProcessedOwnershipData["trendLine"] | undefined,
  chartWidth: number
): Partial<Layout> {
  const shapes: any[] = [];

  if (trendLine) {
    const xMin = 0,
      xMax = 300000,
      yMin = 0,
      yMax = 80;
    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const x1Data = xMin + ((trendLine.x1 - MARGIN.left) / innerWidth) * (xMax - xMin);
    const x2Data = xMin + ((trendLine.x2 - MARGIN.left) / innerWidth) * (xMax - xMin);
    const y1Data = yMax - ((trendLine.y1 - MARGIN.top) / innerHeight) * (yMax - yMin);
    const y2Data = yMax - ((trendLine.y2 - MARGIN.top) / innerHeight) * (yMax - yMin);

    shapes.push({
      type: "line",
      x0: x1Data,
      x1: x2Data,
      y0: y1Data,
      y1: y2Data,
      xref: "x",
      yref: "y",
      line: { color: "#6b7280", width: 1.5, dash: "dash" },
      layer: "above",
    });
  }

  return {
    autosize: true,
    width: chartWidth > 0 ? chartWidth : WIDTH,
    height: HEIGHT,
    margin: { l: MARGIN.left, r: MARGIN.right, t: MARGIN.top, b: MARGIN.bottom },
    plot_bgcolor: "#f9fafb",
    paper_bgcolor: "#ffffff",
    xaxis: {
      title: { text: "Cumulative KarmaPoints", font: { size: 14, color: "#334155" } },
      range: [0, 300000],
      showgrid: true,
      gridcolor: "#e2e8f0",
      gridwidth: 1,
      showline: true,
      linecolor: "#d1d5db",
      linewidth: 1,
      zerolinecolor: "#cbd5e1",
      tickfont: { size: 10, color: "#475569" },
      tickmode: "array",
      tickvals: [0, 50000, 100000, 150000, 200000, 250000, 300000],
      ticktext: ["0", "50k", "100k", "150k", "200k", "250k", "300k"],
    },
    yaxis: {
      title: { text: "Ownership %", font: { size: 14, color: "#334155" } },
      range: [0, 80],
      showgrid: true,
      gridcolor: "#e2e8f0",
      gridwidth: 1,
      showline: true,
      linecolor: "#d1d5db",
      linewidth: 1,
      zerolinecolor: "#cbd5e1",
      tickfont: { size: 10, color: "#475569" },
      tickmode: "array",
      tickvals: [0, 20, 40, 60, 80],
    },
    shapes,
    hovermode: "closest",
    hoverlabel: { bgcolor: "white", bordercolor: "#d1d5db", font: { size: 12, color: "#0f172a" } },
    showlegend: false,
  };
}

/** Standard Plotly configuration */
export const OWNERSHIP_SCATTER_CONFIG: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
  displaylogo: false,
};
