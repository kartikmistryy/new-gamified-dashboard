"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { OwnershipScatter } from "@/components/dashboard/OwnershipScatter";
import { ChaosMatrix } from "@/components/dashboard/ChaosMatrix";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { SegmentBar } from "@/components/dashboard/SegmentBar";
import { Badge } from "@/components/shared/Badge";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getMemberDesignData,
  transformToOwnershipScatterData,
  transformToChaosMatrixData,
  type MemberDesignRow,
} from "@/lib/teamDashboard/designMockData";
import {
  DESIGN_MEMBER_FILTER_TABS,
  designMemberSortFunction,
  getDesignInsights,
  type DesignMemberFilter,
} from "@/lib/teamDashboard/designHelpers";
import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { CATEGORY_COLORS } from "@/lib/orgDashboard/chaosMatrixData";

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

function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

// Design member table columns
const DESIGN_MEMBER_COLUMNS: BaseTeamsTableColumn<MemberDesignRow, DesignMemberFilter>[] = [
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
    key: "ownershipHealth",
    header: "Ownership Health",
    className: "text-right",
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
            icon: getTrendIconForCount(counts, index),
          }))}
          counts={counts}
          alignment="end"
          showCounts
        />
      );
    },
  },
  {
    key: "engineeringChaos",
    header: "Engineering Chaos Index",
    className: "text-right",
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
            icon: getTrendIconForCount(counts, index),
          }))}
          counts={counts}
          alignment="end"
          showCounts
        />
      );
    },
  },
  {
    key: "kp",
    header: "KP",
    className: "text-right",
    render: (row) => (
      <span className="text-gray-700">
        {(row.totalKarmaPoints / 1000).toFixed(1)}k
      </span>
    ),
  },
  {
    key: "ownership",
    header: "Ownership %",
    className: "text-right",
    render: (row) => (
      <span className="text-gray-700">
        {row.ownershipPct.toFixed(1)}%
      </span>
    ),
  },
];

export default function TeamDesignPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // State
  const [ownershipRange, setOwnershipRange] = useState<TimeRangeKey>("3m");
  const [chaosRange, setChaosRange] = useState<TimeRangeKey>("max");
  const [designFilter, setDesignFilter] = useState<DesignMemberFilter>("highestOwnership");
  const [visibleMembers, setVisibleMembers] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    // Initialize with all members visible
    return init;
  });

  // Data pipeline
  const members = useMemo(() => getMemberDesignData(teamId, 6), [teamId]);

  const ownershipScatterData = useMemo(
    () => transformToOwnershipScatterData(members),
    [members]
  );

  const chaosMatrixData = useMemo(
    () => transformToChaosMatrixData(members),
    [members]
  );

  const insights = useMemo(() => getDesignInsights(members), [members]);

  const memberNames = useMemo(() => members.map((m) => m.memberName), [members]);

  // Initialize visible members after first render
  useMemo(() => {
    const init: Record<string, boolean> = {};
    members.forEach((member) => {
      init[member.memberName] = true; // All members visible by default
    });
    setVisibleMembers(init);
  }, [members]);

  const handleToggleMemberVisibility = useCallback((memberName: string) => {
    setVisibleMembers((prev) => ({ ...prev, [memberName]: !prev[memberName] }));
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <DashboardSection
          title="Ownership Misallocation Detector"
          action={
            <TimeRangeFilter
              options={TIME_RANGE_OPTIONS}
              value={ownershipRange}
              onChange={setOwnershipRange}
            />
          }
        >
          <div className="flex flex-row gap-5">
            <div className="w-[65%] shrink-0">
              <OwnershipScatter data={ownershipScatterData} range={ownershipRange} />
            </div>
            <div className="w-[35%] min-w-0 shrink">
              <ChartInsights insights={insights} />
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Engineering Chaos Matrix"
          className="w-full"
          action={
            <TimeRangeFilter
              options={TIME_RANGE_OPTIONS}
              value={chaosRange}
              onChange={setChaosRange}
            />
          }
        >
          <ChaosMatrix
            data={chaosMatrixData}
            range={chaosRange}
            visibleTeams={visibleMembers}
            teamNames={memberNames}
          />
        </DashboardSection>

        <DashboardSection
          title="Team Members"
          className="w-full"
          action={
            <div className="flex flex-row flex-wrap gap-2">
              {DESIGN_MEMBER_FILTER_TABS.map((tab) => (
                <Badge
                  key={tab.key}
                  onClick={() => setDesignFilter(tab.key)}
                  className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                    designFilter === tab.key
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </Badge>
              ))}
            </div>
          }
        >
          <BaseTeamsTable<MemberDesignRow, DesignMemberFilter>
            rows={members}
            filterTabs={DESIGN_MEMBER_FILTER_TABS}
            activeFilter={designFilter}
            onFilterChange={setDesignFilter}
            defaultFilter="highestOwnership"
            sortFunction={designMemberSortFunction}
            columns={DESIGN_MEMBER_COLUMNS}
            getRowKey={(row) => row.memberName}
            showFilters={false}
          />
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
