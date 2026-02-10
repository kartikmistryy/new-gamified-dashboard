/** Time Range Context - Centralized state management for time range filtering across dashboard pages */

'use client';

import { useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { getStrictContext } from '@/lib/get-strict-context';
import type { TimeRangeKey } from '@/lib/shared/types/timeRangeTypes';
import { TIME_RANGE_OPTIONS } from '@/lib/shared/types/timeRangeTypes';

/**
 * Time range option with label and optional disabled state
 */
export interface TimeRangeOption {
  id: TimeRangeKey;
  label: string;
  disabled?: boolean;
}

/**
 * Configuration for a dashboard's time range behavior
 */
export interface TimeRangeConfig {
  defaultRange: TimeRangeKey;
  options?: ReadonlyArray<TimeRangeOption>;
  persistToUrl?: boolean;
}

/**
 * Callback function type for time range changes
 */
export type TimeRangeChangeHandler = (range: TimeRangeKey) => void;

/**
 * Hook return type with state and setter
 */
export interface UseTimeRangeResult {
  timeRange: TimeRangeKey;
  setTimeRange: TimeRangeChangeHandler;
  options: ReadonlyArray<TimeRangeOption>;
}

/** Context value shape - includes both public API and internal methods */
interface TimeRangeContextValue extends UseTimeRangeResult {
  /** Reset time range to the configured default value */
  resetTimeRange: () => void;
}

/** Create strictly-typed context that errors if used outside provider */
const [TimeRangeContext, useTimeRangeInternal] = getStrictContext<TimeRangeContextValue>('TimeRange');

/** Primary hook for consuming time range from context - returns state, setter, and options */
export function useTimeRange(): UseTimeRangeResult {
  const { timeRange, setTimeRange, options } = useTimeRangeInternal();
  return { timeRange, setTimeRange, options };
}

/** Advanced hook that exposes reset functionality - use for "Clear Filters" buttons */
export function useTimeRangeWithReset(): TimeRangeContextValue {
  return useTimeRangeInternal();
}

/** Optional hook - returns null if outside provider, useful for flexible components */
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

/** Time Range Provider Props */
interface TimeRangeProviderProps {
  /** Configuration object with default range and options */
  config: TimeRangeConfig;
  /** Child components that will consume the time range */
  children: ReactNode;
}

/** Time Range Provider - provides centralized time range state for a dashboard page */
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

/** Higher-order component to inject time range props - use for class components or non-hook-compatible components */
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

/** Custom hook combining time range state with data filtering - automatically memoizes filtered results */
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
