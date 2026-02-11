/** Design Teams Table Column Definitions */

import type { DesignTeamRow, DesignTableFilter } from "../types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import type { BaseTeamsTableColumn } from "@/components/dashboard/shared/BaseTeamsTable";
import { SegmentBar } from "@/components/dashboard/shared/SegmentBar";
import { VisibilityToggleButton } from "@/components/dashboard/shared/VisibilityToggleButton";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { OWNERSHIP_SEGMENTS, CHAOS_SEGMENTS, getTrendIconForCount } from "./designTeamsTableConfig";

/** Create design table columns */
export function createDesignColumns(
  effectiveVisible: Record<string, boolean>,
  toggleView: (teamName: string) => void
): BaseTeamsTableColumn<DesignTeamRow, DesignTableFilter>[] {
  return [
    {
      key: "view",
      header: "View",
      className: "w-14",
      enableSorting: false,
      render: (row) => (
        <VisibilityToggleButton
          isVisible={effectiveVisible[row.teamName] !== false}
          onToggle={() => toggleView(row.teamName)}
        />
      ),
    },
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
      key: "team",
      header: "Team",
      accessorFn: (row) => row.teamName,
      render: (row) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamName={row.teamName} className="size-4" />
          <p className="font-medium text-gray-900">{row.teamName}</p>
        </div>
      ),
    },
    {
      key: "ownership",
      header: "Ownership Health",
      accessorFn: (row) => row.ownershipAllocation[2],
      render: (row) => {
        const counts = [row.ownershipAllocation[2], row.ownershipAllocation[1], row.ownershipAllocation[0]];
        return (
          <SegmentBar
            segments={OWNERSHIP_SEGMENTS.map((segment, index) => ({
              ...segment,
              icon: getTrendIconForCount(counts, index),
            }))}
            counts={counts}
            alignment="start"
            showCounts
          />
        );
      },
    },
    {
      key: "chaos",
      header: "Engineering Chaos Index",
      accessorFn: (row) => row.outlierScore,
      render: (row) => {
        const counts = [
          row.engineeringChaos[3],
          row.engineeringChaos[2],
          row.engineeringChaos[1],
          row.engineeringChaos[0],
        ];
        return (
          <SegmentBar
            segments={CHAOS_SEGMENTS.map((segment, index) => ({
              ...segment,
              icon: getTrendIconForCount(counts, index),
            }))}
            counts={counts}
            alignment="start"
            showCounts
          />
        );
      },
    },
  ];
}
