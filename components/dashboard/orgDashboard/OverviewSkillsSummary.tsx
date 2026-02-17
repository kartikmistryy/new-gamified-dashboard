"use client";

import { useMemo } from "react";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";

type Props = {
  skillData: SkillsRoadmapProgressData[] | null;
};

function totalDevs(d: SkillsRoadmapProgressData): number {
  return d.developerCounts.basic + d.developerCounts.intermediate + d.developerCounts.advanced;
}

export function OverviewSkillsSummary({ skillData }: Props) {
  const topByProgress = useMemo(() => {
    if (!skillData) return [];
    return [...skillData].sort((a, b) => b.progressPercent - a.progressPercent).slice(0, 5);
  }, [skillData]);

  const topByDevs = useMemo(() => {
    if (!skillData) return [];
    return [...skillData].sort((a, b) => totalDevs(b) - totalDevs(a)).slice(0, 5);
  }, [skillData]);

  if (!skillData) {
    return <div className="py-6 text-center text-sm text-gray-400">Loading skills data...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hero stat */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{skillData.length}</span>
        <span className="text-sm text-gray-500">active roadmaps tracked</span>
      </div>

      {/* Top 5 Skills-based Roadmaps */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          Top 5 Skills-based Roadmaps
        </p>
        <div className="flex flex-col gap-2.5">
          {topByProgress.map((s) => (
            <div key={s.roadmap.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 truncate flex-1 min-w-0">{s.roadmap.name}</span>
              <div className="w-20 h-2.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${s.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-gray-500 w-8 text-right shrink-0">
                {s.progressPercent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Most Frequently Used Skills */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          Top 5 Most Frequently Used Skills (Past Month)
        </p>
        <div className="flex flex-col gap-2.5">
          {topByDevs.map((s) => (
            <div key={s.roadmap.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 truncate flex-1 min-w-0">{s.roadmap.name}</span>
              <span className="text-xs font-medium tabular-nums text-gray-900 shrink-0">{totalDevs(s)}</span>
              <span className="text-xs text-gray-400 shrink-0">devs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
