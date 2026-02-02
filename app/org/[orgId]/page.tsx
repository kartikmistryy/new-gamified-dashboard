"use client";

import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTeamPerformanceRowsForGauge,
  getOverviewSummaryCardsForGauge,
} from "@/lib/orgDashboard/overviewMockData";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { OverviewSummaryCard } from "@/components/dashboard/OverviewSummaryCard";
import { TeamTable } from "@/components/dashboard/TeamTable";

export default function OrgSummaryPage() {
  const [gaugeValue] = useState(() => Math.floor(Math.random() * 101));
  const teamRows = useMemo(
    () => getTeamPerformanceRowsForGauge(gaugeValue),
    [gaugeValue],
  );
  const summaryCards = useMemo(
    () => getOverviewSummaryCardsForGauge(gaugeValue),
    [gaugeValue],
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <h2 className="text-2xl font-semibold text-foreground">
              Organization Overview
            </h2>

            <GaugeSection
              gaugeValue={gaugeValue}
              labelVariant="performance"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {summaryCards.map((item) => (
                <OverviewSummaryCard key={item.key} item={item} />
              ))}
            </div>

            <section className="w-full" aria-labelledby="teams-heading">
              <h2 id="teams-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Teams
              </h2>
              <TeamTable rows={teamRows} />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
