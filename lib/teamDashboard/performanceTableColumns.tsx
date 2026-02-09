import type { BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { DASHBOARD_COLORS, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { getTrendIcon, formatChangeLabel, getChangeColor } from "@/lib/dashboard/trendHelpers";
import type { PerformanceFilter } from "./performanceTypes";
import type { MemberPerformanceWithDelta } from "./performanceTableConfig";

export const PERFORMANCE_MEMBER_COLUMNS: BaseTeamsTableColumn<MemberPerformanceWithDelta, PerformanceFilter>[] = [
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
    key: "performance",
    header: "Effective Performance",
    enableSorting: true,
    accessorFn: (row) => row.performanceValue,
    render: (row) => {
      const TrendIcon = getTrendIcon(row.trend);
      return (
        <div className="flex items-center gap-2">
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
    key: "change",
    header: "Change",
    enableSorting: true,
    accessorFn: (row) => Math.round(row.change ?? 0),
    render: (row) => {
      const TrendIcon = getTrendIcon(row.trend);
      const change = Math.round(row.change ?? 0);
      const changeLabel = formatChangeLabel(change);
      const changeColor = getChangeColor(change);
      return (
        <div className="flex items-center">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
            style={{ backgroundColor: hexToRgba(changeColor, 0.25), color: changeColor }}
          >
            <TrendIcon className="size-4 shrink-0" aria-hidden />
            {changeLabel}
          </span>
        </div>
      );
    },
  },
  {
    key: "cumulativeDiffDelta",
    header: "Cumulative DiffDelta",
    enableSorting: true,
    accessorFn: (row) => Math.round(Math.abs(row.cumulativeDiffDelta ?? 0)),
    render: (row) => {
      const cumulativeDelta = Math.round(Math.abs(row.cumulativeDiffDelta ?? 0));
      return <span className="text-gray-700">{cumulativeDelta}</span>;
    },
  },
  {
    key: "churnRate",
    header: "Churn Rate",
    enableSorting: true,
    accessorFn: (row) => row.churnRate ?? 0,
    render: (row) => {
      const churnRate = row.churnRate ?? 0;
      return <span className="text-gray-700">{churnRate}%</span>;
    },
  },
];
