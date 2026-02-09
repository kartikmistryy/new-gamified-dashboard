"use client";

import { RouteParamsProvider } from '@/lib/RouteParamsProvider';
import { TimeRangeProvider } from '@/lib/contexts/TimeRangeContext';

/**
 * Team Dashboard Layout
 *
 * Provides RouteParamsProvider and TimeRangeProvider for all team-level pages.
 * The TimeRangeProvider enables centralized time range management across
 * all team dashboard pages and visualizations.
 */
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      <TimeRangeProvider defaultTimeRange="1y">
        {children}
      </TimeRangeProvider>
    </RouteParamsProvider>
  );
}
