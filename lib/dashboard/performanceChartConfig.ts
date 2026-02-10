/**
 * Performance Chart Plotly Configuration
 *
 * Extracted configuration and helper functions for building Plotly charts.
 * Separates chart configuration logic from component rendering logic.
 *
 * @module lib/dashboard/performanceChartConfig
 */

import type { Data, Layout, Config } from "plotly.js";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { NormalizedPerformanceDataPoint } from "@/lib/dashboard/performanceChart/types";
import {
  CHART_HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { PERFORMANCE_ZONES, PERFORMANCE_BASELINES } from "@/lib/orgDashboard/orgPerformanceChartData";

/**
 * Build Plotly data traces for performance chart
 * Includes main performance line and baseline reference lines
 */
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

/**
 * Build performance zone shapes (background rectangles)
 */
function buildPerformanceZoneShapes(): any[] {
  return [
    {
      type: "rect",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: 70,
      y1: 100,
      fillcolor: PERFORMANCE_ZONES.excellent.color,
      line: { width: 0 },
      layer: "below",
    },
    {
      type: "rect",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: 60,
      y1: 70,
      fillcolor: PERFORMANCE_ZONES.aboveAvg.color,
      line: { width: 0 },
      layer: "below",
    },
    {
      type: "rect",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: 30,
      y1: 40,
      fillcolor: PERFORMANCE_ZONES.belowAvg.color,
      line: { width: 0 },
      layer: "below",
    },
    {
      type: "rect",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: 0,
      y1: 30,
      fillcolor: PERFORMANCE_ZONES.concerning.color,
      line: { width: 0 },
      layer: "below",
    },
  ];
}

/**
 * Build event marker shapes (vertical lines)
 */
function buildEventShapes(
  events: ChartEvent[],
  filteredData: NormalizedPerformanceDataPoint[]
): any[] {
  const shapes: any[] = [];

  events.forEach((evt) => {
    const closestPoint = filteredData.reduce((closest, point) => {
      const pointDate = new Date(point.date);
      const evtDate = new Date(evt.date);
      const pointDiff = Math.abs(pointDate.getTime() - evtDate.getTime());
      const closestDiff = Math.abs(
        new Date(closest.date).getTime() - evtDate.getTime()
      );
      return pointDiff < closestDiff ? point : closest;
    });

    shapes.push({
      type: "line",
      xref: "x",
      yref: "paper",
      x0: closestPoint.date,
      x1: closestPoint.date,
      y0: 0,
      y1: 1,
      line: {
        color: "#6b7280",
        width: 1.5,
        dash: "dot",
      },
      layer: "above",
    });
  });

  return shapes;
}

/**
 * Build annotation markers
 */
function buildAnnotationMarkers(
  annotations: ChartAnnotation[],
  filteredData: NormalizedPerformanceDataPoint[]
): any[] {
  const layoutAnnotations: any[] = [];

  annotations.forEach((ann) => {
    const closestPoint = filteredData.reduce((closest, point) => {
      const pointDate = new Date(point.date);
      const annDate = new Date(ann.date);
      const pointDiff = Math.abs(pointDate.getTime() - annDate.getTime());
      const closestDiff = Math.abs(
        new Date(closest.date).getTime() - annDate.getTime()
      );
      return pointDiff < closestDiff ? point : closest;
    });

    const yPos = closestPoint.value;

    layoutAnnotations.push({
      x: closestPoint.date,
      y: yPos,
      xref: "x",
      yref: "y",
      text: ann.label,
      showarrow: true,
      arrowhead: 0,
      arrowsize: 1,
      arrowwidth: 1,
      arrowcolor: "#6b7280",
      ax: 0,
      ay: yPos > 50 ? -40 : 40,
      bgcolor: "white",
      bordercolor: "#d1d5db",
      borderwidth: 1,
      borderpad: 4,
      font: {
        size: 10,
        color: "#374151",
        weight: 500,
      },
    });
  });

  return layoutAnnotations;
}

/**
 * Build complete Plotly layout configuration
 */
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

  const layoutAnnotations = buildAnnotationMarkers(
    filteredAnnotations,
    filteredData
  );

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

/**
 * Standard Plotly configuration for performance charts
 */
export const PLOTLY_CONFIG: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
  displaylogo: false,
};
