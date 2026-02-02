"use client";

import * as React from "react";
import { ArrowRight, TrendingUp, TrendingDown, Star, Bomb, Puzzle, FlaskConical, BrickWall, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamPerformanceRow, TeamTableFilter } from "@/lib/orgDashboard/types";
import { Badge } from "../shared/Badge";

const TEAM_FILTER_TABS: { key: TeamTableFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostOptimal", label: "Most Optimal" },
  { key: "mostRisky", label: "Most Risky" },
];

/** Type-distribution segments use same palette as performance bar (overviewMockData getPerformanceBarColor). */
const TYPE_DISTRIBUTION_SEGMENTS: {
  key: keyof TeamPerformanceRow["typeDistribution"];
  bg: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { key: "star", bg: "bg-[#55B685]", icon: Star },
  { key: "timeBomb", bg: "bg-[#CA3A31]", icon: Bomb },
  { key: "keyRole", bg: "bg-[#E87B35]", icon: Puzzle },
  { key: "risky", bg: "bg-[#E87B35]", icon: FlaskConical },
  { key: "bottleneck", bg: "bg-[#E9A23B]", icon: AlertTriangle },
  { key: "legacy", bg: "bg-[#E2B53E]", icon: BrickWall },
];

type TeamTableProps = {
  rows: TeamPerformanceRow[];
  activeFilter?: TeamTableFilter;
  onFilterChange?: (filter: TeamTableFilter) => void;
};

export function TeamTable({
  rows,
  activeFilter = "mostProductive",
  onFilterChange,
}: TeamTableProps) {
  const [filter, setFilter] = React.useState<TeamTableFilter>(activeFilter);
  const currentFilter = onFilterChange ? activeFilter : filter;
  const handleFilter = onFilterChange ?? setFilter;

  const sortedRows = React.useMemo(() => {
    const copy = [...rows];
    if (currentFilter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
    if (currentFilter === "mostProductive" || currentFilter === "mostOptimal") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
    if (currentFilter === "mostRisky") {
      const riskyScore = (r: TeamPerformanceRow) => (r.typeDistribution.timeBomb ?? 0) + (r.typeDistribution.risky ?? 0);
      return copy.sort((a, b) => riskyScore(b) - riskyScore(a));
    }
    return copy;
  }, [rows, currentFilter]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {TEAM_FILTER_TABS.map((tab) => (
          <Badge
            key={tab.key}
            onClick={() => handleFilter(tab.key)}
            className={`px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              currentFilter === tab.key
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Badge>
        ))}
      </div>
      <div className="rounded-sm border-none overflow-hidden bg-white">
        <Table>
          <TableHeader className="border-0">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-foreground font-medium w-14">Rank</TableHead>
              <TableHead className="text-foreground font-medium">Team</TableHead>
              <TableHead className="text-foreground font-medium text-right">Real Performance</TableHead>
              <TableHead className="text-foreground font-medium text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => {
              const displayRank = index + 1;
              const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
              return (
                <TableRow key={`${row.teamName}-${displayRank}`} className="border-[#E5E5E5] hover:bg-gray-50/80">
                  <TableCell
                    className={
                      displayRank <= 3
                        ? "text-foreground font-bold"
                        : "text-[#737373] font-medium"
                    }
                  >
                    {displayRank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-4 rounded shrink-0 ${row.teamColor}`}
                        aria-hidden
                      />
                      <p className="font-medium text-gray-900">{row.teamName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white ${row.performanceBarColor}`}
                      >
                        {row.performanceLabel}
                        <span className="flex flex-row gap-1 pl-2 border-l border-white/50">
                          {row.performanceValue}
                          <TrendIcon className="size-4 text-white shrink-0" aria-hidden />
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {TYPE_DISTRIBUTION_SEGMENTS.map((seg, segIndex) => {
                        const Icon = seg.icon;
                        const count = row.typeDistribution[seg.key] ?? 0;
                        const isFirst = segIndex === 0;
                        const isLast = segIndex === TYPE_DISTRIBUTION_SEGMENTS.length - 1;
                        const roundedClass = isFirst && isLast
                          ? "rounded-lg"
                          : isFirst
                            ? "rounded-l-lg"
                            : isLast
                              ? "rounded-r-lg"
                              : "";
                        const borderLeftClass = seg.key === "risky" ? "border-l border-black/20" : "";
                        return (
                          <span
                            key={seg.key}
                            className={`inline-flex w-full justify-center items-center gap-1.5 px-4 py-1 text-xs font-medium text-white ${seg.bg} ${roundedClass} ${borderLeftClass}`}
                          >
                            <Icon className="size-3.5 shrink-0" aria-hidden />
                            {count}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
