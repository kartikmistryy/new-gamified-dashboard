"use client";

import { RouteParamsProvider } from '@/lib/RouteParamsProvider';
import { TimeRangeProvider } from '@/lib/contexts/TimeRangeContext';

/**
 * Repository Dashboard Layout
 *
 * Provides RouteParamsProvider and TimeRangeProvider for all repository-level pages.
 * The TimeRangeProvider enables centralized time range management across
 * all repository dashboard pages and visualizations.
 */
export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      <TimeRangeProvider defaultTimeRange="1y">
        {children}
      </TimeRangeProvider>
    </RouteParamsProvider>
  );
}
