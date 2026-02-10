"use client";

import { RouteParamsProvider } from '@/lib/RouteParamsProvider';

/**
 * Repository Dashboard Layout
 *
 * Provides RouteParamsProvider for all repository-level pages.
 * TimeRangeProvider is now in the root layout for global access.
 */
export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      {children}
    </RouteParamsProvider>
  );
}
