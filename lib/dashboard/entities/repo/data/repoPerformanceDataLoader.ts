/**
 * Static loader for per-repo performance data.
 * Data is pre-aggregated from contributor_metrics.json files — no runtime fetch.
 */

import RAW_DATA from "./repo_performance_data.json";
import { getPerformanceGaugeLabel } from "@/lib/dashboard/entities/team/utils/utils";
import { getPerformanceBarColor } from "@/lib/dashboard/entities/team/utils/tableUtils";
import type { ContributorPerformanceRow } from "@/lib/dashboard/entities/contributor/types";
import type { ContributorPerformanceWithDelta } from "@/lib/dashboard/entities/contributor/tables/performanceTableConfig";

// ---------------------------------------------------------------------------
// Types matching repo_performance_data.json shape
// ---------------------------------------------------------------------------

type RawContributor = {
  rank: number;
  name: string;
  totalCommits: number;
  totalDiffDelta: number;
  churnRatePct: number;
  gaugeValue: number;
  trend: "up" | "down" | "flat";
};

type RawRepoData = {
  repoId: string;
  churnRatePct: number;
  gaugeValue: number;
  contributorCount: number;
  totalCommits: number;
  contributors: RawContributor[];
};

type RawData = {
  schemaVersion: string;
  generatedAt: string;
  repos: Record<string, RawRepoData>;
};

const DATA = RAW_DATA as RawData;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns the churn-based gauge value (0–100) for a repo, or null if unknown. */
export function getRepoGaugeValue(repoId: string): number | null {
  const repo = DATA.repos[repoId];
  return repo ? repo.gaugeValue : null;
}

/** Returns churn rate % for a repo, or null if unknown. */
export function getRepoChurnRate(repoId: string): number | null {
  const repo = DATA.repos[repoId];
  return repo ? repo.churnRatePct : null;
}

/**
 * Builds ContributorPerformanceWithDelta rows from real contributor data.
 * cumulativeDiffDelta = totalDiffDelta (lifetime), churnRate = per-contributor real value.
 * typeDistribution is zeroed (not displayed on performance table).
 */
export function buildRepoContributorTableRows(
  repoId: string,
  count?: number
): ContributorPerformanceWithDelta[] {
  const repo = DATA.repos[repoId];
  if (!repo) return [];

  const contributors = count ? repo.contributors.slice(0, count) : repo.contributors;

  return contributors.map((c, index) => {
    const performanceValue = c.gaugeValue;
    const performanceLabel = getPerformanceGaugeLabel(performanceValue);
    const performanceBarColor = getPerformanceBarColor(performanceValue);

    const row: ContributorPerformanceRow = {
      level: "contributor",
      rank: index + 1,
      contributorName: c.name,
      contributorAvatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(c.name)}`,
      repoId,
      performanceLabel,
      performanceValue,
      trend: c.trend,
      performanceBarColor,
      change: 0, // no time-series available
      churnRate: c.churnRatePct,
      typeDistribution: { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 },
    };

    return {
      ...row,
      cumulativeDiffDelta: c.totalDiffDelta,
    };
  });
}

/** Lists all repoIds that have real performance data. */
export function getAvailablePerformanceRepos(): string[] {
  return Object.keys(DATA.repos);
}
