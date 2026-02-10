"use client";

import { RouteParamsProvider } from '@/lib/RouteParamsProvider';

/**
 * Organization Layout
 *
 * Provides RouteParamsProvider for all org-level pages.
 * TimeRangeProvider is now in the root layout for global access.
 */
export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      {children}
    </RouteParamsProvider>
  );
}
