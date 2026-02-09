"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import { SPOF_TEAM_CONFIG, calculateSpofStats } from "@/lib/orgDashboard/spofMockData";
import type { SpofDataPoint } from "@/lib/orgDashboard/spofMockData";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type SpofDistributionChartProps = {
  data: SpofDataPoint[];
  visibleTeams: Record<string, boolean>;
  showNormalFit?: boolean;
};

/**
 * Create histogram bins for stacked bar chart
 */
function createHistogramBins(
  data: SpofDataPoint[],
  visibleTeams: string[],
  binSize: number = 0.3
) {
  const bins: Record<string, Record<string, number>> = {};
  const numBins = Math.ceil(6 / binSize);

  // Initialize bins
  for (let i = 0; i < numBins; i++) {
    const binStart = i * binSize;
    const binCenter = binStart + binSize / 2;
    bins[binCenter.toFixed(2)] = {};
    visibleTeams.forEach(team => {
      bins[binCenter.toFixed(2)][team] = 0;
    });
  }

  // Fill bins with data
  data.forEach(point => {
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

/**
 * Generate normal distribution curve data
 */
function generateNormalCurve(mean: number, std: number, totalCount: number, numPoints: number = 200) {
  const points: { x: number; y: number }[] = [];
  const binSize = 0.3;

  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * 6;
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    const y = (totalCount * binSize / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    points.push({ x, y });
  }

  return points;
}

export function SpofDistributionChart({
  data,
  visibleTeams,
  showNormalFit = true,
}: SpofDistributionChartProps) {
  const filteredData = useMemo(
    () => data.filter((d) => visibleTeams[d.team] !== false),
    [data, visibleTeams]
  );

  const visibleTeamNames = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false).map((t) => t.name),
    [visibleTeams]
  );

  const visibleTeamConfigs = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false),
    [visibleTeams]
  );

  const plotData = useMemo(() => {
    if (visibleTeamNames.length === 0) return [];

    const stats = calculateSpofStats(filteredData);
    const { mean, std } = stats;
    const { bins } = createHistogramBins(filteredData, visibleTeamNames, 0.3);

    const binCenters = Object.keys(bins).map(Number).sort((a, b) => a - b);
    const traces: Data[] = [];

    // Create stacked bar traces for each team
    visibleTeamConfigs.forEach(teamConfig => {
      const yValues = binCenters.map(center => bins[center.toFixed(2)][teamConfig.name] || 0);

      traces.push({
        x: binCenters,
        y: yValues,
        type: "bar",
        name: teamConfig.name,
        marker: { color: teamConfig.color },
        hovertemplate: `<b>${teamConfig.name}</b><br>` +
          "SPOF Score: %{x:.1f}<br>" +
          "Count: %{y}<extra></extra>",
      });
    });

    // Add normal distribution curve
    if (showNormalFit && filteredData.length > 0) {
      const normalCurve = generateNormalCurve(mean, std, filteredData.length);
      traces.push({
        x: normalCurve.map(p => p.x),
        y: normalCurve.map(p => p.y),
        type: "scatter",
        mode: "lines",
        name: "Normal Fit",
        line: {
          color: "#dc2626",
          width: 2,
          dash: "dash",
        },
        hovertemplate: "Normal Fit<br>x=%{x:.2f}<br>y=%{y:.1f}<extra></extra>",
      });
    }

    return traces;
  }, [filteredData, visibleTeamConfigs, visibleTeamNames, showNormalFit]);

  const plotLayout = useMemo((): Partial<Layout> => {
    const stats = calculateSpofStats(filteredData);
    const { mean, std, skewType } = stats;
    const { bins } = createHistogramBins(filteredData, visibleTeamNames, 0.3);
    const binCenters = Object.keys(bins).map(Number).sort((a, b) => a - b);

    const muMinus1Sigma = Math.max(0, mean - std);
    const muPlus1Sigma = Math.min(6, mean + std);

    // Calculate max y value for proper scaling
    const maxCount = Math.max(
      ...binCenters.map(center =>
        visibleTeamNames.reduce((sum, team) => sum + (bins[center.toFixed(2)][team] || 0), 0)
      )
    );
    const yMax = Math.ceil(maxCount / 10) * 10;

    const teamsText = visibleTeamNames.length > 0
      ? visibleTeamNames.join(", ")
      : "No teams selected";

    return {
      title: {
        text: `SPOF Distribution (${skewType})<br>` +
          `<sub>μ=${mean.toFixed(2)}, σ=${std.toFixed(2)} | Teams: ${teamsText}</sub>`,
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
        // Left shaded region (< μ-σ) - Orange
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
        // Right shaded region (> μ+σ) - Green
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
        // μ-σ line - Orange
        {
          type: "line",
          xref: "x",
          yref: "paper",
          x0: muMinus1Sigma,
          x1: muMinus1Sigma,
          y0: 0,
          y1: 1,
          line: {
            color: "#f97316",
            width: 2,
            dash: "dot",
          },
        },
        // μ+σ line - Green
        {
          type: "line",
          xref: "x",
          yref: "paper",
          x0: muPlus1Sigma,
          x1: muPlus1Sigma,
          y0: 0,
          y1: 1,
          line: {
            color: "#10b981",
            width: 2,
            dash: "dot",
          },
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
  }, [filteredData, visibleTeamNames]);

  const plotConfig = useMemo((): Partial<Config> => ({
    responsive: true,
    displayModeBar: false,
  }), []);

  return (
    <div className="w-full h-[500px]">
      <Plot data={plotData} layout={plotLayout} config={plotConfig} className="w-full h-full" />
    </div>
  );
}
