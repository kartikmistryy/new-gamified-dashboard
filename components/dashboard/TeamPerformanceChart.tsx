"use client";

import { useMemo } from "react";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { ChartAnnotation, ChartEvent } from "@/lib/orgDashboard/types";
import type { OrgPerformanceDataPoint } from "@/lib/orgDashboard/orgPerformanceChartData";
import type { MemberPerformanceDataPoint } from "@/lib/teamDashboard/performanceTypes";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

function formatWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

type TeamPerformanceChartProps = {
  className?: string;
  data: MemberPerformanceDataPoint[];
  timeRange?: TimeRangeKey;
};

export function TeamPerformanceChart({
  className = "",
  data,
  timeRange = "max",
}: TeamPerformanceChartProps) {
  const chartData = useMemo<OrgPerformanceDataPoint[]>(
    () =>
      (data ?? []).map((point) => ({
        date: point.date,
        week: formatWeekLabel(point.date),
        value: point.value,
      })),
    [data]
  );

  const { events, annotations } = useMemo(() => {
    const safeData = data ?? [];
    if (safeData.length === 0) {
      return { events: [] as ChartEvent[], annotations: [] as ChartAnnotation[] };
    }

    const pickIndex = (ratio: number) =>
      Math.min(safeData.length - 1, Math.max(0, Math.round((safeData.length - 1) * ratio)));

    const eventLabels = ["Release", "Incident", "Sprint Planning"];
    const eventRatios = [0.18, 0.55, 0.82];
    const events: ChartEvent[] = eventRatios
      .map((ratio, idx) => {
        const point = safeData[pickIndex(ratio)];
        if (!point) return null;
        return {
          date: point.date,
          label: eventLabels[idx] ?? "Milestone",
          type: idx % 2 === 0 ? "milestone" : "holiday",
        } satisfies ChartEvent;
      })
      .filter((event): event is ChartEvent => event !== null);

    const annotationLabels = ["Process Upgrade", "Staffing Shift"];
    const annotationRatios = [0.35, 0.72];
    const annotations: ChartAnnotation[] = annotationRatios
      .map((ratio, idx) => {
        const point = safeData[pickIndex(ratio)];
        if (!point) return null;
        return {
          date: point.date,
          label: annotationLabels[idx] ?? "Note",
          value: point.value,
        } satisfies ChartAnnotation;
      })
      .filter((annotation): annotation is ChartAnnotation => annotation !== null);

    return { events, annotations };
  }, [data]);

  return (
    <PerformanceChart
      className={className}
      data={chartData}
      holidays={events}
      annotations={annotations}
      timeRange={timeRange}
      ariaLabel="Team performance normalized to rolling average over time"
    />
  );
}
