"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

/**
 * Time Range Context State
 *
 * Provides centralized time range state management for dashboard pages.
 * Each dashboard page can have its own time range that persists during navigation
 * within that page's sections.
 */
interface TimeRangeContextState {
  /** Current time range selection */
  timeRange: TimeRangeKey;
  /** Update the time range */
  setTimeRange: (range: TimeRangeKey) => void;
  /** Reset to default time range */
  resetTimeRange: () => void;
}

/**
 * Time Range Context
 *
 * Context for managing global time range state across a dashboard.
 * Use this to avoid prop drilling and ensure all visualizations
 * on a page use the same time range.
 */
const TimeRangeContext = createContext<TimeRangeContextState | undefined>(undefined);

/**
 * Time Range Provider Props
 */
interface TimeRangeProviderProps {
  /** Child components */
  children: ReactNode;
  /** Default time range (defaults to "max") */
  defaultTimeRange?: TimeRangeKey;
}

/**
 * Time Range Provider Component
 *
 * Wraps dashboard pages to provide centralized time range management.
 * Place this in the layout component for each dashboard type (User, Org, Team, Repo).
 *
 * @example
 * ```tsx
 * <TimeRangeProvider defaultTimeRange="1y">
 *   <DashboardContent />
 * </TimeRangeProvider>
 * ```
 */
export function TimeRangeProvider({
  children,
  defaultTimeRange = "max",
}: TimeRangeProviderProps) {
  const [timeRange, setTimeRangeState] = useState<TimeRangeKey>(defaultTimeRange);

  const setTimeRange = useCallback((range: TimeRangeKey) => {
    setTimeRangeState(range);
  }, []);

  const resetTimeRange = useCallback(() => {
    setTimeRangeState(defaultTimeRange);
  }, [defaultTimeRange]);

  return (
    <TimeRangeContext.Provider value={{ timeRange, setTimeRange, resetTimeRange }}>
      {children}
    </TimeRangeContext.Provider>
  );
}

/**
 * Use Time Range Hook
 *
 * Access the current time range and setter from any child component.
 * Must be used within a TimeRangeProvider.
 *
 * @throws Error if used outside TimeRangeProvider
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const { timeRange, setTimeRange } = useTimeRange();
 *   // Use timeRange to filter data
 *   const filteredData = filterByTimeRange(data, timeRange);
 *   return <Chart data={filteredData} />;
 * }
 * ```
 */
export function useTimeRange(): TimeRangeContextState {
  const context = useContext(TimeRangeContext);

  if (context === undefined) {
    throw new Error(
      "useTimeRange must be used within a TimeRangeProvider. " +
      "Wrap your dashboard layout with <TimeRangeProvider>."
    );
  }

  return context;
}

/**
 * Optional Time Range Hook
 *
 * Returns the time range context if available, or undefined if not within a provider.
 * Useful for components that may be used both inside and outside a TimeRangeProvider.
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const timeRangeContext = useOptionalTimeRange();
 *   const timeRange = timeRangeContext?.timeRange ?? "max";
 *   // Use timeRange...
 * }
 * ```
 */
export function useOptionalTimeRange(): TimeRangeContextState | undefined {
  return useContext(TimeRangeContext);
}
