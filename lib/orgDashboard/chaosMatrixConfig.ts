/** Chaos Matrix Chart Configuration - Plotly config for Chaos Matrix visualization */

import type { PlotData, Layout, Config } from "plotly.js";
import type { ChaosCategory } from "./chaosMatrixData";
import { CATEGORY_COLORS } from "./chaosMatrixData";

export type CategorizedPoint = {
  name: string;
  medianWeeklyKp: number;
  churnRatePct: number;
  category: ChaosCategory;
};

export type StackedPoint = CategorizedPoint & {
  originalKp: number;
  originalChurn: number;
};

/** Build Plotly traces for chaos matrix scatter plot */
export function buildChaosMatrixTraces(
  stackedFiltered: StackedPoint[],
  tooltipTeamLabel: string,
  renderMode: "circles" | "avatars"
): PlotData[] {
  const byCategory: Record<ChaosCategory, StackedPoint[]> = {
    "Skilled AI User": [],
    "Unskilled AI User": [],
    "Traditional Developer": [],
    "Low-Skill Developer": [],
  };

  stackedFiltered.forEach((point) => {
    byCategory[point.category].push(point);
  });

  const traces: PlotData[] = [];

  (Object.keys(byCategory) as ChaosCategory[]).forEach((cat) => {
    const points = byCategory[cat];
    if (points.length === 0) return;

    traces.push({
      type: "scatter",
      mode: "markers",
      name: cat,
      x: points.map((p) => p.medianWeeklyKp),
      y: points.map((p) => p.churnRatePct),
      text: points.map((p) => p.name),
      hovertemplate: `<b>%{text}</b><br>Median Weekly KP: %{x}<br>Churn Rate: %{y}%<extra></extra>`,
      marker: {
        size: renderMode === "circles" ? 10 : 22,
        color: CATEGORY_COLORS[cat],
        opacity: renderMode === "circles" ? 0.7 : 0,
        line: {
          color: CATEGORY_COLORS[cat],
          width: renderMode === "circles" ? 1.5 : 0,
        },
      },
      showlegend: renderMode === "circles",
    });
  });

  return traces;
}

/** Calculate axis ranges with padding */
export function calculateAxisRanges(stackedFiltered: StackedPoint[]) {
  const allKp = stackedFiltered.map((p) => p.medianWeeklyKp);
  const allChurn = stackedFiltered.map((p) => p.churnRatePct);

  const xMin = Math.max(0, Math.min(...allKp) - 200);
  const xMax = Math.max(...allKp) + 200;
  const yMin = Math.max(0, Math.min(...allChurn) - 1);
  const yMax = Math.max(...allChurn) + 1;

  return { xMin, xMax, yMin, yMax };
}

/** Build quadrant label annotations */
function buildQuadrantAnnotations(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  kpThresh: number
): Partial<Layout>["annotations"] {
  const rightCenterX = (kpThresh + xMax) / 2;
  return [
    {
      x: xMin + 200,
      y: yMax - 1,
      text: "Low-Skill Dev",
      showarrow: false,
      font: { size: 13, color: CATEGORY_COLORS["Low-Skill Developer"], family: "inherit", weight: 400 },
      xanchor: "left",
    },
    {
      x: xMin + 200,
      y: yMin + 0.5,
      text: "Traditional Dev",
      showarrow: false,
      font: { size: 13, color: CATEGORY_COLORS["Traditional Developer"], family: "inherit", weight: 400 },
      xanchor: "left",
    },
    {
      x: rightCenterX,
      y: yMax - 1,
      text: "Unskilled AI User",
      showarrow: false,
      font: { size: 13, color: CATEGORY_COLORS["Unskilled AI User"], family: "inherit", weight: 400 },
      xanchor: "center",
    },
    {
      x: rightCenterX,
      y: yMin + 0.5,
      text: "Skilled AI User",
      showarrow: false,
      font: { size: 13, color: CATEGORY_COLORS["Skilled AI User"], family: "inherit", weight: 400 },
      xanchor: "center",
    },
  ];
}

/** Build complete Plotly layout for chaos matrix */
export function buildChaosMatrixLayout(
  stackedFiltered: StackedPoint[],
  kpThresh: number,
  churnThresh: number
): Partial<Layout> {
  const { xMin, xMax, yMin, yMax } = calculateAxisRanges(stackedFiltered);

  return {
    xaxis: {
      title: {
        text: "Median Weekly KP (Knowledge Points)",
        font: { size: 14, color: "#334155" },
      },
      range: [xMin, xMax],
      tickmode: "array",
      tickvals: [0, 500, 1000, 1500, 2000, 2500, 3000],
      gridcolor: "#e2e8f0",
      zerolinecolor: "#cbd5e1",
    },
    yaxis: {
      title: {
        text: "Churn Rate (%)",
        font: { size: 14, color: "#334155" },
      },
      range: [yMin, yMax],
      tickmode: "array",
      tickvals: [0, 2, 4, 6, 8, 10, 12, 14],
      gridcolor: "#e2e8f0",
      zerolinecolor: "#cbd5e1",
    },
    shapes: [
      {
        type: "line",
        x0: kpThresh,
        x1: kpThresh,
        y0: yMin,
        y1: yMax,
        line: { color: "#9ca3af", width: 1, dash: "dash" },
      },
      {
        type: "line",
        x0: xMin,
        x1: xMax,
        y0: churnThresh,
        y1: churnThresh,
        line: { color: "#9ca3af", width: 1, dash: "dash" },
      },
    ],
    annotations: buildQuadrantAnnotations(xMin, xMax, yMin, yMax, kpThresh),
    plot_bgcolor: "#f9fafb",
    paper_bgcolor: "#ffffff",
    margin: { t: 30, r: 30, b: 60, l: 100 },
    width: 800,
    height: 480,
    legend: {
      orientation: "h",
      y: -0.2,
      x: 0.5,
      xanchor: "center",
      font: { size: 12 },
    },
    hovermode: "closest",
  };
}

/** Standard Plotly configuration */
export const CHAOS_MATRIX_CONFIG: Partial<Config> = {
  displayModeBar: false,
  responsive: false,
};
