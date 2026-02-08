"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getContributorPerformanceRowsForRepo } from "@/lib/repoDashboard/overviewMockData";
import { calculateRepoGaugeValue, getContributorMetricCards, getContributorInsights } from "@/lib/repoDashboard/overviewHelpers";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/OverviewSummaryCard";
import { ContributorTable } from "@/components/dashboard/ContributorTable";
import { useRouteParams } from "@/lib/RouteParamsProvider";

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
            <h2 className="text-2xl font-semibold text-foreground">
              Overview
            </h2>

            <div className="flex flex-row gap-5">
              <GaugeSection
                gaugeValue={repoGaugeValue}
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

            <section className="w-full" aria-labelledby="contributors-heading">
              <h2 id="contributors-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Repository Contributors
              </h2>
              <ContributorTable rows={contributorRows} />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
