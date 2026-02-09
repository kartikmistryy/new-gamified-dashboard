/**
 * Time Range Context Provider
 *
 * Centralized state management for time range filtering across dashboard pages.
 * Provides a single source of truth for time range state with full type safety.
 *
 * @module lib/dashboard/TimeRangeContext
 */

'use client';

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { getStrictContext } from '@/lib/get-strict-context';
import {
  TimeRangeKey,
  TimeRangeConfig,
  TimeRangeChangeHandler,
  UseTimeRangeResult,
  TIME_RANGE_OPTIONS,
  type TimeRangeOption,
} from './timeRangeTypes';

/**
 * Context value shape with full type safety
 *
 * Internal context value that includes both public API and internal methods.
 */
interface TimeRangeContextValue extends UseTimeRangeResult {
  /** Reset time range to the configured default value */
  resetTimeRange: () => void;
}

/**
 * Create strictly-typed context that errors if used outside provider
 *
 * Uses getStrictContext utility to eliminate null checks at call sites.
 * The hook will throw a clear error if used outside TimeRangeProvider.
 */
const [TimeRangeContext, useTimeRangeInternal] =
  getStrictContext<TimeRangeContextValue>('TimeRange');

/**
 * Primary hook for consuming time range from context
 *
 * Use this hook in any component within a TimeRangeProvider to access
 * the current time range state and update function.
 *
 * @throws {Error} If used outside TimeRangeProvider
 * @returns Time range state, setter, and available options
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const { timeRange, setTimeRange, options } = useTimeRange();
 *
 *   const filteredData = useMemo(
 *     () => filterDataByTimeRange(data, timeRange),
 *     [data, timeRange]
 *   );
 *
 *   return <Chart data={filteredData} />;
 * }
 * ```
 */
export function useTimeRange(): UseTimeRangeResult {
  const { timeRange, setTimeRange, options } = useTimeRangeInternal();
  return { timeRange, setTimeRange, options };
}

/**
 * Advanced hook that exposes reset functionality
 *
 * Use this when you need to reset the filter to its default value,
 * such as in a "Clear Filters" button or when switching dashboard views.
 *
 * @throws {Error} If used outside TimeRangeProvider
 * @returns Full context value including reset function
 *
 * @example
 * ```tsx
 * function FilterControls() {
 *   const { timeRange, setTimeRange, resetTimeRange } = useTimeRangeWithReset();
 *
 *   return (
 *     <div>
 *       <TimeRangeFilter />
 *       <button onClick={resetTimeRange}>Reset to Default</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimeRangeWithReset(): TimeRangeContextValue {
  return useTimeRangeInternal();
}

/**
 * Optional hook to check if TimeRangeProvider is available
 *
 * Useful for components that can work with or without time range context.
 * Returns null if used outside provider, otherwise returns the context value.
 *
 * @returns Context value or null if outside provider
 *
 * @example
 * ```tsx
 * function FlexibleChart() {
 *   const timeRangeContext = useOptionalTimeRange();
 *
 *   if (timeRangeContext) {
 *     // Use context-based filtering
 *     const { timeRange } = timeRangeContext;
 *     return <Chart data={filterData(timeRange)} />;
 *   }
 *
 *   // Fallback to showing all data
 *   return <Chart data={allData} />;
 * }
 * ```
 */
export function useOptionalTimeRange(): UseTimeRangeResult | null {
  const context = useContext(TimeRangeContext);
  if (context === null) {
    return null;
  }
  return {
    timeRange: context.timeRange,
    setTimeRange: context.setTimeRange,
    options: context.options,
  };
}

/**
 * Time Range Provider Props
 */
interface TimeRangeProviderProps {
  /** Configuration object with default range and options */
  config: TimeRangeConfig;
  /** Child components that will consume the time range */
  children: ReactNode;
}

/**
 * Time Range Provider Component
 *
 * Provides centralized time range state for a dashboard page and all its children.
 * Each dashboard page (org/team/repo/user) should wrap its content with this provider
 * at the appropriate level (usually the top-level page component).
 *
 * **Architecture Notes:**
 * - Creates isolated time range state per provider instance
 * - Multiple providers can coexist for different dashboard sections
 * - State is maintained in React state (not persisted by default)
 * - Memoized to prevent unnecessary re-renders
 *
 * @param props.config - Configuration with default range and options
 * @param props.children - Child components
 *
 * @example
 * ```tsx
 * // Simple usage with default options
 * export function TeamPerformancePageClient() {
 *   return (
 *     <TimeRangeProvider config={{ defaultRange: "1m" }}>
 *       <PerformanceCharts />
 *       <PerformanceTables />
 *     </TimeRangeProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom options (e.g., disabled ranges)
 * export function OrgPerformancePageClient() {
 *   const options = useMemo(() => {
 *     return TIME_RANGE_OPTIONS.map((opt) => ({
 *       ...opt,
 *       disabled: !hasDataForRange(opt.id),
 *     }));
 *   }, []);
 *
 *   return (
 *     <TimeRangeProvider config={{ defaultRange: "1y", options }}>
 *       <PerformanceContent />
 *     </TimeRangeProvider>
 *   );
 * }
 * ```
 */
export function TimeRangeProvider({
  config,
  children,
}: TimeRangeProviderProps) {
  const { defaultRange, options = TIME_RANGE_OPTIONS } = config;

  // Initialize state with configured default
  const [timeRange, setTimeRangeState] = useState<TimeRangeKey>(defaultRange);

  // Memoized setter to maintain referential equality
  const setTimeRange = useCallback<TimeRangeChangeHandler>((range: TimeRangeKey) => {
    setTimeRangeState(range);
  }, []);

  // Reset function to restore default value
  const resetTimeRange = useCallback(() => {
    setTimeRangeState(defaultRange);
  }, [defaultRange]);

  // Memoize context value to prevent unnecessary re-renders
  const value: TimeRangeContextValue = useMemo(
    () => ({
      timeRange,
      setTimeRange,
      options,
      resetTimeRange,
    }),
    [timeRange, setTimeRange, options, resetTimeRange]
  );

  return (
    <TimeRangeContext.Provider value={value}>
      {children}
    </TimeRangeContext.Provider>
  );
}

/**
 * Higher-order component to inject time range props
 *
 * Use this when you need to pass time range to class components or
 * non-hook-compatible components. Prefer hooks in modern functional components.
 *
 * @param Component - The component to wrap
 * @returns Wrapped component with injected time range props
 *
 * @example
 * ```tsx
 * // Legacy class component or third-party component
 * interface LegacyChartProps extends UseTimeRangeResult {
 *   data: DataPoint[];
 * }
 *
 * class LegacyChart extends React.Component<LegacyChartProps> {
 *   render() {
 *     const { timeRange, data } = this.props;
 *     return <div>Chart for {timeRange}</div>;
 *   }
 * }
 *
 * // Wrap with HOC
 * const ChartWithTimeRange = withTimeRange(LegacyChart);
 *
 * // Use in functional component
 * function Dashboard() {
 *   return (
 *     <TimeRangeProvider config={{ defaultRange: "1m" }}>
 *       <ChartWithTimeRange data={data} />
 *     </TimeRangeProvider>
 *   );
 * }
 * ```
 */
export function withTimeRange<P extends UseTimeRangeResult>(
  Component: React.ComponentType<P>
) {
  function TimeRangeInjectedComponent(
    props: Omit<P, keyof UseTimeRangeResult>
  ) {
    const timeRangeProps = useTimeRange();
    return <Component {...(props as P)} {...timeRangeProps} />;
  }

  // Set display name for better debugging
  const componentName = Component.displayName || Component.name || 'Component';
  TimeRangeInjectedComponent.displayName = `withTimeRange(${componentName})`;

  return TimeRangeInjectedComponent;
}

/**
 * Custom hook for time range with derived data filtering
 *
 * Convenience hook that combines time range state with data filtering logic.
 * Automatically memoizes filtered results for performance.
 *
 * @param data - The data to filter
 * @param filterFn - Function to filter data by time range
 * @returns Filtered data and time range controls
 *
 * @example
 * ```tsx
 * function PerformanceChart({ data }: { data: DataPoint[] }) {
 *   const { filteredData, timeRange, setTimeRange } = useTimeRangeFilter(
 *     data,
 *     (items, range) => filterByTimeRange(items, range)
 *   );
 *
 *   return <Chart data={filteredData} />;
 * }
 * ```
 */
export function useTimeRangeFilter<T>(
  data: T[],
  filterFn: (data: T[], range: TimeRangeKey) => T[]
) {
  const { timeRange, setTimeRange, options } = useTimeRange();

  const filteredData = useMemo(
    () => filterFn(data, timeRange),
    [data, timeRange, filterFn]
  );

  return {
    filteredData,
    timeRange,
    setTimeRange,
    options,
  };
}
