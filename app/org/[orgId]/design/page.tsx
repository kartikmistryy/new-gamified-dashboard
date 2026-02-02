"use client";

import { useMemo, useState } from "react";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { ChaosMatrix } from "@/components/dashboard/ChaosMatrix";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DesignTeamsTable } from "@/components/dashboard/DesignTeamsTable";
import { OwnershipScatter } from "@/components/dashboard/OwnershipScatter";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { getChartInsightsMock } from "@/lib/orgDashboard/overviewMockData";
import { DESIGN_TEAM_ROWS } from "@/lib/orgDashboard/designMockData";
import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";

export default function OrgDesignPage() {
  const chartInsights = useMemo(() => getChartInsightsMock(), []);
  const [ownershipRange, setOwnershipRange] = useState<TimeRangeKey>("3m");
  const [chaosRange, setChaosRange] = useState<TimeRangeKey>("max");

  return (
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
            <OwnershipScatter range={ownershipRange} />
          </div>
          <div className="w-[35%] min-w-0 shrink">
            <ChartInsights insights={chartInsights} />
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
        <ChaosMatrix range={chaosRange} />
      </DashboardSection>

      <DashboardSection title="Teams" className="w-full">
        <DesignTeamsTable rows={DESIGN_TEAM_ROWS} />
      </DashboardSection>
    </div>
  );
}
