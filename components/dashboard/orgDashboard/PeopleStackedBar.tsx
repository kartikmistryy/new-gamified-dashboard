"use client";

import { getProficiencyLevel } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import type { ProficiencyLevel } from "@/lib/dashboard/entities/roadmap/types";

// =============================================================================
// Shared badge config — single source of truth for colors, labels, and styles
// =============================================================================

export const BADGE_BG_OPACITY = 0.15;
export const BADGE_CLASS = "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap";

export const LEVELS = [
  { key: "basic", short: "Bas", full: "Basic", color: "#F59E0B" },
  { key: "intermediate", short: "Int", full: "Intermediate", color: "#3B82F6" },
  { key: "advanced", short: "Adv", full: "Advanced", color: "#8B5CF6" },
] as const;

const LEVEL_MAP = Object.fromEntries(LEVELS.map((l) => [l.key, l])) as Record<
  (typeof LEVELS)[number]["key"],
  (typeof LEVELS)[number]
>;

/** Map phase name ("Basic"/"Intermediate"/"Advanced") to color hex */
export const PHASE_COLOR_MAP = Object.fromEntries(
  LEVELS.map((l) => [l.full, l.color])
) as Record<string, string>;

export function badgeStyle(color: string) {
  return { backgroundColor: hexToRgba(color, BADGE_BG_OPACITY), color };
}

// =============================================================================
// CountBadge — Clickable count badge for people (R7)
// =============================================================================

type CountBadgeProps = {
  count: number;
  level: ProficiencyLevel;
  onClick?: () => void;
};

export function CountBadge({ count, level, onClick }: CountBadgeProps) {
  const levelConfig = LEVEL_MAP[level];

  if (count === 0) {
    return <span className="text-gray-400 text-sm min-w-[40px] text-center">-</span>;
  }

  const baseClasses = `${BADGE_CLASS} min-w-[40px] tabular-nums`;
  const style = badgeStyle(levelConfig.color);

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} cursor-pointer hover:opacity-80 transition-opacity`}
        style={style}
      >
        {count}
      </button>
    );
  }

  return (
    <span className={baseClasses} style={style}>
      {count}
    </span>
  );
}

// =============================================================================
// PeopleCountBadges — Clickable count badges row (R7)
// =============================================================================

type PeopleCountBadgesProps = {
  counts: { basic: number; intermediate: number; advanced: number };
  onBadgeClick?: (level: ProficiencyLevel) => void;
};

export function PeopleCountBadges({ counts, onBadgeClick }: PeopleCountBadgesProps) {
  const total = counts.basic + counts.intermediate + counts.advanced;
  if (total === 0) return <span className="text-sm text-gray-400">—</span>;

  return (
    <div className="flex items-center gap-1">
      {LEVELS.map(({ key }) => (
        <CountBadge
          key={key}
          count={counts[key]}
          level={key}
          onClick={onBadgeClick ? () => onBadgeClick(key) : undefined}
        />
      ))}
    </div>
  );
}

// =============================================================================
// PeopleStackedBar — Labeled count badges (Bas · Int · Adv) [Legacy]
// =============================================================================

type PeopleStackedBarProps = {
  counts: { basic: number; intermediate: number; advanced: number };
};

export function PeopleStackedBar({ counts }: PeopleStackedBarProps) {
  const total = counts.basic + counts.intermediate + counts.advanced;
  if (total === 0) return <span className="text-sm text-gray-400">—</span>;

  return (
    <div className="flex items-center gap-1">
      {LEVELS.map(({ key, short, color }) => (
        <span
          key={key}
          className={`${BADGE_CLASS} min-w-[52px] tabular-nums`}
          style={badgeStyle(color)}
        >
          {short}&nbsp;{counts[key]}
        </span>
      ))}
    </div>
  );
}

// =============================================================================
// ProficiencyProgressBar — Three-stage progress (Basic → Intermediate → Advanced)
// =============================================================================

type ProficiencyProgressBarProps = {
  percent: number;
};

export function ProficiencyProgressBar({ percent }: ProficiencyProgressBarProps) {
  if (percent <= 0) return <span className="text-sm text-gray-400">—</span>;

  const clamped = Math.max(0, Math.min(100, percent));
  const level = getProficiencyLevel(clamped);
  const badge = level ? LEVEL_MAP[level] : null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-[100px] gap-0.5 shrink-0">
        {LEVELS.map(({ key, color }, i) => {
          const stageMax = i === 0 ? 33 : i === 1 ? 66 : 100;
          const stageMin = i === 0 ? 0 : i === 1 ? 33 : 66;
          const stageRange = stageMax - stageMin;
          const fillPct =
            clamped <= stageMin
              ? 0
              : clamped >= stageMax
                ? 100
                : ((clamped - stageMin) / stageRange) * 100;

          return (
            <div
              key={key}
              className="flex-1 rounded-sm overflow-hidden"
              style={{ backgroundColor: hexToRgba(color, 0.2) }}
            >
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${fillPct}%`, backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
      {badge ? (
        <span className={BADGE_CLASS} style={badgeStyle(badge.color)}>
          {badge.full}
        </span>
      ) : null}
    </div>
  );
}
