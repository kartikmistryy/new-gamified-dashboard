/**
 * ContributorPerformanceChartAdapter Component
 *
 * Adapts the existing PerformanceChart component for single contributor display.
 *
 * Responsibilities:
 * - Extract contributor-specific performance data
 * - Transform data into PerformanceChart's expected format
 * - Apply time range filtering
 * - Pass through event/annotation strategies
 * - Handle empty state when contributor has no data
 *
 * Type Safety:
 * - Uses existing PerformanceChart type system
 * - Type-safe data transformation pipeline
 * - Generic constraint ensures contributor compatibility
 * - Maintains type safety from input to chart rendering
 */

"use client";

import { useMemo } from "react";
import { PerformanceChart } from "./PerformanceChart";
import type { ContributorPerformanceChartAdapterProps } from "@/lib/dashboard/contributorCarousel";
import type { OrgPerformanceDataPoint } from "@/lib/dashboard/performanceChart/types";
import { hasPerformanceData } from "@/lib/dashboard/contributorCarousel";

/**
 * ContributorPerformanceChartAdapter Component
 *
 * Wraps PerformanceChart to display a single contributor's performance over time.
 * Extracts the contributor's data from their performanceData property and
 * transforms it into the format expected by PerformanceChart.
 *
 * @example
 * ```tsx
 * <ContributorPerformanceChartAdapter
 *   contributor={{
 *     id: "123",
 *     name: "Alice",
 *     performanceData: [...] // NormalizedPerformanceDataPoint[]
 *   }}
 *   timeRange="3m"
 *   eventStrategy={{ mode: "none" }}
 *   annotationStrategy={{ mode: "dynamic", generator: generateAnnotations }}
 * />
 * ```
 */
export function ContributorPerformanceChartAdapter<T extends { id: string; name: string }>({
  contributor,
  timeRange,
  eventStrategy,
  annotationStrategy,
  className = "",
}: ContributorPerformanceChartAdapterProps<T>) {
  /**
   * Transform contributor performance data to OrgPerformanceDataPoint format
   *
   * PerformanceChart expects data in OrgPerformanceDataPoint format:
   * { date, value, week? }
   *
   * Contributor data is already in NormalizedPerformanceDataPoint format,
   * which is compatible (both have date and value).
   * We just need to ensure the structure is correct.
   */
  const chartData = useMemo<OrgPerformanceDataPoint[]>(() => {
    // Check if contributor has performance data
    if (!hasPerformanceData(contributor)) {
      return [];
    }

    // Map to OrgPerformanceDataPoint format
    // NormalizedPerformanceDataPoint already has { date, value, week? }
    // which matches OrgPerformanceDataPoint structure
    return contributor.performanceData.map((point) => ({
      date: point.date,
      value: point.value,
      week: point.week ?? "", // Provide empty string if week is undefined
    }));
  }, [contributor]);

  /**
   * Empty state - contributor has no performance data
   */
  if (chartData.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-[420px] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg font-medium">No performance data available</p>
          <p className="text-gray-400 text-sm mt-2">
            {hasPerformanceData(contributor)
              ? "This contributor has no data for the selected time period"
              : "Performance data has not been collected yet"}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render PerformanceChart with contributor data
   *
   * Data source type: "user" - represents individual performance
   * This allows PerformanceChart to apply user-specific formatting and behavior
   */
  return (
    <PerformanceChart
      dataSource={{
        type: "user",
        data: chartData,
        userId: contributor.id,
        userName: contributor.name,
      }}
      timeRange={timeRange}
      eventStrategy={eventStrategy}
      annotationStrategy={annotationStrategy}
      ariaLabel={`Performance chart for ${contributor.name}`}
      className={className}
    />
  );
}
