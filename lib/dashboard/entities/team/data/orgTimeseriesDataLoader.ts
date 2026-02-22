/**
 * Loader for org-level weekly time-series data.
 * Data is pre-aggregated from commit_metrics.json files across all Datadog repos.
 * Source: aggregate-timeseries.mjs → org_timeseries_data.json
 */

import RAW from "./org_timeseries_data.json";
import type { OrgPerformanceDataPoint } from "@/lib/dashboard/shared/charts/performanceChart/types";

type RawOrgTimeseries = {
  schemaVersion: string;
  generatedAt: string;
  granularity: string;
  repoNames: string[];
  data: OrgPerformanceDataPoint[];
};

const DATA = RAW as RawOrgTimeseries;

/** Weekly org performance data points (OrgPerformanceDataPoint[]).
 *  teamValues keys are Datadog repo names (browser-sdk, datadog-agent, etc.).
 *  Returns empty array if scripts haven't been run yet. */
export const ORG_TIMESERIES_DATA: OrgPerformanceDataPoint[] = DATA.data ?? [];

/** Repo names included in this timeseries */
export const ORG_TIMESERIES_REPO_NAMES: string[] = DATA.repoNames ?? [];

/** Whether real data has been generated (scripts have been run) */
export const ORG_TIMESERIES_READY: boolean = ORG_TIMESERIES_DATA.length > 0;
