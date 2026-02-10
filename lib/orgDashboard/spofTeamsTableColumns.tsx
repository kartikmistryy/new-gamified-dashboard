/** SPOF Teams Table Column Definitions */

import type { ColumnDef } from "@tanstack/react-table";
import type { SpofTeamRow } from "./spofMockData";
import { DASHBOARD_TEXT_CLASSES } from "./colors";
import { VisibilityToggleButton } from "@/components/dashboard/shared/VisibilityToggleButton";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { JoinedDistributionBar } from "@/components/dashboard/teamDashboard/SpofTeamsTableComponents";
import { SPOF_OWNER_SEGMENTS } from "./spofTeamsTableUtils";
import { REPO_HEALTH_SEGMENTS } from "@/components/dashboard/shared/RepoHealthBar";

export function createSpofTeamsColumns(
  visibleTeams: Record<string, boolean>,
  handleToggle: (teamName: string) => void
): ColumnDef<SpofTeamRow, any>[] {
  return [
    {
      id: "visibility",
      header: "",
      cell: ({ row }) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.original.teamName] !== false}
          onToggle={() => handleToggle(row.original.teamName)}
          label={
            visibleTeams[row.original.teamName] !== false ? "Hide team from chart" : "Show team in chart"
          }
        />
      ),
      enableSorting: false,
      meta: { className: "w-14" },
    },
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const displayRank = row.index + 1;
        return (
          <span
            className={
              displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted
            }
          >
            {displayRank}
          </span>
        );
      },
      enableSorting: false,
      meta: { className: "w-14" },
    },
    {
      id: "team",
      header: "Team",
      accessorFn: (row) => row.teamName,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamName={row.original.teamName} className="size-4" />
          <p className="font-medium text-gray-900">{row.original.teamName}</p>
        </div>
      ),
    },
    {
      id: "spofOwnerDistribution",
      header: "SPOF Owner Distribution",
      accessorFn: (row) => row.avgSpofScore,
      cell: ({ row }) => {
        const mediumCount = Math.max(
          0,
          row.original.memberCount - row.original.highRiskCount - row.original.lowRiskCount
        );
        const ownerSegments = [
          { label: SPOF_OWNER_SEGMENTS[0].label, value: row.original.lowRiskCount, color: SPOF_OWNER_SEGMENTS[0].color },
          { label: SPOF_OWNER_SEGMENTS[1].label, value: mediumCount, color: SPOF_OWNER_SEGMENTS[1].color },
          { label: SPOF_OWNER_SEGMENTS[2].label, value: row.original.highRiskCount, color: SPOF_OWNER_SEGMENTS[2].color },
        ];
        return <JoinedDistributionBar segments={ownerSegments} valueLabel="Owners" />;
      },
      meta: { className: "min-w-[260px]" },
    },
    {
      id: "repoHealthDistribution",
      header: "Repository Health Distribution",
      accessorFn: (row) => row.repoHealthCriticalCount,
      cell: ({ row }) => {
        const repoHealthSegments = [
          {
            label: REPO_HEALTH_SEGMENTS[0].label,
            value: row.original.repoHealthHealthyCount,
            color: REPO_HEALTH_SEGMENTS[0].color,
          },
          {
            label: REPO_HEALTH_SEGMENTS[1].label,
            value: row.original.repoHealthNeedsAttentionCount,
            color: REPO_HEALTH_SEGMENTS[1].color,
          },
          {
            label: REPO_HEALTH_SEGMENTS[2].label,
            value: row.original.repoHealthCriticalCount,
            color: REPO_HEALTH_SEGMENTS[2].color,
          },
        ];
        return <JoinedDistributionBar segments={repoHealthSegments} valueLabel="Repos" />;
      },
      meta: { className: "min-w-[280px]" },
    },
  ];
}
