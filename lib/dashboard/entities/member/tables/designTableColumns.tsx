import type { BaseTeamsTableColumn } from "@/components/dashboard/shared/BaseTeamsTable";
import { SegmentBar } from "@/components/dashboard/shared/SegmentBar";
import { Badge } from "@/components/shared/Badge";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import type { MemberDesignRow } from "../mocks/designMockData";
import type { DesignMemberFilter } from "../utils/designHelpers";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import { CATEGORY_COLORS } from "@/lib/dashboard/entities/team/charts/chaosMatrix/chaosMatrixData";
import { getTrendIconForCount } from "@/lib/dashboard/shared/utils/trendHelpers";

const OWNERSHIP_SEGMENTS = [
  { label: "High Ownership", style: { backgroundColor: hexToRgba("#22c55e", 0.25), color: "#22c55e" } },
  { label: "Balanced Ownership", style: { backgroundColor: hexToRgba("#4285f4", 0.25), color: "#4285f4" } },
  { label: "Low Ownership", style: { backgroundColor: hexToRgba("#ef4444", 0.25), color: "#ef4444" } },
];

const CHAOS_SEGMENTS = [
  {
    label: "Skilled AI User",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Skilled AI User"], 0.25),
      color: CATEGORY_COLORS["Skilled AI User"],
    },
  },
  {
    label: "Traditional Developer",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Traditional Developer"], 0.25),
      color: CATEGORY_COLORS["Traditional Developer"],
    },
  },
  {
    label: "Unskilled AI User",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Unskilled AI User"], 0.25),
      color: CATEGORY_COLORS["Unskilled AI User"],
    },
  },
  {
    label: "Low-Skill Developer",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Low-Skill Developer"], 0.25),
      color: CATEGORY_COLORS["Low-Skill Developer"],
    },
  },
];

export const DESIGN_MEMBER_COLUMNS: BaseTeamsTableColumn<MemberDesignRow, DesignMemberFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    enableSorting: false,
    render: (_, index) => {
      const displayRank = index + 1;
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
  },
  {
    key: "member",
    header: "Member",
    enableSorting: false,
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.memberName} className="size-4" />
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  {
    key: "ownershipHealth",
    header: "Ownership Health",
    enableSorting: true,
    accessorFn: (row) => row.ownershipAllocation[2], // Sort by high ownership count
    render: (row) => {
      // Reverse order: green, blue, red (as per org design pattern)
      const counts = [
        row.ownershipAllocation[2],
        row.ownershipAllocation[1],
        row.ownershipAllocation[0],
      ];
      return (
        <SegmentBar
          segments={OWNERSHIP_SEGMENTS.map((segment, index) => ({
            ...segment,
            Icon: getTrendIconForCount(counts, index),
          }))}
          counts={counts}
          alignment="start"
          showCounts
        />
      );
    },
  },
  {
    key: "engineeringChaos",
    header: "Engineering Chaos Index",
    enableSorting: true,
    accessorFn: (row) => row.outlierScore, // Sort by outlier score
    render: (row) => {
      // Reverse order for display
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
            Icon: getTrendIconForCount(counts, index),
          }))}
          counts={counts}
          alignment="start"
          showCounts
        />
      );
    },
  },
  {
    key: "kp",
    header: "KP",
    enableSorting: true,
    accessorFn: (row) => row.totalKarmaPoints,
    render: (row) => (
      <span className="text-gray-700">
        {(row.totalKarmaPoints / 1000).toFixed(1)}k
      </span>
    ),
  },
  {
    key: "ownership",
    header: "Ownership %",
    enableSorting: true,
    accessorFn: (row) => row.ownershipPct,
    render: (row) => (
      <span className="text-gray-700">
        {row.ownershipPct.toFixed(1)}%
      </span>
    ),
  },
];
