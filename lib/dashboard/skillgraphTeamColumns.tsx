"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { SkillgraphTeamRow } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { DomainDistributionBar } from "@/components/dashboard/DomainDistributionBar";
import { VisibilityToggleButton } from "@/components/dashboard/VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";
import { Button } from "@/components/ui/button";
import { TeamAvatar } from "@/components/shared/TeamAvatar";

const USAGE_FORMATTER = new Intl.NumberFormat("en-US");

function getTeamSkillUsageValue(row: SkillgraphTeamRow) {
  if (row.domainDistribution?.length) {
    return row.domainDistribution.reduce((sum, item) => sum + item.value, 0);
  }
  return row.skillCount;
}

type CreateSkillgraphTeamColumnsOptions = {
  toggleVisibility: (teamName: string) => void;
  visibleTeams: Record<string, boolean>;
  totalUsageSum: number;
};

export function createSkillgraphTeamColumns({
  toggleVisibility,
  visibleTeams,
  totalUsageSum,
}: CreateSkillgraphTeamColumnsOptions): ColumnDef<SkillgraphTeamRow>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          className="size-7 text-muted-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={
            row.getIsExpanded()
              ? `Collapse details for ${row.original.teamName}`
              : `Expand details for ${row.original.teamName}`
          }
          size="icon"
          variant="ghost"
        >
          {row.getIsExpanded() ? (
            <ChevronUpIcon className="opacity-60" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="opacity-60" aria-hidden="true" />
          )}
        </Button>
      ),
    },
    {
      id: "view",
      header: "",
      cell: ({ row }) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.original.teamName] !== false}
          onToggle={() => toggleVisibility(row.original.teamName)}
        />
      ),
    },
    {
      id: "rank",
      header: "Rank",
      accessorFn: (_row, index) => index + 1,
      enableSorting: true,
      cell: ({ row }) => {
        const rank = row.index + 1;
        return (
          <span className={rank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
            {rank}
          </span>
        );
      },
    },
    {
      header: "Team",
      accessorKey: "teamName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamName={row.original.teamName} className="size-4" />
          <p className="font-medium text-gray-900">{row.original.teamName}</p>
        </div>
      ),
    },
    {
      header: "Total Skill Usage",
      id: "totalSkillUsage",
      accessorFn: (row) => getTeamSkillUsageValue(row),
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="text-gray-900 block text-right">
          {USAGE_FORMATTER.format(getTeamSkillUsageValue(row.original))}
        </span>
      ),
    },
    {
      id: "percentOfChart",
      header: "% of chart",
      accessorFn: (row) => {
        if (!totalUsageSum) return 0;
        return (getTeamSkillUsageValue(row) / totalUsageSum) * 100;
      },
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const usageShare = totalUsageSum
          ? (getTeamSkillUsageValue(row.original) / totalUsageSum) * 100
          : 0;
        const percentText = `${Math.round(usageShare)}%`;
        return <span className="text-gray-900 block text-right">{percentText}</span>;
      },
    },
    {
      id: "distribution",
      header: "Domain Distribution",
      meta: { className: "text-right min-w-[260px]" },
      cell: ({ row }) =>
        row.original.domainDistribution ? (
          <DomainDistributionBar segments={row.original.domainDistribution} getColor={getColorForDomain} />
        ) : null,
    },
  ];
}
