"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { OrgPerformanceDataPoint } from "@/lib/orgDashboard/orgPerformanceChartData";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import {
  buildOrgPerformanceChartGeometry,
  CHART_HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import { PerformanceChartSVG } from "./PerformanceChartSVG";
import { PerformanceChartLegend } from "./PerformanceChartLegend";

type PerformanceChartProps = {
  className?: string;
  data: OrgPerformanceDataPoint[];
  holidays?: ChartEvent[];
  annotations?: ChartAnnotation[];
  /** Optional visibility filter for teams. When provided, only visible teams contribute to the aggregated performance value. */
  visibleTeams?: Record<string, boolean>;
  /** Time range filter. When provided, data is filtered to show only the selected range. */
  timeRange?: TimeRangeKey;
  ariaLabel?: string;
};

export function PerformanceChart({
  className = "",
  data,
  holidays: holidaysProp = [],
  annotations: annotationsProp = [],
  visibleTeams,
  timeRange = "max",
  ariaLabel = "Percentile normalized to rolling average over time",
}: PerformanceChartProps) {
  const rawData = useMemo(() => (data != null ? data : []), [data]);

  // Filter data based on time range
  const timeFilteredData = useMemo(() => {
    if (timeRange === "max" || rawData.length === 0) {
      return rawData;
    }

    // Get the end date from the last data point
    const endDate = new Date(rawData[rawData.length - 1].date);
    const startDate = getStartDateForRange(timeRange, endDate);

    return rawData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }, [rawData, timeRange]);

  // Filter holidays based on time range
  const holidays = useMemo(() => {
    if (timeRange === "max" || timeFilteredData.length === 0) {
      return holidaysProp;
    }

    const startDate = new Date(timeFilteredData[0].date);
    const endDate = new Date(timeFilteredData[timeFilteredData.length - 1].date);

    return holidaysProp.filter((h) => {
      const date = new Date(h.date);
      return date >= startDate && date <= endDate;
    });
  }, [holidaysProp, timeRange, timeFilteredData]);

  // Filter annotations based on time range
  const annotations = useMemo(() => {
    if (timeRange === "max" || timeFilteredData.length === 0) {
      return annotationsProp;
    }

    const startDate = new Date(timeFilteredData[0].date);
    const endDate = new Date(timeFilteredData[timeFilteredData.length - 1].date);

    return annotationsProp.filter((a) => {
      const date = new Date(a.date);
      return date >= startDate && date <= endDate;
    });
  }, [annotationsProp, timeRange, timeFilteredData]);

  // Filter data based on visible teams if provided
  const filteredData = useMemo(() => {
    // If no visibility filter is provided, return time-filtered data
    if (!visibleTeams) {
      return timeFilteredData;
    }

    // Get list of visible team names
    const visibleTeamNames = Object.entries(visibleTeams)
      .filter(([_, visible]) => visible !== false)
      .map(([name]) => name);

    // If no teams are visible, return empty data
    if (visibleTeamNames.length === 0) {
      return [];
    }

    // Recalculate performance values based on only the visible teams
    return timeFilteredData.map((dataPoint) => {
      // If this data point doesn't have team values, return it as-is
      if (!dataPoint.teamValues) {
        return dataPoint;
      }

      // Calculate the average performance value of visible teams
      let sum = 0;
      let count = 0;

      for (const teamName of visibleTeamNames) {
        const teamValue = dataPoint.teamValues[teamName];
        if (teamValue !== undefined) {
          sum += teamValue;
          count++;
        }
      }

      // Calculate the new aggregated value (average of visible teams)
      const newValue = count > 0 ? Math.round(sum / count) : dataPoint.value;

      return {
        ...dataPoint,
        value: newValue,
      };
    });
  }, [timeFilteredData, visibleTeams]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: CHART_HEIGHT });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) setChartSize((s) => ({ ...s, width }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`org-perf-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const geom = useMemo(
    () =>
      buildOrgPerformanceChartGeometry(
        filteredData,
        holidays,
        annotations,
        chartSize.width || undefined,
        chartSize.height
      ),
    [filteredData, holidays, annotations, chartSize.width, chartSize.height]
  );

  const width = chartSize.width > 0 ? chartSize.width : geom.innerWidth + MARGIN.left + MARGIN.right;
  const height = chartSize.height;

  if (!filteredData.length) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full overflow-visible ${className}`}>
      <div className="relative overflow-visible bg-white">
        <PerformanceChartSVG
          width={width}
          height={height}
          geom={geom}
          filteredData={filteredData}
          tooltipRef={tooltipRef}
          ariaLabel={ariaLabel}
        />
      </div>
      <PerformanceChartLegend />
    </div>
  );
}
