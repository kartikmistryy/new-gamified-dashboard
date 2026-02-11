import { getContributorPerformanceRowsForRepo } from "../mocks/overviewMockData";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
import type { SpofDataPoint } from "@/lib/dashboard/entities/team/mocks/spofMockData";

/** Contributor SPOF row type for repository dashboard SPOF tab. */
export type ContributorSpofRow = {
  contributorName: string;
  repoId: string;
  ownershipPct: number;
  ownedModules: number;
  avgSpofScore: number; // 0-6 scale, average of contributor's SPOF data points
  domainCount: number; // 1-5 domains contributor contributes to
  skillCount: number; // 3-15 skills
  moduleCount: number; // modules contributor has committed to in this repo
  highRiskCount: number; // modules where contributor is sole owner, score > 2.2
  lowRiskCount: number; // well-distributed modules, score < 0.2
  repoHealthHealthy: number;
  repoHealthNeedsAttention: number;
  repoHealthCritical: number;
  contributorColor: string; // for chart legend, use DASHBOARD_COLORS cycle
};

/** Simple deterministic noise function based on seed */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Cycle through dashboard colors for contributor assignment (6 colors available). */
const COLOR_PALETTE = [
  DASHBOARD_COLORS.blue,
  DASHBOARD_COLORS.excellent,
  DASHBOARD_COLORS.skillOrange,
  DASHBOARD_COLORS.skillLavender,
  DASHBOARD_COLORS.skillBlue,
  DASHBOARD_COLORS.skillGreen,
];

/**
 * Generate contributor SPOF data for repository dashboard.
 * Reuses contributor names from performance data for consistency.
 */
export function getContributorSpofData(repoId: string, contributorCount?: number): ContributorSpofRow[] {
  // Reuse contributor names from performance data
  const baseContributors = getContributorPerformanceRowsForRepo(52, repoId, contributorCount);

  return baseContributors.map((contributor, index) => {
    const contributorName = contributor.contributorName;
    const seed = contributorName.charCodeAt(0) + index * 100;

    // Generate SPOF metrics with deterministic variation
    const spofNoise = noise(seed);
    const avgSpofScore = Math.round((0.3 + spofNoise * 4.2) * 10) / 10; // 0.3-4.5 range, 1 decimal

    const domainNoise = noise(seed + 1);
    const domainCount = Math.floor(1 + domainNoise * 5); // 1-5

    const skillNoise = noise(seed + 2);
    const skillCount = Math.floor(3 + skillNoise * 13); // 3-15

    const moduleNoise = noise(seed + 3);
    const moduleCount = Math.floor(5 + moduleNoise * 21); // 5-25 modules in this repo
    const ownershipPct = Math.round(8 + noise(seed + 11) * 34); // 8 - 42
    const ownedModules = Math.max(1, Math.floor(1 + noise(seed + 12) * 9)); // 1-9

    // High risk count derived from avgSpofScore (higher SPOF = more high-risk modules)
    const highRiskRatio = avgSpofScore / 6.0; // Normalize to 0-1
    const highRiskCount = Math.floor(moduleCount * highRiskRatio * 0.4); // Up to 40% of modules

    // Low risk count: inverse relationship to avgSpofScore
    const lowRiskRatio = 1 - highRiskRatio;
    const lowRiskCount = Math.floor(moduleCount * lowRiskRatio * 0.5); // Up to 50% of modules

    // Repo health distribution: deterministic based on SPOF score
    // Lower SPOF score = more healthy modules
    const healthyRatio = Math.max(0.2, 1 - avgSpofScore / 6.0); // 20%-100%
    const criticalRatio = Math.min(0.4, avgSpofScore / 6.0 * 0.6); // 0%-40%

    const repoHealthHealthy = Math.floor(moduleCount * healthyRatio);
    const repoHealthCritical = Math.floor(moduleCount * criticalRatio);
    const repoHealthNeedsAttention = moduleCount - repoHealthHealthy - repoHealthCritical;

    // Assign color cycling through palette
    const contributorColor = COLOR_PALETTE[index % COLOR_PALETTE.length];

    return {
      contributorName,
      repoId,
      ownershipPct,
      ownedModules,
      avgSpofScore,
      domainCount,
      skillCount,
      moduleCount,
      highRiskCount,
      lowRiskCount,
      repoHealthHealthy,
      repoHealthNeedsAttention,
      repoHealthCritical,
      contributorColor,
    };
  });
}

/**
 * Generate SPOF data points for distribution chart.
 * Returns SpofDataPoint[] with contributor names in the 'team' field.
 */
export function getContributorSpofDataPoints(contributors: ContributorSpofRow[]): SpofDataPoint[] {
  const dataPoints: SpofDataPoint[] = [];

  contributors.forEach((contributor, contributorIndex) => {
    // Generate 8-20 data points per contributor
    const seed = contributor.contributorName.charCodeAt(0) + contributorIndex * 50;
    const pointCount = 8 + Math.floor(noise(seed) * 13); // 8-20

    for (let i = 0; i < pointCount; i++) {
      // Cluster points around contributor's avgSpofScore
      const pointSeed = seed + i * 10;
      const variation = (noise(pointSeed) - 0.5) * 2; // ±1 variation
      const score = Math.max(0, Math.min(6, contributor.avgSpofScore + variation));

      dataPoints.push({
        score,
        team: contributor.contributorName, // Use contributor name in 'team' field for chart grouping
      });
    }
  });

  return dataPoints;
}

/**
 * Calculate repository SPOF gauge value (0-100 scale for D3Gauge).
 * Lower avgSpofScore = higher gauge value (safer repository).
 */
export function calculateRepoSpofGaugeValue(contributors: ContributorSpofRow[]): number {
  if (contributors.length === 0) return 0;

  const avgRepoSpof = contributors.reduce((sum, c) => sum + c.avgSpofScore, 0) / contributors.length;

  // Formula: lower SPOF score = higher gauge value
  // Score 0 = 100 (safest), Score 6 = 0 (riskiest)
  return Math.round(100 - (avgRepoSpof / 6) * 100);
}
