"use client";

import { useMemo } from "react";
import { useRouteParams } from "@/lib/RouteParamsProvider";
import { useTimeRange } from "@/lib/contexts/TimeRangeContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { UserPerformanceComparisonChart } from "@/components/dashboard/UserPerformanceComparisonChart";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import {
  generateUserPerformanceData,
  generateUserCumulativePerformanceData,
  generateTeamMedianCumulativeData,
  generateOrgMedianCumulativeData,
  USER_PERFORMANCE_EVENTS,
  USER_PERFORMANCE_ANNOTATIONS,
} from "@/lib/userDashboard/userPerformanceChartData";
import { generateUserPerformanceData as getUserData } from "@/lib/userDashboard/mockData";

/**
 * User Performance Page Client Component
 *
 * Contains all business logic for the user performance page:
 * - Individual performance tracking chart
 * - Comparative performance chart (user vs team vs org)
 * - Uses centralized time range from TimeRangeContext
 */
export function UserPerformancePageClient() {
  const { userId } = useRouteParams();
  const { timeRange } = useTimeRange();

  // Generate user performance data for the chart
  const userData = useMemo(() => {
    if (!userId) return null;
    const userName = `User ${userId.slice(0, 8)}`;
    return getUserData(userId, userName);
  }, [userId]);

  const performanceData = useMemo(() => {
    if (!userId || !userData) return [];
    return generateUserPerformanceData(userId, userData.performanceScore);
  }, [userId, userData]);

  // Generate cumulative performance data for Plotly comparison chart
  const cumulativePerformanceData = useMemo(() => {
    if (!userId || !userData) return null;

    return generateUserCumulativePerformanceData(userId, userData.performanceScore);
  }, [userId, userData]);

  // Filter cumulative data based on time range
  const filteredCumulativeData = useMemo(() => {
    if (!cumulativePerformanceData || timeRange === "max") {
      return cumulativePerformanceData || [];
    }

    const endDate = new Date(cumulativePerformanceData[cumulativePerformanceData.length - 1].date);
    const startDate = getStartDateForRange(timeRange, endDate);

    return cumulativePerformanceData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }, [cumulativePerformanceData, timeRange]);

  // Generate comparison lines (team and org medians)
  const comparisonLines = useMemo(() => {
    const teamMedianData = generateTeamMedianCumulativeData();
    const orgMedianData = generateOrgMedianCumulativeData();

    // Filter based on time range
    const filterLine = (data: { date: string; value: number }[]) => {
      if (timeRange === "max" || data.length === 0) return data;

      const endDate = new Date(data[data.length - 1].date);
      const startDate = getStartDateForRange(timeRange, endDate);

      return data.filter((d) => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      });
    };

    return [
      {
        label: "Team Median",
        color: "#10b981",
        data: filterLine(teamMedianData),
        dashStyle: "dash" as const,
      },
      {
        label: "Org Median",
        color: "#8b5cf6",
        data: filterLine(orgMedianData),
        dashStyle: "dot" as const,
      },
    ];
  }, [timeRange]);

  if (!userId || !userData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Individual Performance Tracking */}
      <DashboardSection title="Performance Tracking">
        <PerformanceChart
          dataSource={{
            type: "user",
            data: performanceData,
            userId: userId!,
            userName: userData?.userName || "",
          }}
          eventStrategy={{
            mode: "static",
            events: USER_PERFORMANCE_EVENTS,
          }}
          annotationStrategy={{
            mode: "static",
            annotations: USER_PERFORMANCE_ANNOTATIONS,
          }}
          timeRange={timeRange}
          ariaLabel="User performance percentile normalized to rolling average over time"
        />
      </DashboardSection>

      {/* Performance Comparison: User vs Team vs Org */}
      {userData && filteredCumulativeData.length > 0 && (
        <DashboardSection title="Performance Comparison">
          <UserPerformanceComparisonChart
            userLine={{
              name: userData.userName,
              color: "#2563eb",
              data: filteredCumulativeData,
            }}
            comparisonLines={comparisonLines}
          />
        </DashboardSection>
      )}
    </div>
  );
}
