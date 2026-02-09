/**
 * Time Range Filter Component
 *
 * Unified time range filter component that works in both context-aware
 * and controlled modes. Automatically integrates with TimeRangeContext
 * when available, or can be used standalone with explicit props.
 *
 * @module lib/dashboard/TimeRangeFilter
 */

"use client";

import { Badge } from "@/components/shared/Badge";
import { useOptionalTimeRange } from "./TimeRangeContext";
import type { TimeRangeOption, TimeRangeKey } from "./timeRangeTypes";

/**
 * Props for TimeRangeFilter component
 *
 * All props are optional when used inside TimeRangeProvider.
 * When used standalone, value/onChange are required.
 */
interface TimeRangeFilterProps {
  /**
   * Current time range value (controlled mode)
   * Optional if used inside TimeRangeProvider
   */
  value?: TimeRangeKey;
  /**
   * Change handler (controlled mode)
   * Optional if used inside TimeRangeProvider
   */
  onChange?: (value: TimeRangeKey) => void;
  /**
   * Available time range options (controlled mode)
   * Optional - defaults to context options or TIME_RANGE_OPTIONS
   */
  options?: TimeRangeOption[];
  /**
   * Visual size variant
   * - `sm`: Compact size for tight layouts
   * - `default`: Standard size
   */
  size?: "sm" | "default";
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Accessible label for the filter group
   * Recommended for screen readers
   */
  ariaLabel?: string;
}

/**
 * Time Range Filter Component
 *
 * **Context-Aware Mode** (Automatic):
 * When placed inside a TimeRangeProvider, automatically syncs with context state.
 * No props needed - just render `<TimeRangeFilter />`.
 *
 * **Controlled Mode** (Explicit):
 * When used standalone, requires value/onChange props like a controlled input.
 * Useful for local state or integration with external state management.
 *
 * **Visual Design:**
 * - Badge-based UI with active/inactive states
 * - Hover effects for better interactivity
 * - Disabled state support for insufficient data scenarios
 * - Responsive flex layout with gap spacing
 *
 * @param props - Component props (all optional if inside provider)
 * @returns Rendered time range filter UI
 *
 * @throws {Error} In controlled mode if value/onChange are missing
 *
 * @example
 * ```tsx
 * // Context-aware mode (simplest usage)
 * function MyPage() {
 *   return (
 *     <TimeRangeProvider config={{ defaultRange: "1m" }}>
 *       <DashboardSection
 *         title="Performance"
 *         action={<TimeRangeFilter />}
 *       >
 *         <PerformanceChart />
 *       </DashboardSection>
 *     </TimeRangeProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Controlled mode (explicit state)
 * function StandaloneFilter() {
 *   const [range, setRange] = useState<TimeRangeKey>("3m");
 *
 *   return (
 *     <TimeRangeFilter
 *       value={range}
 *       onChange={setRange}
 *       options={TIME_RANGE_OPTIONS}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom options and disabled states
 * function SmartFilter() {
 *   const options = useMemo(() => [
 *     { id: "1m", label: "1 Month", disabled: !hasDataFor1m },
 *     { id: "3m", label: "3 Months" },
 *     { id: "1y", label: "1 Year" },
 *     { id: "max", label: "Max" },
 *   ], [hasDataFor1m]);
 *
 *   return (
 *     <TimeRangeProvider config={{ defaultRange: "3m", options }}>
 *       <TimeRangeFilter size="sm" />
 *     </TimeRangeProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Multi-range with named filters
 * function DesignPage() {
 *   const collaboration = useNamedTimeRange('collaboration');
 *   const chaos = useNamedTimeRange('chaos');
 *
 *   return (
 *     <>
 *       <DashboardSection
 *         title="Collaboration"
 *         action={
 *           <TimeRangeFilter
 *             value={collaboration.timeRange}
 *             onChange={collaboration.setTimeRange}
 *             options={collaboration.options}
 *           />
 *         }
 *       />
 *       <DashboardSection
 *         title="Chaos"
 *         action={
 *           <TimeRangeFilter
 *             value={chaos.timeRange}
 *             onChange={chaos.setTimeRange}
 *             options={chaos.options}
 *           />
 *         }
 *       />
 *     </>
 *   );
 * }
 * ```
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
  let filterOptions: TimeRangeOption[];

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

/**
 * Compact time range filter for toolbar usage
 *
 * Pre-configured small variant with minimal styling.
 * Useful for embedding in page headers or toolbars.
 *
 * @example
 * ```tsx
 * <DashboardHeader actions={<CompactTimeRangeFilter />} />
 * ```
 */
export function CompactTimeRangeFilter(
  props: Omit<TimeRangeFilterProps, "size">
) {
  return <TimeRangeFilter {...props} size="sm" />;
}
