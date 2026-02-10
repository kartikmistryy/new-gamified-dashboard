"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { UserPerformanceDataPoint } from "@/lib/userDashboard/userPerformanceChartData";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import {
  buildOrgPerformanceChartGeometry,
  CHART_HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import { ComparativePerformanceChartSVG, type PerformanceLine } from "@/components/dashboard/shared/ComparativePerformanceChartSVG";
import { ComparativePerformanceChartLegend } from "@/components/dashboard/shared/ComparativePerformanceChartLegend";

type ComparativePerformanceChartProps = {
  className?: string;
  userLine: PerformanceLine;
  teamLine: PerformanceLine;
  orgLine: PerformanceLine;
  holidays?: ChartEvent[];
  annotations?: ChartAnnotation[];
  timeRange?: TimeRangeKey;
  ariaLabel?: string;
};

export function ComparativePerformanceChart({
  className = "",
  userLine,
  teamLine,
  orgLine,
  holidays: holidaysProp = [],
  annotations: annotationsProp = [],
  timeRange = "max",
  ariaLabel = "Comparative performance tracking: user vs team vs organization",
}: ComparativePerformanceChartProps) {
  // Combine all data points for time filtering (use user data as reference)
  const rawData = useMemo(() => userLine.data, [userLine.data]);

  // Filter data based on time range
  const timeFilteredData = useMemo(() => {
    if (timeRange === "max" || rawData.length === 0) {
      return rawData;
    }

    const endDate = new Date(rawData[rawData.length - 1].date);
    const startDate = getStartDateForRange(timeRange, endDate);

    return rawData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }, [rawData, timeRange]);

  // Filter all lines based on time range
  const filteredUserLine = useMemo(
    () => ({
      ...userLine,
      data: userLine.data.filter((d) => timeFilteredData.some((td) => td.date === d.date)),
    }),
    [userLine, timeFilteredData]
  );

  const filteredTeamLine = useMemo(
    () => ({
      ...teamLine,
      data: teamLine.data.filter((d) => timeFilteredData.some((td) => td.date === d.date)),
    }),
    [teamLine, timeFilteredData]
  );

  const filteredOrgLine = useMemo(
    () => ({
      ...orgLine,
      data: orgLine.data.filter((d) => timeFilteredData.some((td) => td.date === d.date)),
    }),
    [orgLine, timeFilteredData]
  );

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
    tooltipRef.current = createChartTooltip(`comp-perf-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const geom = useMemo(
    () =>
      buildOrgPerformanceChartGeometry(
        timeFilteredData,
        holidays,
        annotations,
        chartSize.width || undefined,
        chartSize.height
      ),
    [timeFilteredData, holidays, annotations, chartSize.width, chartSize.height]
  );

  const width = chartSize.width > 0 ? chartSize.width : geom.innerWidth + MARGIN.left + MARGIN.right;
  const height = chartSize.height;

  const lines = [filteredUserLine, filteredTeamLine, filteredOrgLine];

  if (!timeFilteredData.length) {
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
        <ComparativePerformanceChartSVG
          width={width}
          height={height}
          geom={geom}
          lines={lines}
          tooltipRef={tooltipRef}
          ariaLabel={ariaLabel}
        />
      </div>
      <ComparativePerformanceChartLegend
        userColor={userLine.color}
        teamColor={teamLine.color}
        orgColor={orgLine.color}
      />
    </div>
  );
}
