import type { MemberPerformanceRow } from "../types";
import type { DeveloperPoint } from "@/lib/dashboard/entities/team/types";
import type { ChaosPoint } from "@/lib/dashboard/entities/team/charts/chaosMatrix/chaosMatrixData";
import { getMemberPerformanceRowsForTeam } from "../mocks/overviewMockData";

/** Design row with ownership and chaos metrics for a team member. */
export type MemberDesignRow = {
  memberName: string;
  teamId: string;
  totalKarmaPoints: number;
  ownershipPct: number;
  medianWeeklyKp: number;
  churnRatePct: number;
  ownershipAllocation: [number, number, number]; // red, blue, green segments
  engineeringChaos: [number, number, number, number]; // red, light orange, blue, green segments
  outlierScore: number;
  skilledAIScore: number;
  unskilledScore: number;
  legacyScore: number;
};

/** Simple deterministic noise function based on seed */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Generate member design data with ownership and chaos metrics. */
export function getMemberDesignData(teamId: string, memberCount: number = 6): MemberDesignRow[] {
  // Reuse base member data for consistency
  const baseMembers = getMemberPerformanceRowsForTeam(52, teamId, memberCount);

  return baseMembers.map((member, index) => {
    // Use member name and index as deterministic seed
    const seed = member.memberName.charCodeAt(0) + member.memberName.charCodeAt(1) * 10 + index * 1000;

    // Generate KP metrics (1k-50k range)
    const kpNoise = noise(seed);
    const totalKarmaPoints = Math.round(1000 + kpNoise * 49000);

    // Generate ownership percentage (2-28% range)
    const ownNoise = noise(seed + 100);
    const ownershipPct = 2 + ownNoise * 26;

    // Generate median weekly KP (500-3000 range)
    const weeklyKpNoise = noise(seed + 200);
    const medianWeeklyKp = Math.round(500 + weeklyKpNoise * 2500);

    // Generate churn rate (5-55% range)
    const churnNoise = noise(seed + 300);
    const churnRatePct = 5 + churnNoise * 50;

    // Generate ownership allocation (3 segments summing to 20-30)
    const allocNoise1 = noise(seed + 400);
    const allocNoise2 = noise(seed + 500);
    const allocNoise3 = noise(seed + 600);
    const allocTotal = 20 + Math.round(allocNoise1 * 10); // 20-30 total
    const red = Math.round(allocTotal * allocNoise1 * 0.4); // red: 0-40% of total
    const blue = Math.round(allocTotal * allocNoise2 * 0.3); // blue: 0-30% of total
    const green = allocTotal - red - blue; // green: remainder
    const ownershipAllocation: [number, number, number] = [
      Math.max(1, red),
      Math.max(1, blue),
      Math.max(1, green),
    ];

    // Generate engineering chaos (4 segments summing to 15-25)
    const chaosNoise1 = noise(seed + 700);
    const chaosNoise2 = noise(seed + 800);
    const chaosNoise3 = noise(seed + 900);
    const chaosNoise4 = noise(seed + 1000);
    const chaosTotal = 15 + Math.round(chaosNoise1 * 10); // 15-25 total
    const chaosRed = Math.round(chaosTotal * chaosNoise1 * 0.35);
    const chaosOrange = Math.round(chaosTotal * chaosNoise2 * 0.25);
    const chaosBlue = Math.round(chaosTotal * chaosNoise3 * 0.25);
    const chaosGreen = chaosTotal - chaosRed - chaosOrange - chaosBlue;
    const engineeringChaos: [number, number, number, number] = [
      Math.max(1, chaosRed),
      Math.max(1, chaosOrange),
      Math.max(1, chaosBlue),
      Math.max(1, chaosGreen),
    ];

    // Calculate scores for filter sorting
    // Outlier score: high if KP/ownership ratio is far from 1000:1 (typical ratio)
    const expectedOwnership = totalKarmaPoints / 1000; // Expected ownership for KP level
    const outlierScore = Math.abs(ownershipPct - expectedOwnership);

    // Skilled AI score: high KP + low churn = skilled AI user
    const skilledAIScore = (medianWeeklyKp / 3000) * 10 + ((60 - churnRatePct) / 60) * 10;

    // Unskilled score: high churn relative to KP = unskilled AI user
    const unskilledScore = (churnRatePct / 60) * 10 + ((3000 - medianWeeklyKp) / 3000) * 5;

    // Legacy score: low KP + low churn = traditional dev
    const legacyScore = ((3000 - medianWeeklyKp) / 3000) * 10 + ((60 - churnRatePct) / 60) * 5;

    return {
      memberName: member.memberName,
      teamId,
      totalKarmaPoints,
      ownershipPct,
      medianWeeklyKp,
      churnRatePct,
      ownershipAllocation,
      engineeringChaos,
      outlierScore,
      skilledAIScore,
      unskilledScore,
      legacyScore,
    };
  });
}

/** Transform member design data to OwnershipScatter DeveloperPoint[] format. */
export function transformToOwnershipScatterData(members: MemberDesignRow[]): DeveloperPoint[] {
  // Calculate mean and standard deviation for outlier detection
  const kpValues = members.map((m) => m.totalKarmaPoints);
  const ownValues = members.map((m) => m.ownershipPct);
  const meanKp = kpValues.reduce((sum, v) => sum + v, 0) / kpValues.length;
  const meanOwn = ownValues.reduce((sum, v) => sum + v, 0) / ownValues.length;

  const stdKp = Math.sqrt(
    kpValues.reduce((sum, v) => sum + Math.pow(v - meanKp, 2), 0) / kpValues.length
  );
  const stdOwn = Math.sqrt(
    ownValues.reduce((sum, v) => sum + Math.pow(v - meanOwn, 2), 0) / ownValues.length
  );

  return members.map((member) => {
    // Determine if outlier (>1 standard deviation from mean in either dimension)
    const kpZScore = Math.abs((member.totalKarmaPoints - meanKp) / stdKp);
    const ownZScore = Math.abs((member.ownershipPct - meanOwn) / stdOwn);
    const inNormalRange = kpZScore <= 1 && ownZScore <= 1;

    // Determine outlier type based on ownership
    let outlierType: "high" | "low" | null = null;
    if (!inNormalRange) {
      outlierType = member.ownershipPct > meanOwn ? "high" : "low";
    }

    return {
      name: member.memberName,
      team: member.teamId,
      totalKarmaPoints: member.totalKarmaPoints,
      ownershipPct: member.ownershipPct,
      inNormalRange,
      outlierType,
    };
  });
}

/** Transform member design data to ChaosMatrix ChaosPoint[] format. */
export function transformToChaosMatrixData(
  members: MemberDesignRow[],
  range?: "1m" | "3m" | "1y" | "max"
): ChaosPoint[] {
  // Time range affects how much variance/drift we show from base values
  // More recent time ranges (1m) show current snapshot, older ranges show more historical variance
  const timeVarianceFactor = range === "1m" ? 0.1 : range === "3m" ? 0.2 : range === "1y" ? 0.3 : 0.4;
  const rangeSeed = range === "1m" ? 0 : range === "3m" ? 1000 : range === "1y" ? 2000 : 3000;

  return members.map((member, index) => {
    // Spread points across all four quadrants for visual variety (deterministic).
    const baseKp = member.medianWeeklyKp;
    const baseChurn = member.churnRatePct;
    const quadrant = index % 4;
    const kpSpread = (index % 3) * 450 + 300; // 300, 750, 1200
    const churnSpread = (index % 3) * 1.8 + 1.2; // 1.2, 3.0, 4.8

    const kpShift = quadrant < 2 ? -kpSpread : kpSpread;
    const churnShift = quadrant % 2 === 0 ? -churnSpread : churnSpread;

    // Add temporal variation based on time range (simulating historical position)
    const seed = index * 1000 + rangeSeed;
    const noise1 = Math.sin(seed * 9999) * 10000;
    const noise2 = Math.sin((seed + 500) * 9999) * 10000;
    const noiseVal1 = noise1 - Math.floor(noise1);
    const noiseVal2 = noise2 - Math.floor(noise2);

    const kpDrift = (noiseVal1 - 0.5) * 600 * timeVarianceFactor;
    const churnDrift = (noiseVal2 - 0.5) * 3 * timeVarianceFactor;

    return {
      name: member.memberName,
      team: member.memberName, // Use member name as "team" so each member is a distinct group
      medianWeeklyKp: Math.max(0, baseKp + kpShift + kpDrift),
      churnRatePct: Math.min(14, Math.max(0, baseChurn + churnShift + churnDrift)),
    };
  });
}
