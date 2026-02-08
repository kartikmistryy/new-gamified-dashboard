"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { calculateTeamGaugeValue, getMemberMetricCards, getMemberInsights } from "@/lib/teamDashboard/overviewHelpers";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/OverviewSummaryCard";
import { MemberTable } from "@/components/dashboard/MemberTable";
import { useRouteParams } from "@/lib/RouteParamsProvider";

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
            <h2 className="text-2xl font-semibold text-foreground">
              Overview
            </h2>

            <div className="flex flex-row gap-5">
              <GaugeSection
                gaugeValue={teamGaugeValue}
                labelVariant="performance"
              />
              <ChartInsights insights={insights} />
            </div>

            <div className="@container w-full">
              <div className="grid grid-cols-3 gap-4 @[1050px]:grid-cols-6">
                {metricCards.map((item) => (
                  <OverviewSummaryCard key={item.key} item={item} />
                ))}
              </div>
            </div>

            <section className="w-full" aria-labelledby="members-heading">
              <h2 id="members-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Team Members
              </h2>
              <MemberTable rows={memberRows} />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
