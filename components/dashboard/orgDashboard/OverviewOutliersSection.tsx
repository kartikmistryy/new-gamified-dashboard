"use client";

import { useMemo } from "react";
import { getDevelopersByOwnership } from "@/lib/dashboard/entities/team/mocks/outliersMockData";

/** Mock weekly outlier counts (12 weeks, most recent last) */
const OUTLIER_TREND: number[] = [3, 5, 4, 7, 5, 3, 2, 4, 7, 5, 4, 6];

function MiniAreaChart({ data }: { data: number[] }) {
  const width = 280;
  const height = 64;
  const pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - 2 * pad),
    y: pad + (1 - (v - min) / range) * (height - 2 * pad),
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" aria-hidden="true">
      <defs>
        <linearGradient id="outlier-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#outlier-area-grad)" />
      <path d={line} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

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

      {/* Mini trend chart */}
      <div className="mt-1">
        <MiniAreaChart data={OUTLIER_TREND} />
      </div>
    </div>
  );
}
