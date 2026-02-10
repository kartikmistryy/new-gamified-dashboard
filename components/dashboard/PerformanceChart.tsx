"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import {
  CHART_HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import { PerformanceChartLegend } from "./PerformanceChartLegend";
import { PERFORMANCE_ZONES, PERFORMANCE_BASELINES } from "@/lib/orgDashboard/orgPerformanceChartData";
import type {
  PerformanceChartProps,
  NormalizedPerformanceDataPoint,
} from "@/lib/dashboard/performanceChart/types";
import {
  isStaticEventStrategy,
  isDynamicEventStrategy,
  isStaticAnnotationStrategy,
  isDynamicAnnotationStrategy,
} from "@/lib/dashboard/performanceChart/types";
import {
  transformDataSource,
  filterByEntityVisibility,
} from "@/lib/dashboard/performanceChart/transformers";

// Dynamically import Plotly to avoid SSR issues
// Note: react-plotly.js only exports a default export (external library)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/**
 * Unified Performance Chart Component (Plotly.js version)
 *
 * A single, reusable performance chart component that supports all dashboard types:
 * - Organization dashboard (team-level aggregation)
 * - Team dashboard (member-level data)
 * - Repository dashboard (contributor-level data)
 * - User dashboard (individual performance)
 *
 * Features:
 * - Type-safe data source discrimination
 * - Flexible event/annotation generation (static or dynamic)
 * - Entity visibility filtering (teams, members, contributors)
 * - Time range filtering
 * - Responsive sizing
 * - Accessible tooltips and ARIA labels
 * - Plotly.js-based rendering with interactive features
 *
 * @example
 * ```tsx
 * // Org dashboard usage
 * <PerformanceChart
 *   dataSource={{ type: "org", data: orgData }}
 *   eventStrategy={{ mode: "static", events: ORG_HOLIDAYS }}
 *   annotationStrategy={{ mode: "static", annotations: ORG_ANNOTATIONS }}
 *   timeRange={timeRange}
 *   entityVisibility={{ visibleEntities: visibleTeams }}
 * />
 *
 * // Team dashboard usage
 * <PerformanceChart
 *   dataSource={{ type: "team", data: memberData }}
 *   eventStrategy={{ mode: "dynamic", generator: generateTeamEvents }}
 *   annotationStrategy={{ mode: "dynamic", generator: generateTeamAnnotations }}
 *   timeRange={timeRange}
 * />
 * ```
 */
export function PerformanceChart({
  dataSource,
  eventStrategy = { mode: "none" },
  annotationStrategy = { mode: "none" },
  timeRange = "max",
  entityVisibility,
  ariaLabel = "Performance chart over time",
  className = "",
}: PerformanceChartProps) {
  // ============================================================================
  // Data Transformation Pipeline
  // ============================================================================

  /**
   * Step 1: Transform data source to normalized format
   * Uses discriminated union and type guards to select correct transformer
   */
  const normalizedData = useMemo<NormalizedPerformanceDataPoint[]>(
    () => transformDataSource(dataSource),
    [dataSource]
  );

  /**
   * Step 2: Apply time range filtering
   * Filters data points based on selected time range
   */
  const timeFilteredData = useMemo(() => {
    if (timeRange === "max" || normalizedData.length === 0) {
      return normalizedData;
    }

    // Get the end date from the last data point
    const endDate = new Date(normalizedData[normalizedData.length - 1].date);
    const startDate = getStartDateForRange(timeRange, endDate);

    return normalizedData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }, [normalizedData, timeRange]);

  /**
   * Step 3: Apply entity visibility filtering
   * Recalculates aggregated values based on visible entities only
   */
  const filteredData = useMemo(
    () => filterByEntityVisibility(timeFilteredData, entityVisibility?.visibleEntities),
    [timeFilteredData, entityVisibility?.visibleEntities]
  );

  // ============================================================================
  // Event and Annotation Generation
  // ============================================================================

  /**
   * Generate or retrieve events based on strategy
   * Supports static events, dynamic generation, or none
   */
  const events = useMemo<ChartEvent[]>(() => {
    if (isStaticEventStrategy(eventStrategy)) {
      return eventStrategy.events;
    }
    if (isDynamicEventStrategy(eventStrategy)) {
      return eventStrategy.generator(filteredData);
    }
    return [];
  }, [eventStrategy, filteredData]);

  /**
   * Generate or retrieve annotations based on strategy
   * Supports static annotations, dynamic generation, or none
   */
  const annotations = useMemo<ChartAnnotation[]>(() => {
    if (isStaticAnnotationStrategy(annotationStrategy)) {
      return annotationStrategy.annotations;
    }
    if (isDynamicAnnotationStrategy(annotationStrategy)) {
      return annotationStrategy.generator(filteredData);
    }
    return [];
  }, [annotationStrategy, filteredData]);

  /**
   * Filter events based on time range
   * Only show events within the visible data range
   */
  const filteredEvents = useMemo(() => {
    if (timeRange === "max" || filteredData.length === 0) {
      return events;
    }

    const startDate = new Date(filteredData[0].date);
    const endDate = new Date(filteredData[filteredData.length - 1].date);

    return events.filter((event) => {
      const date = new Date(event.date);
      return date >= startDate && date <= endDate;
    });
  }, [events, timeRange, filteredData]);

  /**
   * Filter annotations based on time range
   * Only show annotations within the visible data range
   */
  const filteredAnnotations = useMemo(() => {
    if (timeRange === "max" || filteredData.length === 0) {
      return annotations;
    }

    const startDate = new Date(filteredData[0].date);
    const endDate = new Date(filteredData[filteredData.length - 1].date);

    return annotations.filter((annotation) => {
      const date = new Date(annotation.date);
      return date >= startDate && date <= endDate;
    });
  }, [annotations, timeRange, filteredData]);

  // ============================================================================
  // Chart Rendering Setup with Plotly.js
  // ============================================================================

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: CHART_HEIGHT });

  /**
   * Set up responsive chart sizing
   * Uses ResizeObserver to track container width changes
   */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) {
        setChartSize((s) => ({ ...s, width }));
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Build Plotly data traces
   * Includes performance zones, baseline lines, events, annotations, and main data line
   */
  const plotlyData = useMemo((): Data[] => {
    if (filteredData.length === 0) return [];

    const dates = filteredData.map((d) => d.date);
    const values = filteredData.map((d) => d.value);

    const traces: Data[] = [];

    // Background zones (as shapes, will be added to layout)
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
  }, [filteredData]);

  /**
   * Build Plotly layout configuration
   * Includes axes, margins, zones, events, and annotations
   */
  const plotlyLayout = useMemo((): Partial<Layout> => {
    if (filteredData.length === 0) {
      return {};
    }

    const shapes: any[] = [];
    const layoutAnnotations: any[] = [];

    // Performance zones as background rectangles
    shapes.push(
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
      }
    );

    // Holiday event lines
    filteredEvents.forEach((event) => {
      shapes.push({
        type: "line",
        x0: event.date,
        x1: event.date,
        xref: "x",
        y0: 0,
        y1: 100,
        yref: "y",
        line: {
          color: "#CA3A31",
          width: 1,
          dash: "dot",
        },
        opacity: 0.6,
        layer: "above",
      });

      layoutAnnotations.push({
        x: event.date,
        y: 100,
        xref: "x",
        yref: "y",
        text: event.label,
        showarrow: false,
        textangle: -45,
        xanchor: "left",
        yanchor: "bottom",
        font: {
          size: 9,
          color: "#CA3A31",
          weight: 500,
        },
        yshift: 10,
      });
    });

    // Chart annotations (callouts)
    filteredAnnotations.forEach((ann) => {
      // Find the closest data point to determine y position
      const closestPoint = filteredData.reduce((closest, point) => {
        const annDate = new Date(ann.date).getTime();
        const pointDate = new Date(point.date).getTime();
        const closestDate = new Date(closest.date).getTime();
        return Math.abs(pointDate - annDate) < Math.abs(closestDate - annDate)
          ? point
          : closest;
      }, filteredData[0]);

      const yPos = closestPoint.value;
      const labelY = yPos > 50 ? yPos - 15 : yPos + 15;

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

    return {
      autosize: true,
      width: chartSize.width > 0 ? chartSize.width : undefined,
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
  }, [filteredData, filteredEvents, filteredAnnotations, chartSize.width]);

  /**
   * Plotly configuration
   */
  const plotlyConfig = useMemo(
    (): Partial<Config> => ({
      displayModeBar: false,
      responsive: true,
      displaylogo: false,
    }),
    []
  );

  // ============================================================================
  // Render
  // ============================================================================

  /**
   * Empty state - no data available
   */
  if (filteredData.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  /**
   * Main chart render with Plotly.js
   * Includes Plotly chart and legend
   */
  return (
    <div ref={containerRef} className={`w-full overflow-visible ${className}`}>
      <div className="relative overflow-visible bg-white" role="img" aria-label={ariaLabel}>
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={plotlyConfig}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>
      <PerformanceChartLegend />
    </div>
  );
}
