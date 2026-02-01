"use client";

import * as React from "react";
import { ArrowRight, TrendingUp, TrendingDown, Star, Bomb, Puzzle, FlaskConical, BrickWall } from "lucide-react";
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

/** Five type-distribution segments: green star, red circle, orange gear, orange triangle, yellow building. */
const TYPE_DISTRIBUTION_SEGMENTS: {
  key: keyof TeamPerformanceRow["typeDistribution"];
  bg: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { key: "star", bg: "bg-green-500", icon: Star },
  { key: "timeBomb", bg: "bg-red-500", icon: Bomb },
  { key: "keyRole", bg: "bg-orange-500", icon: Puzzle },
  { key: "bottleneck", bg: "bg-orange-400", icon: FlaskConical },
  { key: "legacy", bg: "bg-amber-500", icon: BrickWall },
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
            className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
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
              <TableHead className="text-gray-500 font-medium w-14">Rank</TableHead>
              <TableHead className="text-gray-500 font-medium">Team</TableHead>
              <TableHead className="text-gray-500 font-medium">Real Performance</TableHead>
              <TableHead className="text-gray-500 font-medium">Type Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => {
              const displayRank = index + 1;
              const TrendIcon = row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
              return (
                <TableRow key={`${row.teamName}-${displayRank}`} className="border-gray-100 hover:bg-gray-50/80">
                  <TableCell className="font-semibold text-gray-900">{displayRank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-4 rounded shrink-0 ${row.teamColor}`}
                        aria-hidden
                      />
                      <p className="font-medium text-gray-900">{row.teamName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                  <TableCell>
                    <div className="flex items-center">
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
                        return (
                          <span
                            key={seg.key}
                            className={`inline-flex items-center gap-1.5 px-4 py-1 text-xs font-medium text-white ${seg.bg} ${roundedClass}`}
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
