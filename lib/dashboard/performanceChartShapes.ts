/** Performance Chart Plotly Shape Builders - zone backgrounds, event markers, annotations */

import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { NormalizedPerformanceDataPoint } from "@/lib/dashboard/performanceChart/types";
import { PERFORMANCE_ZONES } from "@/lib/orgDashboard/orgPerformanceChartData";

/** Build performance zone shapes (background rectangles) */
export function buildPerformanceZoneShapes(): any[] {
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

/** Build event marker shapes (vertical lines) */
export function buildEventShapes(
  events: ChartEvent[],
  filteredData: NormalizedPerformanceDataPoint[]
): any[] {
  const shapes: any[] = [];

  events.forEach((evt) => {
    const closestPoint = filteredData.reduce((closest, point) => {
      const pointDate = new Date(point.date);
      const evtDate = new Date(evt.date);
      const pointDiff = Math.abs(pointDate.getTime() - evtDate.getTime());
      const closestDiff = Math.abs(new Date(closest.date).getTime() - evtDate.getTime());
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

/** Build annotation markers */
export function buildAnnotationMarkers(
  annotations: ChartAnnotation[],
  filteredData: NormalizedPerformanceDataPoint[]
): any[] {
  const layoutAnnotations: any[] = [];

  annotations.forEach((ann) => {
    const closestPoint = filteredData.reduce((closest, point) => {
      const pointDate = new Date(point.date);
      const annDate = new Date(ann.date);
      const pointDiff = Math.abs(pointDate.getTime() - annDate.getTime());
      const closestDiff = Math.abs(new Date(closest.date).getTime() - annDate.getTime());
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
