"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { MemberPerformanceChart } from "@/components/dashboard/MemberPerformanceChart";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { generateMemberPerformanceTimeSeries } from "@/lib/teamDashboard/performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  isTimeRangeSufficient,
  getVisibleMembersForFilter,
  getPerformanceInsights,
} from "@/lib/teamDashboard/performanceHelpers";
import { TimeRangeKey, TIME_RANGE_OPTIONS } from "@/lib/orgDashboard/timeRangeTypes";
import { ViewMode, PerformanceFilter } from "@/lib/teamDashboard/performanceTypes";
import type { MemberPerformanceRow } from "@/lib/teamDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

// Performance filter tabs (different from MemberTable overview filter tabs)
const PERFORMANCE_FILTER_TABS: { key: PerformanceFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  { key: "mostImproved", label: "Most Improved" },
  { key: "mostRegressed", label: "Most Regressed" },
  { key: "highestChurn", label: "Highest Churn" },
  { key: "lowestChurn", label: "Lowest Churn" },
];

// Performance sort function
function performanceSortFunction(
  rows: MemberPerformanceRow[],
  currentFilter: PerformanceFilter
): MemberPerformanceRow[] {
  const copy = [...rows];
  switch (currentFilter) {
    case "mostProductive":
      return copy.sort((a, b) => b.performanceValue - a.performanceValue);
    case "leastProductive":
      return copy.sort((a, b) => a.performanceValue - b.performanceValue);
    case "mostImproved":
      return copy.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
    case "mostRegressed":
      return copy.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
    case "highestChurn":
      return copy.sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0));
    case "lowestChurn":
      return copy.sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0));
    default:
      return copy;
  }
}

// Performance table columns
const PERFORMANCE_COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, PerformanceFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
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
    className: "text-right",
    render: (row) => {
      const TrendIcon =
        row.trend === "up" ? TrendingUp : row.trend === "down" ? TrendingDown : ArrowRight;
      return (
        <div className="flex items-center justify-end gap-2">
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
    className: "text-right",
    render: (row) => {
      const change = row.change ?? 0;
      const color = change > 0 ? "#55B685" : change < 0 ? "#CA3A31" : "#737373";
      const prefix = change > 0 ? "+" : "";
      return (
        <span className="font-medium" style={{ color }}>
          {prefix}
          {change}
        </span>
      );
    },
  },
  {
    key: "churnRate",
    header: "Churn Rate",
    className: "text-right",
    render: (row) => {
      const churnRate = row.churnRate ?? 0;
      return <span className="text-gray-700">{churnRate}%</span>;
    },
  },
];

export default function TeamPerformancePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("aggregate");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("1m");
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  // Data pipeline
  const members = useMemo(
    () => {
      const rows = getMemberPerformanceRowsForTeam(52, teamId, 6);
      // Add change and churnRate for performance tab (deterministic based on member data)
      return rows.map((row, index) => {
        // Use member name and index as seed for deterministic values
        const seed1 = row.memberName.charCodeAt(0) + index * 100;
        const seed2 = row.memberName.length + index * 50;
        const noise1 = Math.sin(seed1 * 9999) * 10000;
        const noise2 = Math.sin(seed2 * 9999) * 10000;
        const changeSeed = noise1 - Math.floor(noise1);
        const churnSeed = noise2 - Math.floor(noise2);

        return {
          ...row,
          change: (changeSeed - 0.5) * 30, // -15 to +15 points
          churnRate: Math.round(churnSeed * 40), // 0-40%
        };
      });
    },
    [teamId]
  );

  const rawData = useMemo(() => generateMemberPerformanceTimeSeries(members), [members]);

  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  const sampledData = useMemo(() => smartSample(timeFilteredData), [timeFilteredData]);

  const visibleMembers = useMemo(
    () => getVisibleMembersForFilter(members, activeFilter, viewMode),
    [members, activeFilter, viewMode]
  );

  const timeRangeOptions = useMemo(
    () =>
      TIME_RANGE_OPTIONS.map((opt) => ({
        ...opt,
        disabled: !isTimeRangeSufficient(rawData, opt.id),
      })),
    [rawData]
  );

  const insights = useMemo(
    () => getPerformanceInsights(members, sampledData, timeRange),
    [members, sampledData, timeRange]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <h2 className="text-2xl font-semibold text-foreground">Performance</h2>

            {/* Controls row: view toggle left, time range right */}
            <div className="flex items-center justify-between">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as ViewMode);
                }}
              >
                <ToggleGroupItem value="aggregate" aria-label="Team Aggregate view">
                  Team Aggregate
                </ToggleGroupItem>
                <ToggleGroupItem value="individual" aria-label="Individual Members view">
                  Individual Members
                </ToggleGroupItem>
              </ToggleGroup>
              <TimeRangeFilter
                options={timeRangeOptions}
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>

            {/* Chart + insights row */}
            <div className="flex flex-row gap-5">
              <div className="flex-1">
                <MemberPerformanceChart
                  data={sampledData}
                  members={members}
                  viewMode={viewMode}
                  visibleMembers={visibleMembers}
                  timeRange={timeRange}
                />
              </div>
              <ChartInsights insights={insights} />
            </div>

            {/* Member table section */}
            <section className="w-full" aria-labelledby="members-heading">
              <h2 id="members-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Team Members
              </h2>
              <BaseTeamsTable<MemberPerformanceRow, PerformanceFilter>
                rows={members}
                filterTabs={PERFORMANCE_FILTER_TABS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                defaultFilter="mostProductive"
                sortFunction={performanceSortFunction}
                columns={PERFORMANCE_COLUMNS}
                getRowKey={(row) => row.memberName}
              />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
