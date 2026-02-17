"use client";

import { useMemo } from "react";
import { getDevelopersByOwnership } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

export function OverviewOutliersSection() {
  const critical = useMemo(() => getDevelopersByOwnership("lower"), []);
  const needsAttention = useMemo(() => getDevelopersByOwnership("higher"), []);

  return (
    <div className="flex flex-col gap-3">
      {/* Critical */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums text-red-600">{critical.length}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Critical</p>
          <p className="text-xs text-gray-500">Share of Ownership lower than expected</p>
        </div>
        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">+12%</span>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Needs Attention */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums text-amber-500">{needsAttention.length}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Needs Attention</p>
          <p className="text-xs text-gray-500">Share of Ownership higher than expected</p>
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">-5%</span>
      </div>
    </div>
  );
}
