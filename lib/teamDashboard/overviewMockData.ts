import type { MemberPerformanceRow } from "./types";
import { getPerformanceGaugeLabel } from "@/lib/orgDashboard/utils";
import { getPerformanceBarColor } from "@/lib/orgDashboard/tableUtils";

const MEMBER_NAMES = [
  "Alice Chen",
  "Bob Martinez",
  "Carol Johnson",
  "David Kim",
  "Eve Patel",
  "Frank Wilson",
  "Grace Liu",
  "Henry Okafor",
] as const;

/** Simple deterministic noise function based on seed */
function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Reference type distributions for interpolation (copied from orgDashboard/overviewMockData.ts) */
const TYPE_DIST_REF: { value: number; dist: MemberPerformanceRow["typeDistribution"] }[] = [
  { value: 11, dist: { star: 10, timeBomb: 9, keyRole: 8, bottleneck: 2, risky: 0, legacy: 1 } },
  { value: 39, dist: { star: 10, timeBomb: 9, keyRole: 8, bottleneck: 2, risky: 0, legacy: 1 } },
  { value: 50, dist: { star: 9, timeBomb: 9, keyRole: 9, bottleneck: 1, risky: 1, legacy: 1 } },
  { value: 65, dist: { star: 9, timeBomb: 8, keyRole: 9, bottleneck: 1, risky: 1, legacy: 2 } },
  { value: 95, dist: { star: 10, timeBomb: 6, keyRole: 10, bottleneck: 0, risky: 2, legacy: 2 } },
];

/** Get type distribution for a performance value using interpolation */
function getTypeDistributionForPerformance(value: number): MemberPerformanceRow["typeDistribution"] {
  const v = Math.max(0, Math.min(100, value));
  if (v <= TYPE_DIST_REF[0].value) return { ...TYPE_DIST_REF[0].dist };
  if (v >= TYPE_DIST_REF[TYPE_DIST_REF.length - 1].value) return { ...TYPE_DIST_REF[TYPE_DIST_REF.length - 1].dist };
  let i = 0;
  while (i < TYPE_DIST_REF.length - 1 && TYPE_DIST_REF[i + 1].value < v) i++;
  const lo = TYPE_DIST_REF[i];
  const hi = TYPE_DIST_REF[i + 1];
  const t = (v - lo.value) / (hi.value - lo.value);
  const keys = ["star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy"] as const;
  const dist = keys.reduce((acc, key) => {
    acc[key] = Math.round(lerp(lo.dist[key], hi.dist[key], t));
    return acc;
  }, {} as MemberPerformanceRow["typeDistribution"]);
  const sum = keys.reduce((s, k) => s + dist[k], 0);
  if (sum !== 30) dist.star = dist.star + (30 - sum);
  return dist;
}

/** Get trend based on performance value */
function getTrend(value: number): "up" | "down" | "flat" {
  if (value <= 24) return "down";
  if (value >= 45 && value <= 55) return "flat";
  return "up";
}

/** Simple hash function to convert string to number seed */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates member performance rows for a team with realistic distribution.
 * Member values aggregate approximately to teamPerformanceValue (within 10%).
 */
export function getMemberPerformanceRowsForTeam(
  teamPerformanceValue: number,
  teamId: string,
  memberCount: number = 6
): MemberPerformanceRow[] {
  const count = Math.min(memberCount, MEMBER_NAMES.length);
  const seed = hashString(teamId);

  // Generate skewed offsets that sum to 0 (so average equals teamPerformanceValue)
  // Create a realistic long-tail distribution with star performers
  const offsets: number[] = [];

  // For 6 members, create pattern: [-25, -12, -3, 5, 15, 20] (sums to 0)
  // Star performer(s) should be 2-5x the distance from median
  if (count === 6) {
    // Base pattern with deterministic variation using teamId seed
    const variation = (noise(seed) - 0.5) * 10; // ±5 point variation
    offsets.push(
      -25 + variation * 0.5,
      -12 + variation * 0.3,
      -3 + variation * 0.1,
      5 + variation * 0.1,
      15 + variation * 0.3,
      20 + variation * 0.5
    );
  } else {
    // Generate offsets for other counts
    // Create a symmetric spread around 0
    const baseSpread = 40; // Total spread from min to max
    const step = baseSpread / (count - 1);
    for (let i = 0; i < count; i++) {
      const baseOffset = -baseSpread / 2 + step * i;
      // Add some deterministic variation
      const variation = (noise(seed + i) - 0.5) * 8;
      offsets.push(baseOffset + variation);
    }
  }

  // Normalize offsets to sum to exactly 0
  const offsetSum = offsets.reduce((sum, val) => sum + val, 0);
  const correction = offsetSum / count;
  const normalizedOffsets = offsets.map(offset => offset - correction);

  // Create member rows
  const members: MemberPerformanceRow[] = [];
  for (let i = 0; i < count; i++) {
    const offset = normalizedOffsets[i];
    const performanceValue = Math.max(0, Math.min(100, Math.round(teamPerformanceValue + offset)));
    const memberName = MEMBER_NAMES[i];
    const memberAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(memberName)}`;
    const performanceLabel = getPerformanceGaugeLabel(performanceValue);
    const performanceBarColor = getPerformanceBarColor(performanceValue);
    const trend = getTrend(performanceValue);
    const changePts = trend === "up" ? 5 : trend === "down" ? -5 : 0;
    const typeDistribution = getTypeDistributionForPerformance(performanceValue);

    members.push({
      level: "member",
      rank: 0, // Will be set after sorting
      memberName,
      memberAvatar,
      teamId,
      performanceLabel,
      performanceValue,
      trend,
      performanceBarColor,
      changePts,
      typeDistribution,
    });
  }

  // Sort by performanceValue descending and assign ranks
  members.sort((a, b) => b.performanceValue - a.performanceValue);
  members.forEach((member, index) => {
    member.rank = index + 1;
  });

  return members;
}

/**
 * Helper to verify that member averages aggregate approximately to team value.
 * Returns true if average is within 10% of teamValue.
 */
export function verifyAggregation(members: MemberPerformanceRow[], teamValue: number): boolean {
  const avg = members.reduce((sum, m) => sum + m.performanceValue, 0) / members.length;
  return Math.abs(avg - teamValue) <= teamValue * 0.1;
}
