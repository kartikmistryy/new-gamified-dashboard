"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { formatOrgTitle, getChartDataByTimeRange } from "@/lib/orgDashboard/utils";
import { CRYPTO_ROWS } from "@/lib/orgDashboard/constants";
import { OrganizationSummaryHeader } from "@/components/dashboard/OrganizationSummaryHeader";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { SummaryChart } from "@/components/dashboard/SummaryChart";
import { AIRecommendationsCard } from "@/components/dashboard/AIRecommendationsCard";
import { TeamTable } from "@/components/dashboard/TeamTable";

export default function OrgPerformancePage() {
  const params = useParams();
  const orgId = (params?.orgId as string) ?? "org";
  const orgTitle = formatOrgTitle(orgId);

  const [timeRange, setTimeRange] = React.useState("1-month");
  const [gaugeValue, setGaugeValue] = React.useState(() =>
    Math.floor(Math.random() * 101),
  );

  const chartData = React.useMemo(() => {
    const base = getChartDataByTimeRange(timeRange);
    if (base.length === 0) return base;
    const last = base[base.length - 1];
    return [...base.slice(0, -1), { ...last, fearGreed: gaugeValue }];
  }, [timeRange, gaugeValue]);

  const handleTimeRangeChange = React.useCallback(
    (value: string | undefined) => {
      if (value) {
        setTimeRange(value);
        setGaugeValue(Math.floor(Math.random() * 101));
      }
    },
    [],
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 bg-white text-gray-900 min-h-screen">
        <Card className="bg-white pt-0 pb-0 w-full h-full border-none shadow-none">
          <OrganizationSummaryHeader
            title={`Organization X Performance`}
            tooltip={{
              title: `${orgTitle} Performance`,
              description:
                "Performance metrics and historical data for this organization.",
            }}
          />
          <CardContent className="space-y-6 w-full h-full flex flex-col items-center justify-start">
            <GaugeSection
              gaugeValue={gaugeValue}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
            <SummaryChart chartData={chartData} gaugeValue={gaugeValue} />
            <div className="w-full flex justify-start items-start">
            <AIRecommendationsCard gaugeValue={gaugeValue} chartData={chartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white py-10 px-6 w-full h-full border-none shadow-none">
          <TeamTable rows={CRYPTO_ROWS} />
        </Card>
      </div>
    </TooltipProvider>
  );
}
