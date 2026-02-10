/** Multi Time Range Context - Provider for pages needing multiple independent time ranges */

'use client';

import { createContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { getStrictContext } from '@/lib/get-strict-context';
import {
  TimeRangeKey,
  TIME_RANGE_OPTIONS,
  type TimeRangeOption,
  type TimeRangeChangeHandler,
} from './timeRangeTypes';

/**
 * Configuration for a single named time range
 */
export interface NamedTimeRangeConfig {
  /** Default time range value for this filter */
  defaultRange: TimeRangeKey;
  /** Custom options (optional, defaults to TIME_RANGE_OPTIONS) */
  options?: ReadonlyArray<TimeRangeOption>;
}

/** Configuration for named time range filters - maps filter names to their config */
export interface MultiTimeRangeConfig {
  ranges: {
    [name: string]: NamedTimeRangeConfig;
  };
}

/** Multi-range context value - provides type-safe access to multiple time ranges by name */
interface MultiTimeRangeContextValue {
  /** Get current value for a named range */
  getTimeRange: (name: string) => TimeRangeKey;
  /** Set value for a named range */
  setTimeRange: (name: string, range: TimeRangeKey) => void;
  /** Get options for a named range */
  getOptions: (name: string) => ReadonlyArray<TimeRangeOption>;
  /** Reset a named range to its default value */
  resetTimeRange: (name: string) => void;
  /** Reset all ranges to their defaults */
  resetAll: () => void;
  /** Get all range names configured */
  getRangeNames: () => string[];
}

/**
 * Create strictly-typed multi-range context
 */
const [MultiTimeRangeContext, useMultiTimeRangeInternal] =
  getStrictContext<MultiTimeRangeContextValue>('MultiTimeRange');

/** Return type for useNamedTimeRange hook - similar to UseTimeRangeResult but for a specific named range */
export interface NamedTimeRangeResult {
  /** Current time range value for this named filter */
  timeRange: TimeRangeKey;
  /** Function to update this specific time range */
  setTimeRange: TimeRangeChangeHandler;
  /** Available options for this time range */
  options: ReadonlyArray<TimeRangeOption>;
  /** Reset this specific range to default */
  resetTimeRange: () => void;
}

/** Hook for accessing a specific named time range - primary hook for consuming a single time range */
export function useNamedTimeRange(name: string): NamedTimeRangeResult {
  const ctx = useMultiTimeRangeInternal();

  // Memoize the result to maintain referential equality
  return useMemo(
    () => ({
      timeRange: ctx.getTimeRange(name),
      setTimeRange: (range: TimeRangeKey) => ctx.setTimeRange(name, range),
      options: ctx.getOptions(name),
      resetTimeRange: () => ctx.resetTimeRange(name),
    }),
    [ctx, name]
  );
}

/** Hook for accessing all time ranges - provides full multi-range context for advanced use cases */
export function useMultiTimeRange(): Omit<MultiTimeRangeContextValue, never> {
  return useMultiTimeRangeInternal();
}

/** Props for MultiTimeRangeProvider */
interface MultiTimeRangeProviderProps {
  /** Configuration mapping names to time range configs */
  config: MultiTimeRangeConfig;
  /** Child components that will consume named time ranges */
  children: ReactNode;
}

/** Multi Time Range Provider - provides multiple independent time ranges for complex pages */
export function MultiTimeRangeProvider({
  config,
  children,
}: MultiTimeRangeProviderProps) {
  // Initialize all ranges with their defaults
  const [ranges, setRanges] = useState<Record<string, TimeRangeKey>>(() => {
    const initial: Record<string, TimeRangeKey> = {};
    Object.entries(config.ranges).forEach(([name, { defaultRange }]) => {
      initial[name] = defaultRange;
    });
    return initial;
  });

  // Get current value for a named range (with fallback)
  const getTimeRange = useCallback(
    (name: string): TimeRangeKey => {
      return ranges[name] ?? config.ranges[name]?.defaultRange ?? "max";
    },
    [ranges, config.ranges]
  );

  // Set value for a named range
  const setTimeRange = useCallback((name: string, range: TimeRangeKey) => {
    setRanges((prev) => ({ ...prev, [name]: range }));
  }, []);

  // Get options for a named range
  const getOptions = useCallback(
    (name: string): ReadonlyArray<TimeRangeOption> => {
      return config.ranges[name]?.options ?? TIME_RANGE_OPTIONS;
    },
    [config.ranges]
  );

  // Reset a specific named range to default
  const resetTimeRange = useCallback(
    (name: string) => {
      const defaultRange = config.ranges[name]?.defaultRange;
      if (defaultRange) {
        setRanges((prev) => ({ ...prev, [name]: defaultRange }));
      }
    },
    [config.ranges]
  );

  // Reset all ranges to defaults
  const resetAll = useCallback(() => {
    const reset: Record<string, TimeRangeKey> = {};
    Object.entries(config.ranges).forEach(([name, { defaultRange }]) => {
      reset[name] = defaultRange;
    });
    setRanges(reset);
  }, [config.ranges]);

  // Get all configured range names
  const getRangeNames = useCallback(() => {
    return Object.keys(config.ranges);
  }, [config.ranges]);

  // Memoize context value
  const value: MultiTimeRangeContextValue = useMemo(
    () => ({
      getTimeRange,
      setTimeRange,
      getOptions,
      resetTimeRange,
      resetAll,
      getRangeNames,
    }),
    [getTimeRange, setTimeRange, getOptions, resetTimeRange, resetAll, getRangeNames]
  );

  return (
    <MultiTimeRangeContext.Provider value={value}>
      {children}
    </MultiTimeRangeContext.Provider>
  );
}

// Re-export utility hooks
export { useMultipleNamedRanges } from './multiTimeRangeUtils';
