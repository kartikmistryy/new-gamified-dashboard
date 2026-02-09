"use client";

import { ArrowRight, TrendingUp, TrendingDown, Star, Bomb, Puzzle, FlaskConical, BrickWall, AlertTriangle } from "lucide-react";
import type { MemberPerformanceRow, MemberTableFilter } from "@/lib/teamDashboard/types";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { TeamAvatar } from "../shared/TeamAvatar";

const MEMBER_FILTER_TABS: { key: MemberTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostOptimal", label: "Most Optimal" },
  { key: "mostRisky", label: "Most Risky" },
];

const TYPE_DISTRIBUTION_SEGMENTS = [
  { key: "star" as const, label: "Star", icon: Star, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.excellent, 0.25), color: DASHBOARD_COLORS.excellent } },
  { key: "timeBomb" as const, label: "Time Bomb", icon: Bomb, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.danger, 0.25), color: DASHBOARD_COLORS.danger } },
  { key: "keyRole" as const, label: "Key Role", icon: Puzzle, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.warning, 0.25), color: DASHBOARD_COLORS.warning } },
  { key: "risky" as const, label: "Risky", icon: FlaskConical, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.warning, 0.25), color: DASHBOARD_COLORS.warning } },
  { key: "bottleneck" as const, label: "Bottleneck", icon: AlertTriangle, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.caution, 0.25), color: DASHBOARD_COLORS.caution } },
  { key: "legacy" as const, label: "Legacy", icon: BrickWall, style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.stable, 0.25), color: DASHBOARD_COLORS.stable } },
];

const TYPE_LOOKUP = new Map(TYPE_DISTRIBUTION_SEGMENTS.map((segment) => [segment.key, segment]));

function getPrimaryDeveloperType(row: MemberPerformanceRow) {
  const value = row.performanceValue;
  if (value >= 85) return TYPE_LOOKUP.get("star") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
  if (value >= 70) return TYPE_LOOKUP.get("keyRole") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
  if (value >= 55) return TYPE_LOOKUP.get("legacy") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
  if (value >= 40) return TYPE_LOOKUP.get("bottleneck") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
  if (value >= 25) return TYPE_LOOKUP.get("risky") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
  return TYPE_LOOKUP.get("timeBomb") ?? TYPE_DISTRIBUTION_SEGMENTS[0];
}

function memberSortFunction(rows: MemberPerformanceRow[], currentFilter: MemberTableFilter): MemberPerformanceRow[] {
  const copy = [...rows];
  if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  if (currentFilter === "mostProductive" || currentFilter === "mostOptimal") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  if (currentFilter === "mostRisky") {
    const riskyScore = (r: MemberPerformanceRow) => (r.typeDistribution.timeBomb ?? 0) + (r.typeDistribution.risky ?? 0);
    return copy.sort((a, b) => riskyScore(b) - riskyScore(a));
  }
  return copy;
}

const MEMBER_COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, MemberTableFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    enableSorting: false,
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span className={displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "member",
    header: "Member",
    className: "w-full min-w-[360px]",
    accessorFn: (row) => row.memberName,
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.memberName} className="size-4" />
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  {
    key: "performance",
    header: "Effective Performance",
    className: "w-px text-right whitespace-nowrap",
    accessorFn: (row) => row.performanceValue,
    render: (row) => {
      const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
      return (
        <div className="flex items-center justify-end gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: hexToRgba(row.performanceBarColor, 0.25),
              color: row.performanceBarColor,
            }}
          >
            {row.performanceLabel}
            <span className="flex flex-row items-center justify-between gap-1 pl-2 py-1 border-l border-black/20 w-12">
              {row.performanceValue}
              <TrendIcon className="size-4 text-current shrink-0" aria-hidden />
            </span>
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Developer Type",
    className: "w-px text-right whitespace-nowrap",
    accessorFn: (row) => getPrimaryDeveloperType(row).label,
    render: (row) => {
      const type = getPrimaryDeveloperType(row);
      const Icon = type.icon;
      return (
        <div className="flex items-center justify-end">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium"
            style={type.style}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {type.label}
          </span>
        </div>
      );
    },
  },
];

type MemberTableProps = {
  rows: MemberPerformanceRow[];
  activeFilter?: MemberTableFilter;
  onFilterChange?: (filter: MemberTableFilter) => void;
};

export function MemberTable({
  rows,
  activeFilter = "mostProductive",
  onFilterChange,
}: MemberTableProps) {
  return (
    <BaseTeamsTable<MemberPerformanceRow, MemberTableFilter>
      rows={rows}
      filterTabs={MEMBER_FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostProductive"
      sortFunction={memberSortFunction}
      columns={MEMBER_COLUMNS}
      getRowKey={(row) => row.memberName}
    />
  );
}
