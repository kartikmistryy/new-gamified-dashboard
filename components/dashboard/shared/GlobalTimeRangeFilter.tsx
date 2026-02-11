"use client";

import { useTimeRange } from "@/lib/dashboard/shared/TimeRangeContext";
import { TimeRangeFilter } from "@/components/dashboard/shared/TimeRangeFilter";
import { TIME_RANGE_OPTIONS } from "@/lib/shared/types/timeRangeTypes";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

/**
 * Global Time Range Filter Props
 */
interface GlobalTimeRangeFilterProps {
  /** Optional custom time range options (defaults to standard options) */
  options?: ReadonlyArray<{ id: TimeRangeKey; label: string; disabled?: boolean }>;
  /** Additional CSS classes */
  className?: string;
  /** Label text to display before the filter */
  label?: string;
  /** Whether to show label */
  showLabel?: boolean;
}

/**
 * Global Time Range Filter Component
 *
 * A prominent time range filter that sits at the top of dashboard pages.
 * Connects to the TimeRangeContext to manage global time range state.
 *
 * Design:
 * - Placed at the top of each dashboard page
 * - Uses badge/pill UI from TimeRangeFilter
 * - Includes optional "Time Range:" label for clarity
 * - Consistent styling across all dashboard types
 *
 * @example
 * ```tsx
 * // In a dashboard page
 * <div className="dashboard-page">
 *   <GlobalTimeRangeFilter showLabel />
 *   <DashboardContent />
 * </div>
 * ```
 */
export function GlobalTimeRangeFilter({
  options = TIME_RANGE_OPTIONS,
  className = "",
  label = "",
  showLabel = true,
}: GlobalTimeRangeFilterProps) {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <div
      className={`flex items-center gap-3 mb-6 ${className}`}
      role="region"
      aria-label="Time range filter"
    >
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
      <TimeRangeFilter
        options={options}
        value={timeRange}
        onChange={setTimeRange}
        size="default"
      />
    </div>
  );
}

/**
 * Compact Global Time Range Filter
 *
 * A more compact version for use in layouts with limited space.
 * Uses smaller sizing and optional label.
 *
 * @example
 * ```tsx
 * <CompactGlobalTimeRangeFilter />
 * ```
 */
export function CompactGlobalTimeRangeFilter({
  options = TIME_RANGE_OPTIONS,
  className = "",
}: Omit<GlobalTimeRangeFilterProps, "showLabel" | "label">) {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <div
      className={`flex items-center ${className}`}
      role="region"
      aria-label="Time range filter"
    >
      <TimeRangeFilter
        options={options}
        value={timeRange}
        onChange={setTimeRange}
        size="sm"
      />
    </div>
  );
}
