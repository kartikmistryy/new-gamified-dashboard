import type { MemberPerformanceRow } from "./types";
import type { DeveloperPoint } from "@/lib/orgDashboard/ownershipScatterTypes";
import type { ChaosPoint } from "@/lib/orgDashboard/chaosMatrixData";
import { getMemberPerformanceRowsForTeam } from "./overviewMockData";

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
export function transformToChaosMatrixData(members: MemberDesignRow[]): ChaosPoint[] {
  return members.map((member) => ({
    name: member.memberName,
    team: member.memberName, // Use member name as "team" so each member is a distinct group
    medianWeeklyKp: member.medianWeeklyKp,
    churnRatePct: member.churnRatePct,
  }));
}
