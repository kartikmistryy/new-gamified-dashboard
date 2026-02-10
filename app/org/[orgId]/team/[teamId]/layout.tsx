"use client";

import { RouteParamsProvider } from '@/lib/RouteParamsProvider';

/**
 * Team Dashboard Layout
 *
 * Provides RouteParamsProvider for all team-level pages.
 * TimeRangeProvider is now in the root layout for global access.
 */
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      {children}
    </RouteParamsProvider>
  );
}
