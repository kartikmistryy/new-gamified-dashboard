/** SPOF Distribution Chart - Plotly Configuration Builders */

import type { Data, Layout, Config } from "plotly.js";
import type { SpofDataPoint } from "./spofMockData";
import { calculateSpofStats, SPOF_TEAM_CONFIG } from "./spofMockData";
import { createHistogramBins, generateNormalCurve } from "./spofDistributionUtils";

type TeamConfig = { name: string; color: string };

/** Build Plotly data traces for SPOF distribution chart */
export function buildSpofPlotData(
  filteredData: SpofDataPoint[],
  visibleTeamConfigs: TeamConfig[],
  visibleTeamNames: string[],
  showNormalFit: boolean
): Data[] {
  if (visibleTeamNames.length === 0) return [];

  const stats = calculateSpofStats(filteredData);
  const { mean, std } = stats;
  const { bins } = createHistogramBins(filteredData, visibleTeamNames, 0.3);

  const binCenters = Object.keys(bins)
    .map(Number)
    .sort((a, b) => a - b);
  const traces: Data[] = [];

  visibleTeamConfigs.forEach((teamConfig) => {
    const yValues = binCenters.map((center) => bins[center.toFixed(2)][teamConfig.name] || 0);

    traces.push({
      x: binCenters,
      y: yValues,
      type: "bar",
      name: teamConfig.name,
      marker: { color: teamConfig.color },
      hovertemplate: `<b>${teamConfig.name}</b><br>` + "SPOF Score: %{x:.1f}<br>" + "Count: %{y}<extra></extra>",
    });
  });

  if (showNormalFit && filteredData.length > 0) {
    const normalCurve = generateNormalCurve(mean, std, filteredData.length);
    traces.push({
      x: normalCurve.map((p) => p.x),
      y: normalCurve.map((p) => p.y),
      type: "scatter",
      mode: "lines",
      name: "Normal Fit",
      line: { color: "#dc2626", width: 2, dash: "dash" },
      hovertemplate: "Normal Fit<br>x=%{x:.2f}<br>y=%{y:.1f}<extra></extra>",
    });
  }

  return traces;
}

/** Build Plotly layout for SPOF distribution chart */
export function buildSpofPlotLayout(filteredData: SpofDataPoint[], visibleTeamNames: string[]): Partial<Layout> {
  const stats = calculateSpofStats(filteredData);
  const { mean, std, skewType } = stats;
  const { bins } = createHistogramBins(filteredData, visibleTeamNames, 0.3);
  const binCenters = Object.keys(bins)
    .map(Number)
    .sort((a, b) => a - b);

  const muMinus1Sigma = Math.max(0, mean - std);
  const muPlus1Sigma = Math.min(6, mean + std);

  const maxCount = Math.max(
    ...binCenters.map((center) =>
      visibleTeamNames.reduce((sum, team) => sum + (bins[center.toFixed(2)][team] || 0), 0)
    )
  );
  const yMax = Math.ceil(maxCount / 10) * 10;

  const teamsText = visibleTeamNames.length > 0 ? visibleTeamNames.join(", ") : "No teams selected";

  return {
    title: {
      text: `SPOF Distribution (${skewType})<br>` + `<sub>μ=${mean.toFixed(2)}, σ=${std.toFixed(2)} | Teams: ${teamsText}</sub>`,
      font: { size: 16, color: "#1e293b" },
    },
    xaxis: {
      title: { text: "SPOF Score" },
      range: [0, 6],
      gridcolor: "#e2e8f0",
      showline: true,
      linecolor: "#cbd5e1",
    },
    yaxis: {
      title: { text: "Count" },
      range: [0, yMax],
      gridcolor: "#e2e8f0",
      showline: true,
      linecolor: "#cbd5e1",
    },
    barmode: "stack",
    bargap: 0.1,
    showlegend: true,
    legend: {
      orientation: "v",
      x: 1.02,
      y: 1,
      xanchor: "left",
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "#e2e8f0",
      borderwidth: 1,
    },
    shapes: [
      {
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: 0,
        x1: muMinus1Sigma,
        y0: 0,
        y1: 1,
        fillcolor: "rgba(249, 115, 22, 0.1)",
        opacity: 1,
        line: { width: 0 },
        layer: "below",
      },
      {
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: muPlus1Sigma,
        x1: 6,
        y0: 0,
        y1: 1,
        fillcolor: "rgba(16, 185, 129, 0.1)",
        opacity: 1,
        line: { width: 0 },
        layer: "below",
      },
      {
        type: "line",
        xref: "x",
        yref: "paper",
        x0: muMinus1Sigma,
        x1: muMinus1Sigma,
        y0: 0,
        y1: 1,
        line: { color: "#f97316", width: 2, dash: "dot" },
      },
      {
        type: "line",
        xref: "x",
        yref: "paper",
        x0: muPlus1Sigma,
        x1: muPlus1Sigma,
        y0: 0,
        y1: 1,
        line: { color: "#10b981", width: 2, dash: "dot" },
      },
    ],
    annotations: [
      {
        x: muMinus1Sigma,
        y: 1,
        xref: "x",
        yref: "paper",
        text: `μ-1σ (${muMinus1Sigma.toFixed(1)})`,
        showarrow: false,
        xanchor: "center",
        yanchor: "bottom",
        font: { size: 11, color: "#000000" },
      },
      {
        x: muPlus1Sigma,
        y: 1,
        xref: "x",
        yref: "paper",
        text: `μ+1σ (${muPlus1Sigma.toFixed(1)})`,
        showarrow: false,
        xanchor: "center",
        yanchor: "bottom",
        font: { size: 11, color: "#000000" },
      },
    ],
    margin: { l: 60, r: 150, t: 80, b: 60 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    hovermode: "closest",
    height: 500,
  };
}

/** Standard Plotly configuration */
export const SPOF_PLOT_CONFIG: Partial<Config> = {
  responsive: true,
  displayModeBar: false,
};
