/**
 * Multi Time Range Context Provider
 *
 * Advanced context provider for pages that need multiple independent time ranges.
 * Used in Design pages where different visualizations need separate time filters
 * (e.g., collaboration network vs chaos matrix).
 *
 * @module lib/dashboard/MultiTimeRangeContext
 */

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

/**
 * Configuration for named time range filters
 *
 * Maps filter names to their configuration. Each name becomes an independent
 * time range that can be accessed via useNamedTimeRange(name).
 *
 * @example
 * ```tsx
 * const config: MultiTimeRangeConfig = {
 *   ranges: {
 *     collaboration: { defaultRange: "3m" },
 *     chaos: { defaultRange: "max" },
 *     performance: { defaultRange: "1m", options: customOptions },
 *   },
 * };
 * ```
 */
export interface MultiTimeRangeConfig {
  ranges: {
    [name: string]: NamedTimeRangeConfig;
  };
}

/**
 * Multi-range context value with dynamic keys
 *
 * Provides type-safe access to multiple time ranges by name.
 * Internal API used by hooks.
 */
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

/**
 * Return type for useNamedTimeRange hook
 *
 * Similar to UseTimeRangeResult but for a specific named range.
 */
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

/**
 * Hook for accessing a specific named time range
 *
 * Primary hook for consuming a single time range from the multi-range context.
 * Each call to this hook with a different name returns independent state.
 *
 * @param name - The name/key of the time range to access
 * @returns State and controls for the named range
 *
 * @throws {Error} If used outside MultiTimeRangeProvider
 * @throws {Error} If name doesn't exist in config
 *
 * @example
 * ```tsx
 * function CollaborationSection() {
 *   const { timeRange, setTimeRange, options } = useNamedTimeRange('collaboration');
 *
 *   return (
 *     <DashboardSection
 *       title="Collaboration Network"
 *       action={
 *         <TimeRangeFilter
 *           value={timeRange}
 *           onChange={setTimeRange}
 *           options={options}
 *         />
 *       }
 *     >
 *       <CollaborationNetwork timeRange={timeRange} />
 *     </DashboardSection>
 *   );
 * }
 * ```
 */
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

/**
 * Hook for accessing all time ranges (advanced usage)
 *
 * Provides access to the full multi-range context for advanced use cases
 * like bulk operations or observing all ranges.
 *
 * @throws {Error} If used outside MultiTimeRangeProvider
 * @returns Full context value with all range operations
 *
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const { getRangeNames, getTimeRange, resetAll } = useMultiTimeRange();
 *
 *   return (
 *     <div>
 *       {getRangeNames().map((name) => (
 *         <div key={name}>
 *           {name}: {getTimeRange(name)}
 *         </div>
 *       ))}
 *       <button onClick={resetAll}>Reset All Filters</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiTimeRange(): Omit<MultiTimeRangeContextValue, never> {
  return useMultiTimeRangeInternal();
}

/**
 * Props for MultiTimeRangeProvider
 */
interface MultiTimeRangeProviderProps {
  /** Configuration mapping names to time range configs */
  config: MultiTimeRangeConfig;
  /** Child components that will consume named time ranges */
  children: ReactNode;
}

/**
 * Multi Time Range Provider Component
 *
 * Provides multiple independent time ranges for complex pages.
 * Use this for Design pages or any page that needs separate time filters
 * for different visualizations.
 *
 * **When to use:**
 * - Pages with 2+ visualizations that need independent time ranges
 * - Design pages (collaboration network + chaos matrix)
 * - Comparison pages with multiple chart types
 *
 * **When NOT to use:**
 * - Pages with single time range (use TimeRangeProvider instead)
 * - Pages where all visualizations share the same filter
 *
 * @param props.config - Configuration with named ranges
 * @param props.children - Child components
 *
 * @example
 * ```tsx
 * // Team Design Page with two independent filters
 * export function TeamDesignPageClient() {
 *   const { teamId } = useRouteParams();
 *
 *   return (
 *     <MultiTimeRangeProvider
 *       config={{
 *         ranges: {
 *           collaboration: { defaultRange: "3m" },
 *           chaos: { defaultRange: "max" },
 *         },
 *       }}
 *     >
 *       <CollaborationSection />
 *       <ChaosSection />
 *       <MembersSection />
 *     </MultiTimeRangeProvider>
 *   );
 * }
 *
 * // Child component uses named range
 * function CollaborationSection() {
 *   const { timeRange } = useNamedTimeRange('collaboration');
 *   return <CollaborationNetwork timeRange={timeRange} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom options per range
 * export function OrgDesignPageClient() {
 *   const collaborationOptions = useMemo(() => {
 *     return TIME_RANGE_OPTIONS.map((opt) => ({
 *       ...opt,
 *       disabled: opt.id === "1m", // Disable 1m for collaboration
 *     }));
 *   }, []);
 *
 *   return (
 *     <MultiTimeRangeProvider
 *       config={{
 *         ranges: {
 *           ownership: {
 *             defaultRange: "3m",
 *             options: TIME_RANGE_OPTIONS,
 *           },
 *           chaos: {
 *             defaultRange: "max",
 *             options: collaborationOptions,
 *           },
 *         },
 *       }}
 *     >
 *       <OwnershipSection />
 *       <ChaosSection />
 *     </MultiTimeRangeProvider>
 *   );
 * }
 * ```
 */
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

/**
 * Utility hook to access multiple named ranges at once
 *
 * Convenience hook for components that need to access multiple ranges
 * without multiple hook calls.
 *
 * @param names - Array of range names to access
 * @returns Map of range names to their current values
 *
 * @example
 * ```tsx
 * function ComparisonChart() {
 *   const ranges = useMultipleNamedRanges(['performance', 'comparison']);
 *
 *   return (
 *     <div>
 *       <Chart1 timeRange={ranges.performance} />
 *       <Chart2 timeRange={ranges.comparison} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleNamedRanges(
  names: string[]
): Record<string, TimeRangeKey> {
  const { getTimeRange } = useMultiTimeRangeInternal();

  return useMemo(() => {
    const result: Record<string, TimeRangeKey> = {};
    names.forEach((name) => {
      result[name] = getTimeRange(name);
    });
    return result;
  }, [names, getTimeRange]);
}
