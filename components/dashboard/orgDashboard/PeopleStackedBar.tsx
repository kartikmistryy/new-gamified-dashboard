"use client";

import { getProficiencyLevel } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";

// =============================================================================
// PeopleStackedBar — Stacked bar showing Basic/Proficient/Advanced + counts
// =============================================================================

type PeopleStackedBarProps = {
  counts: { basic: number; intermediate: number; advanced: number };
};

const COUNT_PILLS = [
  { key: "basic", label: "Bas", style: "bg-amber-50 text-amber-700" },
  { key: "intermediate", label: "Int", style: "bg-blue-50 text-blue-700" },
  { key: "advanced", label: "Adv", style: "bg-purple-50 text-purple-700" },
] as const;

export function PeopleStackedBar({ counts }: PeopleStackedBarProps) {
  const total = counts.basic + counts.intermediate + counts.advanced;
  if (total === 0) return <span className="text-sm text-gray-400">—</span>;

  return (
    <div className="flex items-center gap-1">
      {COUNT_PILLS.map(({ key, label, style }) => (
        <span
          key={key}
          className={`inline-flex justify-center min-w-[52px] px-1.5 py-0.5 rounded text-[11px] font-medium tabular-nums ${style}`}
        >
          {label}&nbsp;{counts[key]}
        </span>
      ))}
    </div>
  );
}

// =============================================================================
// ProficiencyProgressBar — Three-stage progress (Basic → Intermediate → Advanced)
// =============================================================================

const STAGES = [
  { max: 33, fill: "#F59E0B", bg: "bg-amber-100" },
  { max: 66, fill: "#3B82F6", bg: "bg-blue-100" },
  { max: 100, fill: "#8B5CF6", bg: "bg-purple-100" },
] as const;

const LEVEL_BADGE = {
  basic: { label: "Basic", color: "#F59E0B" },
  intermediate: { label: "Intermediate", color: "#3B82F6" },
  advanced: { label: "Advanced", color: "#8B5CF6" },
} as const;

type ProficiencyProgressBarProps = {
  percent: number;
};

export function ProficiencyProgressBar({ percent }: ProficiencyProgressBarProps) {
  if (percent <= 0) return <span className="text-sm text-gray-400">—</span>;

  const clamped = Math.max(0, Math.min(100, percent));
  const level = getProficiencyLevel(clamped);
  const badge = level ? LEVEL_BADGE[level] : null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-[100px] gap-0.5 shrink-0">
        {STAGES.map((stage, i) => {
          const stageMin = i === 0 ? 0 : STAGES[i - 1].max;
          const stageRange = stage.max - stageMin;
          const fillPct =
            clamped <= stageMin
              ? 0
              : clamped >= stage.max
                ? 100
                : ((clamped - stageMin) / stageRange) * 100;

          return (
            <div key={i} className={`flex-1 rounded-sm ${stage.bg} overflow-hidden`}>
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${fillPct}%`, backgroundColor: stage.fill }}
              />
            </div>
          );
        })}
      </div>
      {badge ? (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap"
          style={{ backgroundColor: hexToRgba(badge.color, 0.15), color: badge.color }}
        >
          {badge.label}
        </span>
      ) : null}
    </div>
  );
}
