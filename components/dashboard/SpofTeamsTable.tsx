"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../shared/Badge";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
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

const SPOF_OWNER_SEGMENTS = [
  { key: "high", label: "High", color: DASHBOARD_COLORS.danger },
  { key: "medium", label: "Medium", color: DASHBOARD_COLORS.blue },
  { key: "low", label: "Low", color: DASHBOARD_COLORS.excellent },
];

function SpofOwnerDistributionBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="flex items-center justify-center text-xs font-semibold"
          style={{
            flex: "1 1 0",
            minWidth: 0,
            backgroundColor: hexToRgba(segment.color, 0.25),
            color: segment.color,
          }}
        >
          {segment.value}
        </div>
      ))}
    </div>
  );
}

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
              <TableHead className="text-foreground font-medium text-left">Domain</TableHead>
              <TableHead className="text-foreground font-medium text-left">Skill</TableHead>
              <TableHead className="text-foreground font-medium text-right min-w-[260px]">
                SPOF Owner Distribution
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => {
              const isVisible = visibleTeams[row.teamName] !== false;
              const displayRank = index + 1;
              const mediumCount = Math.max(0, row.memberCount - row.highRiskCount - row.lowRiskCount);
              const ownerSegments = [
                { label: SPOF_OWNER_SEGMENTS[0].label, value: row.highRiskCount, color: SPOF_OWNER_SEGMENTS[0].color },
                { label: SPOF_OWNER_SEGMENTS[1].label, value: mediumCount, color: SPOF_OWNER_SEGMENTS[1].color },
                { label: SPOF_OWNER_SEGMENTS[2].label, value: row.lowRiskCount, color: SPOF_OWNER_SEGMENTS[2].color },
              ];

              return (
                <TableRow
                  key={row.teamName}
                  className="border-[#E5E5E5] hover:bg-gray-50/80"
                >
                  <TableCell className="w-14">
                    <VisibilityToggleButton
                      isVisible={isVisible}
                      onToggle={() => handleToggle(row.teamName)}
                      label={isVisible ? "Hide team from chart" : "Show team in chart"}
                    />
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
                    <span className="text-gray-900">{row.domainCount}</span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-gray-900">{row.skillCount}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <SpofOwnerDistributionBar segments={ownerSegments} />
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
