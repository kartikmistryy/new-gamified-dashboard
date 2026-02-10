"use client";

import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateUserPerformanceData, getUserMetricCards, getUserChartInsights } from "@/lib/userDashboard/mockData";
import { GaugeSection } from "@/components/dashboard/shared/GaugeSection";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/shared/OverviewSummaryCard";
import { useRouteParams } from "@/lib/RouteParamsProvider";

/**
 * User Dashboard Layout
 *
 * Contains the constant content (gauge, insights, metric cards) that persists
 * across all tabs. Only the tab-specific content (children) changes on navigation.
 *
 * Includes TimeRangeProvider for centralized time range management across all
 * visualizations and tables within the user dashboard.
 */
export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useRouteParams();

  // Generate mock data based on user (memoized to prevent regeneration)
  const userData = useMemo(
    () => {
      if (!userId) return null;
      const userName = `User ${userId.slice(0, 8)}`;
      return generateUserPerformanceData(userId, userName);
    },
    [userId]
  );

  // Get metric cards for the 3x2 grid
  const metricCards = useMemo(
    () => userData ? getUserMetricCards(userData) : [],
    [userData]
  );

  // Get chart insights
  const insights = useMemo(
    () => userData ? getUserChartInsights(userData.performanceScore) : [],
    [userData]
  );

  // Generate user initials for avatar fallback
  const userInitials = userData?.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  if (!userData) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            {/* Gauge and Insights - Constant across all tabs */}
            <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
              <div className="flex shrink-0 w-full lg:w-[320px]">
                <GaugeSection
                  gaugeValue={userData.performanceScore}
                  labelVariant="performance"
                />
              </div>
              <div className="flex-1 min-w-0">
                <ChartInsights insights={insights} />
              </div>
            </div>

            {/* Metric Cards - 3x2 Grid - Constant across all tabs */}
              <section aria-labelledby="metrics-heading">
                <h2 id="metrics-heading" className="sr-only">
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {metricCards.map((card) => (
                    <OverviewSummaryCard key={card.key} item={card} />
                  ))}
                </div>
              </section>

              {/* Tab-specific content (changes on navigation) */}
              <section className="mt-8">
                {children}
              </section>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
  );
}
