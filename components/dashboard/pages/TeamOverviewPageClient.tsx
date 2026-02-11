"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberPerformanceRowsForTeam } from "@/lib/dashboard/entities/member/mocks/overviewMockData";
import { calculateTeamGaugeValue, getMemberMetricCards, getMemberInsights } from "@/lib/dashboard/entities/member/utils/overviewHelpers";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/shared/OverviewSummaryCard";
import { MemberTable } from "@/components/dashboard/teamDashboard/MemberTable";
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";

export function TeamOverviewPageClient() {
  const { teamId } = useRouteParams();

  // Generate member data (Phase 1 function)
  const memberRows = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId!, 6),
    [teamId]
  );

  // Calculate team gauge value as average of member performance
  const teamGaugeValue = useMemo(() => calculateTeamGaugeValue(memberRows), [memberRows]);

  // Calculate metric cards by summing typeDistribution fields
  const metricCards = useMemo(() => getMemberMetricCards(memberRows), [memberRows]);

  // Generate insights with member names
  const insights = useMemo(() => getMemberInsights(memberRows), [memberRows]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <DashboardSection title="Overview">
              <div className="flex flex-row flex-wrap items-stretch gap-8">
                <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
                  <GaugeSection
                    gaugeValue={teamGaugeValue}
                    labelVariant="performance"
                  />
                </div>
                <div className="flex-1 min-w-[280px]">
                  <ChartInsights insights={insights} />
                </div>
              </div>

              <div className="@container w-full mt-8">
                <div className="grid grid-cols-3 gap-4 @[1050px]:grid-cols-6">
                  {metricCards.map((item) => (
                    <OverviewSummaryCard key={item.key} item={item} />
                  ))}
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="Team Members" className="w-full">
              <MemberTable rows={memberRows} />
            </DashboardSection>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
