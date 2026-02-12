"use client";

import type { ProficiencyLevel } from "@/lib/dashboard/entities/roadmap/types";
import { getProficiencyColor } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";

// =============================================================================
// PeopleStackedBar — Stacked bar showing Basic/Proficient/Advanced + counts
// =============================================================================

type PeopleStackedBarProps = {
  counts: { basic: number; intermediate: number; advanced: number };
};

export function PeopleStackedBar({ counts }: PeopleStackedBarProps) {
  const total = counts.basic + counts.intermediate + counts.advanced;
  if (total === 0) return <span className="text-sm text-gray-400">—</span>;

  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-2 w-[100px] rounded-full overflow-hidden bg-gray-100">
        <div style={{ width: pct(counts.basic) }} className="bg-amber-400 transition-all" />
        <div style={{ width: pct(counts.intermediate) }} className="bg-blue-500 transition-all" />
        <div style={{ width: pct(counts.advanced) }} className="bg-purple-500 transition-all" />
      </div>
      <span className="text-sm text-gray-700 tabular-nums whitespace-nowrap">
        {counts.basic} · {counts.intermediate} · {counts.advanced}
      </span>
    </div>
  );
}

// =============================================================================
// StatusBadge — Pill badge with tinted background (matches Org SPOF style)
// =============================================================================

const LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

type StatusBadgeProps = {
  level: ProficiencyLevel | null;
};

export function StatusBadge({ level }: StatusBadgeProps) {
  if (!level) return <span className="text-sm text-gray-400">—</span>;
  const color = getProficiencyColor(level);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
      style={{
        backgroundColor: hexToRgba(color, 0.25),
        color,
      }}
    >
      {LEVEL_LABELS[level]}
    </span>
  );
}
