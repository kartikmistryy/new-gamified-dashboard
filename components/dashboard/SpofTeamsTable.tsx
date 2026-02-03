"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../shared/Badge";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import type { SpofTeamRow } from "@/lib/orgDashboard/spofMockData";

type SpofTableFilter = "highestRisk" | "lowestRisk" | "mostMembers" | "leastMembers";

const SPOF_FILTER_TABS: { key: SpofTableFilter; label: string }[] = [
  { key: "highestRisk", label: "Highest Risk" },
  { key: "lowestRisk", label: "Lowest Risk" },
  { key: "mostMembers", label: "Most Members" },
  { key: "leastMembers", label: "Least Members" },
];

function sortSpofTeams(rows: SpofTeamRow[], filter: SpofTableFilter): SpofTeamRow[] {
  const copy = [...rows];
  switch (filter) {
    case "highestRisk":
      return copy.sort((a, b) => b.avgSpofScore - a.avgSpofScore);
    case "lowestRisk":
      return copy.sort((a, b) => a.avgSpofScore - b.avgSpofScore);
    case "mostMembers":
      return copy.sort((a, b) => b.memberCount - a.memberCount);
    case "leastMembers":
      return copy.sort((a, b) => a.memberCount - b.memberCount);
    default:
      return copy;
  }
}

type SpofTeamsTableProps = {
  rows: SpofTeamRow[];
  visibleTeams: Record<string, boolean>;
  onVisibilityChange: (teamName: string, visible: boolean) => void;
};

export function SpofTeamsTable({
  rows,
  visibleTeams,
  onVisibilityChange,
}: SpofTeamsTableProps) {
  const [currentFilter, setCurrentFilter] = React.useState<SpofTableFilter>("highestRisk");

  const sortedRows = React.useMemo(
    () => sortSpofTeams(rows, currentFilter),
    [rows, currentFilter]
  );

  const handleToggle = React.useCallback(
    (teamName: string) => {
      const currentlyVisible = visibleTeams[teamName] !== false;
      onVisibilityChange(teamName, !currentlyVisible);
    },
    [visibleTeams, onVisibilityChange]
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {SPOF_FILTER_TABS.map((tab) => (
          <Badge
            key={tab.key}
            onClick={() => setCurrentFilter(tab.key)}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
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
              <TableHead className="w-14 text-foreground font-medium" />
              <TableHead className="w-14 text-foreground font-medium">Rank</TableHead>
              <TableHead className="text-foreground font-medium">Team</TableHead>
              <TableHead className="text-foreground font-medium text-left">Members</TableHead>
              <TableHead className="text-foreground font-medium text-left">Avg SPOF Score</TableHead>
              <TableHead className="text-foreground font-medium text-left">High Risk</TableHead>
              <TableHead className="text-foreground font-medium text-left">Low Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => {
              const isVisible = visibleTeams[row.teamName] !== false;
              const displayRank = index + 1;

              return (
                <TableRow
                  key={row.teamName}
                  className="border-[#E5E5E5] hover:bg-gray-50/80"
                >
                  <TableCell className="w-14">
                    <button
                      type="button"
                      onClick={() => handleToggle(row.teamName)}
                      className="inline-flex items-center justify-center size-8 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      aria-label={isVisible ? "Hide team from chart" : "Show team in chart"}
                    >
                      {isVisible ? (
                        <Eye className="size-5 shrink-0" aria-hidden />
                      ) : (
                        <EyeOff className="size-5 shrink-0" aria-hidden />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="w-14">
                    <span
                      className={
                        displayRank <= 3
                          ? "text-foreground font-bold"
                          : DASHBOARD_TEXT_CLASSES.rankMuted
                      }
                    >
                      {displayRank}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="size-4 rounded shrink-0"
                        style={{ backgroundColor: row.teamColor }}
                        aria-hidden
                      />
                      <p className="font-medium text-gray-900">{row.teamName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-gray-900">{row.memberCount}</span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-gray-900">{row.avgSpofScore.toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-red-600 font-medium">{row.highRiskCount}</span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-green-600 font-medium">{row.lowRiskCount}</span>
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
