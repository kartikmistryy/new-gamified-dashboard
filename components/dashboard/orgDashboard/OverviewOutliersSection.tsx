"use client";

import { useMemo } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { getDevelopersByOwnership } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

export function OverviewOutliersSection() {
  const critical = useMemo(() => getDevelopersByOwnership("lower"), []);
  const needsAttention = useMemo(() => getDevelopersByOwnership("higher"), []);

  return (
    <div className="flex flex-col gap-4">
      {/* Critical Outliers */}
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="size-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Critical</p>
            <p className="text-xl font-bold text-gray-900">{critical.length}</p>
          </div>
          <span className="text-xs font-medium text-red-600">+12% vs last mo.</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Share of Ownership lower than expected
        </p>
      </div>

      {/* Needs Attention */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100">
            <Eye className="size-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Needs Attention</p>
            <p className="text-xl font-bold text-gray-900">{needsAttention.length}</p>
          </div>
          <span className="text-xs font-medium text-green-600">-5% vs last mo.</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Share of Ownership higher than expected
        </p>
      </div>
    </div>
  );
}
