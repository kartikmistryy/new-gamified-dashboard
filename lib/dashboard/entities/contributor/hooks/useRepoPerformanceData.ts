/** Custom hook for Repo Performance data processing pipeline */

import { useMemo, useState, useEffect } from "react";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { getContributorPerformanceRowsForRepo } from "../mocks/overviewMockData";
import { generateContributorPerformanceTimeSeries } from "../mocks/performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  getPerformanceInsights,
  generateContributorTimeSeriesMetrics,
  aggregateContributorMetrics,
  generateCumulativeData,
} from "../utils/performanceHelpers";
import {
  enrichContributorsWithMetrics,
  calculateCumulativeDiffDelta,
  buildTableRowsWithScaling,
  calculateMedianValues,
  prepareCarouselContributors,
  filterAggregateDataByTimeRange,
  type EnrichedContributor,
  type ContributorMetrics,
} from "../utils/repoPerformanceUtils";
import {
  getRepoTimeseriesData,
  type RepoTimeseriesFile,
} from "@/lib/dashboard/entities/repo/data/repoTimeseriesDataLoader";
import { getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { getPerformanceBarColor } from "@/lib/dashboard/entities/team/utils/tableUtils";

// ---------------------------------------------------------------------------
// Real-data derivation helpers (schemaVersion 1.1+)
// ---------------------------------------------------------------------------

/** Normalize an array of positive numbers to 0–100 using min/max scaling. */
function normalizeValues(values: number[]): number[] {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values.map((v) => Math.round(((v - min) / range) * 100));
}

/**
 * Build EnrichedContributor[] from real timeseries data.
 * Uses lifetimeTotals for performanceValue / churnRate, and per-week data for trend/change.
 */
function buildContributorsFromTimeseries(
  ts: RepoTimeseriesFile,
  repoId: string
): EnrichedContributor[] {
  const { topContributors, lifetimeTotals, data } = ts;

  // Lifetime delta per contributor from contributorValues sum
  const lifetimeDelta = new Map<string, number>();
  for (const point of data) {
    for (const name of topContributors) {
      const v = point.contributorValues[name] ?? 0;
      lifetimeDelta.set(name, (lifetimeDelta.get(name) ?? 0) + v);
    }
  }

  const deltaValues = topContributors.map((n) => lifetimeDelta.get(n) ?? 0);
  const normalizedPerf = normalizeValues(deltaValues);

  // Recent vs previous 13 weeks for trend + change
  const recentCutoff = Math.max(0, data.length - 13);
  const midCutoff = Math.max(0, data.length - 26);

  return topContributors.map((name, i) => {
    const performanceValue = normalizedPerf[i] ?? 50;
    const totals = lifetimeTotals?.[name] ?? { additions: 0, deletions: 0 };
    const totalLines = totals.additions + totals.deletions;
    const churnRate = totalLines > 0 ? Math.round((totals.deletions / totalLines) * 100) : 0;

    const recentDelta = data
      .slice(recentCutoff)
      .reduce((s, p) => s + (p.contributorValues[name] ?? 0), 0);
    const prevDelta = data
      .slice(midCutoff, recentCutoff)
      .reduce((s, p) => s + (p.contributorValues[name] ?? 0), 0);
    const change = recentDelta - prevDelta;
    const trend: "up" | "down" | "flat" =
      change > 2 ? "up" : change < -2 ? "down" : "flat";

    return {
      level: "contributor" as const,
      rank: i + 1,
      contributorName: name,
      contributorAvatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}`,
      repoId,
      performanceLabel: getPerformanceGaugeLabel(performanceValue),
      performanceValue,
      performanceBarColor: getPerformanceBarColor(performanceValue),
      trend,
      change,
      churnRate,
      typeDistribution: { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 },
    };
  });
}

/**
 * Build ContributorMetrics[] (per-week additions/deletions arrays) from real timeseries.
 * Requires schemaVersion 1.1+ data with contributorAdditions / contributorDeletions.
 */
function buildContributorMetricsFromTimeseries(
  ts: RepoTimeseriesFile
): ContributorMetrics[] | null {
  const hasRealAddDel = ts.data.length > 0 && ts.data[0].contributorAdditions !== undefined;
  if (!hasRealAddDel) return null;

  return ts.topContributors.map((name) => ({
    contributorName: name,
    additionsData: ts.data.map((p) => p.contributorAdditions?.[name] ?? 0),
    deletionsData: ts.data.map((p) => p.contributorDeletions?.[name] ?? 0),
  }));
}

/**
 * Build aggregate additions/deletions arrays (summed across all top contributors) per week.
 */
function buildAggregateMetricsFromTimeseries(
  ts: RepoTimeseriesFile,
  contributorMetrics: ContributorMetrics[]
): {
  additionsData: Array<{ week: string; value: number }>;
  deletionsData: Array<{ week: string; value: number }>;
} {
  return {
    additionsData: ts.data.map((point, i) => ({
      week: point.date,
      value: contributorMetrics.reduce((s, m) => s + (m.additionsData[i] ?? 0), 0),
    })),
    deletionsData: ts.data.map((point, i) => ({
      week: point.date,
      value: contributorMetrics.reduce((s, m) => s + (m.deletionsData[i] ?? 0), 0),
    })),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRepoPerformanceData(repoId: string, timeRange: TimeRangeKey) {
  // ── Real timeseries: fetched async from /data/timeseries/[repoId].json ──
  const [realTimeseries, setRealTimeseries] = useState<RepoTimeseriesFile | null>(null);
  const [timeseriesReady, setTimeseriesReady] = useState(false);

  useEffect(() => {
    if (!repoId) return;
    let cancelled = false;
    getRepoTimeseriesData(repoId).then((result) => {
      if (cancelled) return;
      if (result && result.data.length > 0) {
        setRealTimeseries(result);
        setTimeseriesReady(true);
      } else {
        setRealTimeseries(null);
        setTimeseriesReady(false);
      }
    });
    return () => { cancelled = true; };
  }, [repoId]);

  // ── Mock contributors (table rows, carousel, insights fallback) ──
  const mockContributorRows = useMemo(() => {
    const rows = getContributorPerformanceRowsForRepo(52, repoId, 6);
    return enrichContributorsWithMetrics(rows);
  }, [repoId]);

  // ── Time series: real if available, mock fallback ──
  const mockRawData = useMemo(
    () => generateContributorPerformanceTimeSeries(mockContributorRows),
    [mockContributorRows]
  );

  const rawData = useMemo(
    () => (timeseriesReady && realTimeseries ? realTimeseries.data : mockRawData),
    [timeseriesReady, realTimeseries, mockRawData]
  );

  const timeFilteredData = useMemo(() => filterByTimeRange(rawData, timeRange), [rawData, timeRange]);

  const sampledData = useMemo(() => smartSample(timeFilteredData), [timeFilteredData]);

  // ── Real contributors + metrics (schemaVersion 1.1+) ──
  const realContributors = useMemo(
    () => (timeseriesReady && realTimeseries ? buildContributorsFromTimeseries(realTimeseries, repoId) : null),
    [timeseriesReady, realTimeseries, repoId]
  );

  const realContributorMetrics = useMemo(
    () => (timeseriesReady && realTimeseries ? buildContributorMetricsFromTimeseries(realTimeseries) : null),
    [timeseriesReady, realTimeseries]
  );

  // ── Active contributors: real if available, mock fallback ──
  const contributors = useMemo(
    () => realContributors ?? mockContributorRows,
    [realContributors, mockContributorRows]
  );

  const insights = useMemo(
    () => getPerformanceInsights(contributors, sampledData, timeRange),
    [contributors, sampledData, timeRange]
  );

  const cumulativeDiffDeltaByContributor = useMemo(
    () => calculateCumulativeDiffDelta(timeFilteredData, contributors),
    [timeFilteredData, contributors]
  );

  const tableRows = useMemo(
    () => buildTableRowsWithScaling(contributors, cumulativeDiffDeltaByContributor),
    [contributors, cumulativeDiffDeltaByContributor]
  );

  const repoPerformanceValue = useMemo(() => {
    if (contributors.length === 0) return 0;
    const total = contributors.reduce((sum, c) => sum + c.performanceValue, 0);
    return Math.round(total / contributors.length);
  }, [contributors]);

  // ── Contributor metrics for carousel + aggregate chart ──
  // Real (additions/deletions per week) when available, mock otherwise.
  const mockContributorTimeSeriesMetrics = useMemo(
    () => generateContributorTimeSeriesMetrics(mockContributorRows, 52),
    [mockContributorRows]
  );

  const contributorMetrics = useMemo<ContributorMetrics[]>(() => {
    if (realContributorMetrics) return realContributorMetrics;
    return mockContributorTimeSeriesMetrics.map((m) => ({
      contributorName: m.contributorName,
      additionsData: m.additionsData.map((d) => d.value),
      deletionsData: m.deletionsData.map((d) => d.value),
    }));
  }, [realContributorMetrics, mockContributorTimeSeriesMetrics]);

  // ── Aggregate chart data ──
  const aggregateMetrics = useMemo(() => {
    if (realContributorMetrics && realTimeseries) {
      return buildAggregateMetricsFromTimeseries(realTimeseries, realContributorMetrics);
    }
    const agg = aggregateContributorMetrics(mockContributorTimeSeriesMetrics);
    return { additionsData: agg.additionsData, deletionsData: agg.deletionsData };
  }, [realContributorMetrics, realTimeseries, mockContributorTimeSeriesMetrics]);

  const aggregateCumulativeData = useMemo(
    () => generateCumulativeData(aggregateMetrics.additionsData, aggregateMetrics.deletionsData),
    [aggregateMetrics]
  );

  const filteredAggregateData = useMemo(
    () => filterAggregateDataByTimeRange(aggregateCumulativeData, timeRange),
    [aggregateCumulativeData, timeRange]
  );

  const generateCumulativeDataFromNumbers = useMemo(
    () => (additions: number[], deletions: number[]) => {
      const additionsData = additions.map((value, index) => ({ week: `W${index + 1}`, value }));
      const deletionsData = deletions.map((value, index) => ({ week: `W${index + 1}`, value }));
      return generateCumulativeData(additionsData, deletionsData);
    },
    []
  );

  const medianValues = useMemo(
    () => calculateMedianValues(contributorMetrics, generateCumulativeDataFromNumbers),
    [contributorMetrics, generateCumulativeDataFromNumbers]
  );

  const carouselContributors = useMemo(
    () => prepareCarouselContributors(contributors, contributorMetrics, generateCumulativeDataFromNumbers, timeRange),
    [contributors, contributorMetrics, generateCumulativeDataFromNumbers, timeRange]
  );

  return {
    contributors,
    timeFilteredData,
    insights,
    tableRows,
    repoPerformanceValue,
    filteredAggregateData,
    medianValues,
    carouselContributors,
    timeseriesReady,
  };
}
