"use client";

import { useMemo } from "react";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { OrgPerformanceDataPoint } from "@/lib/orgDashboard/orgPerformanceChartData";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import {
  generateOrgPerformanceData,
  ORG_PERFORMANCE_HOLIDAYS,
  ORG_PERFORMANCE_ANNOTATIONS,
} from "@/lib/orgDashboard/orgPerformanceChartData";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

type OrgPerformanceChartProps = {
  className?: string;
  /** When provided, use API/real data; otherwise use mock. Same shape = same behavior. */
  data?: OrgPerformanceDataPoint[];
  holidays?: ChartEvent[];
  annotations?: ChartAnnotation[];
  /** Optional visibility filter for teams. When provided, only visible teams contribute to the aggregated performance value. */
  visibleTeams?: Record<string, boolean>;
  /** Time range filter. When provided, data is filtered to show only the selected range. */
  timeRange?: TimeRangeKey;
};

export function OrgPerformanceChart({
  className = "",
  data: dataProp,
  holidays: holidaysProp = ORG_PERFORMANCE_HOLIDAYS,
  annotations: annotationsProp = ORG_PERFORMANCE_ANNOTATIONS,
  visibleTeams,
  timeRange = "max",
}: OrgPerformanceChartProps) {
  const rawData = useMemo(
    () => (dataProp != null && dataProp.length > 0 ? dataProp : generateOrgPerformanceData()),
    [dataProp]
  );

  return (
    <PerformanceChart
      className={className}
      data={rawData}
      holidays={holidaysProp}
      annotations={annotationsProp}
      visibleTeams={visibleTeams}
      timeRange={timeRange}
    />
  );
}
