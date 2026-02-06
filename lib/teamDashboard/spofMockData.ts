import { getMemberPerformanceRowsForTeam } from "./overviewMockData";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";
import type { SpofDataPoint } from "@/lib/orgDashboard/spofMockData";

/** Member SPOF row type for team dashboard SPOF tab. */
export type MemberSpofRow = {
  memberName: string;
  teamId: string;
  avgSpofScore: number; // 0-6 scale, average of member's SPOF data points
  domainCount: number; // 1-5 domains member contributes to
  skillCount: number; // 3-15 skills
  repoCount: number; // repos member has committed to
  highRiskCount: number; // repos where member is sole contributor, score > 2.2
  lowRiskCount: number; // well-distributed repos, score < 0.2
  repoHealthHealthy: number;
  repoHealthNeedsAttention: number;
  repoHealthCritical: number;
  memberColor: string; // for chart legend, use DASHBOARD_COLORS cycle
};

/** Simple deterministic noise function based on seed */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Cycle through dashboard colors for member assignment (6 colors available). */
const COLOR_PALETTE = [
  DASHBOARD_COLORS.blue,
  DASHBOARD_COLORS.excellent,
  DASHBOARD_COLORS.skillOrange,
  DASHBOARD_COLORS.skillLavender,
  DASHBOARD_COLORS.skillBlue,
  DASHBOARD_COLORS.skillGreen,
];

/**
 * Generate member SPOF data for team dashboard.
 * Reuses member names from performance data for consistency.
 */
export function getMemberSpofData(teamId: string, memberCount?: number): MemberSpofRow[] {
  // Reuse member names from performance data
  const baseMembers = getMemberPerformanceRowsForTeam(52, teamId, memberCount);

  return baseMembers.map((member, index) => {
    const memberName = member.memberName;
    const seed = memberName.charCodeAt(0) + index * 100;

    // Generate SPOF metrics with deterministic variation
    const spofNoise = noise(seed);
    const avgSpofScore = Math.round((0.3 + spofNoise * 4.2) * 10) / 10; // 0.3-4.5 range, 1 decimal

    const domainNoise = noise(seed + 1);
    const domainCount = Math.floor(1 + domainNoise * 5); // 1-5

    const skillNoise = noise(seed + 2);
    const skillCount = Math.floor(3 + skillNoise * 13); // 3-15

    const repoNoise = noise(seed + 3);
    const repoCount = Math.floor(5 + repoNoise * 21); // 5-25

    // High risk count derived from avgSpofScore (higher SPOF = more high-risk repos)
    const highRiskRatio = avgSpofScore / 6.0; // Normalize to 0-1
    const highRiskCount = Math.floor(repoCount * highRiskRatio * 0.4); // Up to 40% of repos

    // Low risk count: inverse relationship to avgSpofScore
    const lowRiskRatio = 1 - highRiskRatio;
    const lowRiskCount = Math.floor(repoCount * lowRiskRatio * 0.5); // Up to 50% of repos

    // Repo health distribution: deterministic based on SPOF score
    // Lower SPOF score = more healthy repos
    const healthyRatio = Math.max(0.2, 1 - avgSpofScore / 6.0); // 20%-100%
    const criticalRatio = Math.min(0.4, avgSpofScore / 6.0 * 0.6); // 0%-40%
    const attentionRatio = 1 - healthyRatio - criticalRatio;

    const repoHealthHealthy = Math.floor(repoCount * healthyRatio);
    const repoHealthCritical = Math.floor(repoCount * criticalRatio);
    const repoHealthNeedsAttention = repoCount - repoHealthHealthy - repoHealthCritical;

    // Assign color cycling through palette
    const memberColor = COLOR_PALETTE[index % COLOR_PALETTE.length];

    return {
      memberName,
      teamId,
      avgSpofScore,
      domainCount,
      skillCount,
      repoCount,
      highRiskCount,
      lowRiskCount,
      repoHealthHealthy,
      repoHealthNeedsAttention,
      repoHealthCritical,
      memberColor,
    };
  });
}

/**
 * Generate SPOF data points for distribution chart.
 * Returns SpofDataPoint[] with member names in the 'team' field.
 */
export function getMemberSpofDataPoints(members: MemberSpofRow[]): SpofDataPoint[] {
  const dataPoints: SpofDataPoint[] = [];

  members.forEach((member, memberIndex) => {
    // Generate 8-20 data points per member
    const seed = member.memberName.charCodeAt(0) + memberIndex * 50;
    const pointCount = 8 + Math.floor(noise(seed) * 13); // 8-20

    for (let i = 0; i < pointCount; i++) {
      // Cluster points around member's avgSpofScore
      const pointSeed = seed + i * 10;
      const variation = (noise(pointSeed) - 0.5) * 2; // ±1 variation
      const score = Math.max(0, Math.min(6, member.avgSpofScore + variation));

      dataPoints.push({
        score,
        team: member.memberName, // Use member name in 'team' field for chart grouping
      });
    }
  });

  return dataPoints;
}

/**
 * Calculate team SPOF gauge value (0-100 scale for D3Gauge).
 * Lower avgSpofScore = higher gauge value (safer team).
 */
export function calculateTeamSpofGaugeValue(members: MemberSpofRow[]): number {
  if (members.length === 0) return 0;

  const avgTeamSpof = members.reduce((sum, m) => sum + m.avgSpofScore, 0) / members.length;

  // Formula: lower SPOF score = higher gauge value
  // Score 0 = 100 (safest), Score 6 = 0 (riskiest)
  return Math.round(100 - (avgTeamSpof / 6) * 100);
}
