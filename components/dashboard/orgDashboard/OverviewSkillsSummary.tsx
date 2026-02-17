"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import type { SkillsRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import { STATUS_COLORS, DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

type Props = { skillData: SkillsRoadmapProgressData[] | null };

const BUCKET_CONFIG = [
  { label: "0-25%", color: STATUS_COLORS.critical.hex, min: 0, max: 25 },
  { label: "25-50%", color: STATUS_COLORS.attention.hex, min: 25, max: 50 },
  { label: "50-75%", color: DASHBOARD_COLORS.blueTailwind, min: 50, max: 75 },
  { label: "75-100%", color: STATUS_COLORS.healthy.hex, min: 75, max: 101 },
] as const;

function bucketize(data: SkillsRoadmapProgressData[]) {
  return BUCKET_CONFIG.map((cfg) => ({
    name: cfg.label,
    color: cfg.color,
    count: data.filter((d) => d.progressPercent >= cfg.min && d.progressPercent < cfg.max).length,
  }));
}

export function OverviewSkillsSummary({ skillData }: Props) {
  const buckets = useMemo(() => (skillData ? bucketize(skillData) : []), [skillData]);

  const topByProgress = useMemo(() => {
    if (!skillData) return [];
    return [...skillData].sort((a, b) => b.progressPercent - a.progressPercent).slice(0, 3);
  }, [skillData]);

  if (!skillData) {
    return <div className="py-6 text-center text-sm text-gray-400">Loading skills data...</div>;
  }

  const total = skillData.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Donut + Top 3 */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="shrink-0 w-[100px] h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={buckets}
                dataKey="count"
                nameKey="name"
                innerRadius={30}
                outerRadius={45}
                strokeWidth={2}
                stroke="#fff"
              >
                {buckets.map((b) => (
                  <Cell key={b.name} fill={b.color} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    const vb = viewBox as { cx?: number; cy?: number } | undefined;
                    if (!vb?.cx || !vb?.cy) return null;
                    return (
                      <text x={vb.cx} y={vb.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan className="text-2xl font-bold fill-gray-900">{total}</tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 3 Roadmaps */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Top 3 by Progress
          </p>
          {topByProgress.map((s) => (
            <div key={s.roadmap.id} className="flex items-center gap-2">
              <span className="text-sm text-gray-700 truncate flex-1 min-w-0">{s.roadmap.name}</span>
              <div className="w-14 h-2 rounded-full bg-gray-100 overflow-hidden shrink-0">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${s.progressPercent}%` }} />
              </div>
              <span className="text-xs font-medium tabular-nums text-gray-500 w-8 text-right shrink-0">
                {s.progressPercent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {buckets.map((b) => (
          <div key={b.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full shrink-0" style={{ background: b.color }} />
            <span className="text-[10px] text-gray-500">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
