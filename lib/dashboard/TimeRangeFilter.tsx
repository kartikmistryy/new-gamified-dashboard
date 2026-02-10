/** Time Range Filter - Context-aware or controlled time range selector */

"use client";

import { Badge } from "@/components/shared/Badge";
import { useOptionalTimeRange } from "./TimeRangeContext";
import type { TimeRangeOption, TimeRangeKey } from "./timeRangeTypes";

interface TimeRangeFilterProps {
  /** Current time range (optional if in TimeRangeProvider) */
  value?: TimeRangeKey;
  /** Change handler (optional if in TimeRangeProvider) */
  onChange?: (value: TimeRangeKey) => void;
  /** Available options (defaults to context options) */
  options?: readonly TimeRangeOption[];
  /** Size variant: 'sm' or 'default' */
  size?: "sm" | "default";
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Time range filter with context-aware or controlled mode.
 * Use inside TimeRangeProvider for automatic sync, or pass value/onChange for controlled mode.
 */
export function TimeRangeFilter({
  value: controlledValue,
  onChange: controlledOnChange,
  options: controlledOptions,
  size = "default",
  className = "",
  ariaLabel = "Time range filter",
}: TimeRangeFilterProps) {
  // Try to use context, fall back to controlled props
  const contextValue = useOptionalTimeRange();

  let timeRange: TimeRangeKey;
  let setTimeRange: (value: TimeRangeKey) => void;
  let filterOptions: readonly TimeRangeOption[];

  if (contextValue !== null) {
    // Context mode: use context values, allow prop overrides
    timeRange = controlledValue ?? contextValue.timeRange;
    setTimeRange = controlledOnChange ?? contextValue.setTimeRange;
    filterOptions = controlledOptions ?? contextValue.options;
  } else {
    // Controlled mode: props are required
    if (controlledValue === undefined || controlledOnChange === undefined) {
      throw new Error(
        'TimeRangeFilter requires either TimeRangeProvider context or explicit value/onChange props. ' +
        'Either wrap the component in <TimeRangeProvider> or pass value and onChange explicitly.'
      );
    }
    timeRange = controlledValue;
    setTimeRange = controlledOnChange;
    filterOptions = controlledOptions ?? [];
  }

  // Responsive padding based on size prop
  const paddingClass = size === "sm" ? "px-2 py-1.5" : "px-3 py-2";
  const textClass = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {filterOptions.map((opt) => {
        const isActive = timeRange === opt.id;
        const isDisabled = opt.disabled === true;

        return (
          <Badge
            key={String(opt.id)}
            onClick={() => !isDisabled && setTimeRange(opt.id)}
            aria-disabled={isDisabled ? "true" : undefined}
            aria-pressed={isActive ? "true" : "false"}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setTimeRange(opt.id);
              }
            }}
            className={`${paddingClass} ${textClass} rounded-lg font-medium transition-colors ${
              isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isActive
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100 cursor-pointer"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            {opt.label}
          </Badge>
        );
      })}
    </div>
  );
}

/** Compact time range filter pre-configured with sm size */
export function CompactTimeRangeFilter(
  props: Omit<TimeRangeFilterProps, "size">
) {
  return <TimeRangeFilter {...props} size="sm" />;
}
