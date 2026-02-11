/** Performance Chart Plotly Configuration - data traces and layout builders */

import type { Data, Layout, Config } from "plotly.js";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { NormalizedPerformanceDataPoint } from "@/lib/dashboard/shared/performanceChart/types";
import { CHART_HEIGHT, MARGIN } from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { PERFORMANCE_BASELINES } from "@/lib/orgDashboard/orgPerformanceChartData";
import {
  buildPerformanceZoneShapes,
  buildEventShapes,
  buildAnnotationMarkers,
} from "./performanceChartShapes";

/** Build Plotly data traces - main performance line and baseline reference lines */
export function buildPlotlyData(filteredData: NormalizedPerformanceDataPoint[]): Data[] {
  if (filteredData.length === 0) return [];

  const dates = filteredData.map((d) => d.date);
  const values = filteredData.map((d) => d.value);

  const traces: Data[] = [];

  // Main line trace
  traces.push({
    type: "scatter",
    mode: "lines+markers",
    x: dates,
    y: values,
    name: "Normalized Median",
    line: {
      color: "#2563eb",
      width: 2,
      shape: "spline",
    },
    marker: {
      color: "#2563eb",
      size: 6,
      line: {
        color: "#2563eb",
        width: 1,
      },
    },
    hovertemplate: "<b>%{x|%b %d, %Y}</b><br>Percentile: %{y}<extra></extra>",
  });

  // Baseline reference lines (P60 and P40)
  const allDates = dates;
  traces.push({
    type: "scatter",
    mode: "lines",
    x: allDates,
    y: Array(allDates.length).fill(60),
    name: PERFORMANCE_BASELINES.p60.label,
    line: {
      color: PERFORMANCE_BASELINES.p60.color,
      width: 1.5,
      dash: "dash",
    },
    hoverinfo: "skip",
    showlegend: false,
  });

  traces.push({
    type: "scatter",
    mode: "lines",
    x: allDates,
    y: Array(allDates.length).fill(40),
    name: PERFORMANCE_BASELINES.p40.label,
    line: {
      color: PERFORMANCE_BASELINES.p40.color,
      width: 1.5,
      dash: "dash",
    },
    hoverinfo: "skip",
    showlegend: false,
  });

  return traces;
}

/** Build complete Plotly layout configuration */
export function buildPlotlyLayout(
  filteredData: NormalizedPerformanceDataPoint[],
  filteredEvents: ChartEvent[],
  filteredAnnotations: ChartAnnotation[],
  chartWidth: number
): Partial<Layout> {
  if (filteredData.length === 0) {
    return {};
  }

  const shapes: any[] = [
    ...buildPerformanceZoneShapes(),
    ...buildEventShapes(filteredEvents, filteredData),
  ];

  const layoutAnnotations = buildAnnotationMarkers(filteredAnnotations, filteredData);

  return {
    autosize: true,
    width: chartWidth > 0 ? chartWidth : undefined,
    height: CHART_HEIGHT,
    margin: {
      l: MARGIN.left,
      r: MARGIN.right,
      t: MARGIN.top,
      b: MARGIN.bottom,
    },
    plot_bgcolor: "#fafafa",
    paper_bgcolor: "white",
    xaxis: {
      title: {
        text: "Week",
        font: {
          size: 12,
          color: "#334155",
          weight: 500,
        },
      },
      type: "date",
      showgrid: false,
      showline: true,
      linecolor: "#9ca3af",
      linewidth: 1,
      tickfont: {
        size: 11,
        color: "#475569",
      },
      tickformat: "%b %Y",
    },
    yaxis: {
      title: {
        text: "Percentile (Normalized to Rolling Avg)",
        font: {
          size: 12,
          color: "#334155",
          weight: 500,
        },
      },
      range: [0, 100],
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      griddash: "dot",
      showline: true,
      linecolor: "#9ca3af",
      linewidth: 1,
      tickfont: {
        size: 11,
        color: "#475569",
      },
      tickmode: "array",
      tickvals: [0, 30, 40, 60, 70, 100],
    },
    shapes,
    annotations: layoutAnnotations,
    hovermode: "closest",
    hoverlabel: {
      bgcolor: "white",
      bordercolor: "#d1d5db",
      font: {
        size: 12,
        color: "#0f172a",
      },
    },
    showlegend: false,
  };
}

/** Standard Plotly configuration for performance charts */
export const PLOTLY_CONFIG: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
  displaylogo: false,
};
