import type { BaseTeamsTableColumn } from "@/components/dashboard/shared/BaseTeamsTable";
import { SegmentBar } from "@/components/dashboard/shared/SegmentBar";
import { Badge } from "@/components/shared/Badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ContributorOutliersRow } from "../mocks/outliersMockData";
import type { OutliersContributorFilter } from "../utils/outliersHelpers";
import { DASHBOARD_TEXT_CLASSES, DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
import { hexToRgba } from "@/lib/dashboard/entities/team/utils/tableUtils";
import { CATEGORY_COLORS } from "@/lib/dashboard/entities/team/charts/chaosMatrix/chaosMatrixData";
import { getTrendIconForCount } from "@/lib/dashboard/shared/utils/trendHelpers";

const OWNERSHIP_SEGMENTS = [
  { label: "High Ownership", style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.greenLight, 0.25), color: DASHBOARD_COLORS.greenLight } },
  { label: "Balanced Ownership", style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.blueTailwind, 0.25), color: DASHBOARD_COLORS.blueTailwind } },
  { label: "Low Ownership", style: { backgroundColor: hexToRgba(DASHBOARD_COLORS.red, 0.25), color: DASHBOARD_COLORS.red } },
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

export const OUTLIERS_CONTRIBUTOR_COLUMNS: BaseTeamsTableColumn<ContributorOutliersRow, OutliersContributorFilter>[] = [
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
    key: "contributor",
    header: "Contributor",
    enableSorting: false,
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserAvatar userName={row.contributorName} className="size-4" size={16} />
        <p className="font-medium text-gray-900">{row.contributorName}</p>
      </div>
    ),
  },
  {
    key: "ownershipHealth",
    header: "Ownership Health",
    enableSorting: true,
    accessorFn: (row) => row.ownershipAllocation[2], // Sort by high ownership count
    render: (row) => {
      // Reverse order: green, blue, red (as per org outliers pattern)
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
