"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { GaugeWithInsights } from "@/components/dashboard/GaugeWithInsights";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { BaseTeamsTable } from "@/components/dashboard/BaseTeamsTable";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ContributorMetricsChart } from "@/components/dashboard/ContributorMetricsChart";
import { generateTeamEvents, generateTeamAnnotations } from "@/lib/dashboard/performanceChart";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { generateMemberPerformanceTimeSeries } from "@/lib/teamDashboard/performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  isTimeRangeSufficient,
  getPerformanceInsights,
} from "@/lib/teamDashboard/performanceHelpers";
import { TIME_RANGE_OPTIONS } from "@/lib/orgDashboard/timeRangeTypes";
import { PerformanceFilter } from "@/lib/teamDashboard/performanceTypes";
import { getGaugeColor, getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import {
  PERFORMANCE_FILTER_TABS,
  performanceSortFunction,
  type MemberPerformanceWithDelta,
} from "@/lib/teamDashboard/performanceTableConfig";
import { PERFORMANCE_MEMBER_COLUMNS } from "@/lib/teamDashboard/performanceTableColumns";
import { useRouteParams } from "@/lib/RouteParamsProvider";

export function TeamPerformancePageClient() {
  const { teamId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // State
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  // Data pipeline
  const members = useMemo(
    () => {
      const rows = getMemberPerformanceRowsForTeam(52, teamId!, 6);
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

  const cumulativeDiffDeltaByMember = useMemo(() => {
    const totals = new Map<string, number>();
    if (timeFilteredData.length < 2) return totals;

    for (let i = 1; i < timeFilteredData.length; i++) {
      const prev = timeFilteredData[i - 1];
      const curr = timeFilteredData[i];
      for (const member of members) {
        const prevValue = prev.memberValues[member.memberName] ?? 0;
        const currValue = curr.memberValues[member.memberName] ?? 0;
        const delta = currValue - prevValue;
        totals.set(member.memberName, (totals.get(member.memberName) ?? 0) + delta);
      }
    }

    return totals;
  }, [timeFilteredData, members]);

  const tableRows = useMemo<MemberPerformanceWithDelta[]>(
    () => {
      const rawValues = members.map((member) =>
        Math.abs(cumulativeDiffDeltaByMember.get(member.memberName) ?? 0)
      );
      const min = Math.min(...rawValues, 0);
      const max = Math.max(...rawValues, 0);
      const minOutput = 20;
      const maxOutput = 50;
      const scaleValue = (value: number) => {
        if (max === min) return Math.round((minOutput + maxOutput) / 2);
        const ratio = (value - min) / (max - min);
        return Math.round(minOutput + ratio * (maxOutput - minOutput));
      };

      return members.map((member) => ({
        ...member,
        cumulativeDiffDelta: scaleValue(
          Math.abs(cumulativeDiffDeltaByMember.get(member.memberName) ?? 0)
        ),
      }));
    },
    [members, cumulativeDiffDeltaByMember]
  );

  const teamPerformanceValue = useMemo(() => {
    if (members.length === 0) return 0;
    const total = members.reduce((sum, member) => sum + member.performanceValue, 0);
    return Math.round(total / members.length);
  }, [members]);

  // Generate aggregate team cumulative data for comparison chart
  const aggregateTeamData = useMemo(() => {
    if (timeFilteredData.length === 0) return [];

    // Aggregate all members' contributions for each time point with realistic variations
    const aggregated = timeFilteredData.map((point, weekIndex) => {
      const memberNames = Object.keys(point.memberValues);
      const date = new Date(point.date);
      const month = date.getMonth();

      // Sprint cycle variations (2-week sprints)
      // Phase 0-1: High activity (sprint execution)
      // Phase 2: Medium activity (sprint end/review)
      // Phase 3: Low activity (sprint planning)
      const sprintPhase = weekIndex % 4;
      const sprintMultiplier =
        sprintPhase === 0 ? 1.4 :  // Sprint start - ramping up
        sprintPhase === 1 ? 1.8 :  // Sprint peak - highest activity
        sprintPhase === 2 ? 1.1 :  // Sprint end - winding down
        0.7;                        // Sprint planning - lowest activity

      // Seasonal variations (holidays and vacation periods)
      const isHolidaySeason = month === 11 || month === 0; // December, January
      const isSummerSlump = month === 6 || month === 7;     // July, August
      const seasonalMultiplier =
        isHolidaySeason ? 0.5 :
        isSummerSlump ? 0.7 :
        1.0;

      // Project milestones (occasional spikes every ~6-8 weeks)
      const isMilestoneWeek = weekIndex % 7 === 3 || weekIndex % 11 === 5;
      const milestoneMultiplier = isMilestoneWeek ? 2.2 : 1.0;

      // Code cleanup/refactoring periods (higher deletion ratio every ~8 weeks)
      const isRefactoringWeek = weekIndex % 8 === 6;
      const refactoringMultiplier = isRefactoringWeek ? 1.5 : 1.0;

      // Random week-to-week variation (good weeks vs slow weeks)
      const weekSeed = weekIndex * 0.7 + (teamId ? teamId.charCodeAt(0) : 42);
      const randomVariation = 0.75 + Math.sin(weekSeed) * 0.25; // 0.5 to 1.0

      // Calculate total additions and deletions across all members
      let totalAdd = 0;
      let totalDelete = 0;

      memberNames.forEach((memberName, memberIndex) => {
        const performanceValue = point.memberValues[memberName] ?? 50;

        // Base weekly contribution influenced by performance
        const baseContribution = performanceValue * 2 + 50;

        // Add per-member variation to create visual diversity in bars
        const memberSeed = memberName.charCodeAt(0) + weekIndex * 0.3;
        const memberVariation = 0.8 + Math.cos(memberSeed) * 0.4; // 0.4 to 1.2

        // Apply all multipliers
        const weeklyAdd = baseContribution *
          sprintMultiplier *
          seasonalMultiplier *
          milestoneMultiplier *
          randomVariation *
          memberVariation;

        totalAdd += weeklyAdd;

        // Delete rate calculation with variation
        let deleteRate = (1 - performanceValue / 100) * 0.3;

        // Refactoring weeks have much higher delete ratio
        if (isRefactoringWeek) {
          deleteRate *= 2.5;
        }

        // Sprint planning weeks have lower delete (more planning, less coding)
        if (sprintPhase === 3) {
          deleteRate *= 0.5;
        }

        // Add some random variation to deletions
        const deleteVariation = 0.7 + Math.sin(memberSeed + weekIndex) * 0.6; // 0.1 to 1.3
        const weeklyDelete = baseContribution * deleteRate * deleteVariation * refactoringMultiplier;

        totalDelete += weeklyDelete;
      });

      return {
        date: point.date,
        add: Math.max(50, Math.round(totalAdd)),      // Minimum threshold
        delete: Math.max(10, Math.round(totalDelete)), // Minimum threshold
      };
    });

    // Convert to cumulative format
    let cumulative = 0;
    return aggregated.map((point) => {
      cumulative += point.add - point.delete;
      return {
        week: point.date,
        cumulative: Math.round(cumulative),
        additions: point.add,
        deletions: point.delete,
      };
    });
  }, [timeFilteredData, teamId]);

  // Calculate benchmark values for team comparison
  const teamBenchmarks = useMemo(() => {
    if (members.length === 0 || aggregateTeamData.length === 0) {
      return { orgBenchmark: undefined, industryBenchmark: undefined };
    }

    // Get final cumulative value for the team
    const teamFinalValue = aggregateTeamData[aggregateTeamData.length - 1]?.cumulative ?? 0;

    // Org benchmark is typically around 60-70% of this team's performance (conservative estimate)
    const orgBenchmark = Math.round(teamFinalValue * 0.65);

    // Industry benchmark is typically higher (aspirational/stretch target)
    const industryBenchmark = Math.round(teamFinalValue * 1.3);

    return { orgBenchmark, industryBenchmark };
  }, [members, aggregateTeamData]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <DashboardSection title="Performance Tracking">
              <GaugeWithInsights
                value={teamPerformanceValue}
                label={getPerformanceGaugeLabel(teamPerformanceValue)}
                labelColor={getGaugeColor(teamPerformanceValue)}
                valueDisplay={`${teamPerformanceValue}/100`}
                insights={insights}
              />
            </DashboardSection>

            <section className="w-full" aria-label="Team performance chart">
              <div className="bg-white rounded-lg">
                <PerformanceChart
                  dataSource={{
                    type: "team",
                    data: timeFilteredData,
                    teamId: teamId!,
                  }}
                  eventStrategy={{
                    mode: "dynamic",
                    generator: generateTeamEvents,
                  }}
                  annotationStrategy={{
                    mode: "dynamic",
                    generator: generateTeamAnnotations,
                  }}
                  timeRange={timeRange}
                  ariaLabel="Team performance normalized to rolling average over time"
                />
              </div>
            </section>

            <DashboardSection title="Performance Comparison">
              <p className="text-sm text-gray-600 mb-4">
                Team aggregate cumulative DiffDelta compared to organization and industry benchmarks
              </p>
              <ContributorMetricsChart
                data={aggregateTeamData}
                contributorName="Team Performance"
                contributorColor="#2563eb"
                orgMedian={teamBenchmarks.orgBenchmark}
                teamMedian={teamBenchmarks.industryBenchmark}
                height={500}
              />
            </DashboardSection>

            {/* Member table section */}
            <DashboardSection title="Team Members" className="w-full">
              <BaseTeamsTable<MemberPerformanceWithDelta, PerformanceFilter>
                rows={tableRows}
                filterTabs={PERFORMANCE_FILTER_TABS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                defaultFilter="mostProductive"
                sortFunction={performanceSortFunction}
                columns={PERFORMANCE_MEMBER_COLUMNS}
                getRowKey={(row) => row.memberName}
              />
            </DashboardSection>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
