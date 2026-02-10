"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getContributorPerformanceRowsForRepo } from "@/lib/repoDashboard/overviewMockData";
import { calculateRepoGaugeValue, getContributorMetricCards, getContributorInsights } from "@/lib/repoDashboard/overviewHelpers";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/shared/OverviewSummaryCard";
import { ContributorTable } from "@/components/dashboard/repoDashboard/ContributorTable";
import { useRouteParams } from "@/lib/RouteParamsProvider";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";

export function RepoOverviewPageClient() {
  const { repoId } = useRouteParams();

  // Generate contributor data
  const contributorRows = useMemo(
    () => getContributorPerformanceRowsForRepo(52, repoId!, 6),
    [repoId]
  );

  // Calculate repository gauge value as average of contributor performance
  const repoGaugeValue = useMemo(() => calculateRepoGaugeValue(contributorRows), [contributorRows]);

  // Calculate metric cards by summing typeDistribution fields
  const metricCards = useMemo(() => getContributorMetricCards(contributorRows), [contributorRows]);

  // Generate insights with contributor names
  const insights = useMemo(() => getContributorInsights(contributorRows), [contributorRows]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <DashboardSection title="Overview">
              <div className="flex flex-row flex-wrap items-stretch gap-8">
                <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
                  <GaugeSection
                    gaugeValue={repoGaugeValue}
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

            <DashboardSection title="Repository Contributors" className="w-full">
              <ContributorTable rows={contributorRows} />
            </DashboardSection>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
