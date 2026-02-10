"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import { PerformanceChartLegend } from "./PerformanceChartLegend";
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
import {
  buildPlotlyData,
  buildPlotlyLayout,
  PLOTLY_CONFIG,
} from "@/lib/dashboard/performanceChartConfig";

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
   * Uses extracted configuration builder for cleaner separation
   */
  const plotlyData = useMemo(
    () => buildPlotlyData(filteredData),
    [filteredData]
  );

  /**
   * Build Plotly layout configuration
   * Uses extracted configuration builder
   */
  const plotlyLayout = useMemo(
    () => buildPlotlyLayout(
      filteredData,
      filteredEvents,
      filteredAnnotations,
      chartSize.width
    ),
    [filteredData, filteredEvents, filteredAnnotations, chartSize.width]
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
          config={PLOTLY_CONFIG}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>
      <PerformanceChartLegend />
    </div>
  );
}
