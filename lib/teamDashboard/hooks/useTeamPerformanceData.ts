/**
 * Team Performance Data Hook
 *
 * Extracts data processing logic from TeamPerformancePageClient.
 * Handles data generation, filtering, sampling, and insights calculation.
 *
 * @module lib/teamDashboard/hooks/useTeamPerformanceData
 */

import { useMemo } from "react";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { TIME_RANGE_OPTIONS } from "@/lib/shared/types/timeRangeTypes";
import type { MemberPerformanceRow } from "../types";
import { getMemberPerformanceRowsForTeam } from "../overviewMockData";
import { generateMemberPerformanceTimeSeries } from "../performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  isTimeRangeSufficient,
  getPerformanceInsights,
} from "../performanceHelpers";

/**
 * Generates deterministic change and churn rate values for members
 * Uses member name and index as seed for consistent results
 */
function addPerformanceMetrics(rows: MemberPerformanceRow[], teamId: string) {
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
}

/**
 * Custom hook for team performance data processing
 *
 * @param teamId - Team identifier
 * @param timeRange - Selected time range
 * @returns Processed performance data and metadata
 */
export function useTeamPerformanceData(teamId: string, timeRange: TimeRangeKey) {
  // Generate member rows with performance metrics
  const members = useMemo(() => {
    const rows = getMemberPerformanceRowsForTeam(52, teamId, 6);
    return addPerformanceMetrics(rows, teamId);
  }, [teamId]);

  // Generate time series data
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // Apply time range filtering
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  // Apply smart sampling for chart performance
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  // Calculate time range options with disabled states
  const timeRangeOptions = useMemo(
    () =>
      TIME_RANGE_OPTIONS.map((opt) => ({
        ...opt,
        disabled: !isTimeRangeSufficient(rawData, opt.id),
      })),
    [rawData]
  );

  // Generate performance insights
  const insights = useMemo(
    () => getPerformanceInsights(members, sampledData, timeRange),
    [members, sampledData, timeRange]
  );

  // Calculate cumulative team delta
  const cumulativeDelta = useMemo(() => {
    if (sampledData.length < 2) return 0;
    const firstValue = sampledData[0].value;
    const lastValue = sampledData[sampledData.length - 1].value;
    return Math.round(lastValue - firstValue);
  }, [sampledData]);

  // Calculate gauge value
  const gaugeValue = useMemo(() => {
    if (sampledData.length === 0) return 50;
    return Math.round(sampledData[sampledData.length - 1].value);
  }, [sampledData]);

  // Add deltas to members for table display
  const membersWithDelta = useMemo(() => {
    return members.map((member) => {
      // Find first and last occurrences in sampled data
      const memberPoints = sampledData.filter(
        (d) => "memberName" in d && d.memberName === member.memberName
      );

      if (memberPoints.length < 2) {
        return { ...member, delta: 0 };
      }

      const firstValue = memberPoints[0].value;
      const lastValue = memberPoints[memberPoints.length - 1].value;
      return {
        ...member,
        delta: Math.round(lastValue - firstValue),
      };
    });
  }, [members, sampledData]);

  return {
    members,
    membersWithDelta,
    rawData,
    sampledData,
    timeRangeOptions,
    insights,
    cumulativeDelta,
    gaugeValue,
  };
}
