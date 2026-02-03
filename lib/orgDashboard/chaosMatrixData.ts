export type ChaosPoint = {
  name: string;
  team: string;
  medianWeeklyKp: number;
  churnRatePct: number;
};

export type ChaosCategory =
  | "Skilled AI User"
  | "Unskilled AI User"
  | "Traditional Developer"
  | "Low-Skill Developer";

export const CATEGORY_COLORS: Record<ChaosCategory, string> = {
  "Skilled AI User": "#10b981",
  "Unskilled AI User": "#f97316",
  "Traditional Developer": "#3b82f6",
  "Low-Skill Developer": "#ef4444",
};

export function categorizeChaos(
  kp: number,
  churn: number,
  kpThresh: number,
  churnThresh: number,
): ChaosCategory {
  const highKp = kp >= kpThresh;
  const highChurn = churn >= churnThresh;
  if (highKp && highChurn) return "Unskilled AI User";
  if (highKp && !highChurn) return "Skilled AI User";
  if (!highKp && highChurn) return "Low-Skill Developer";
  return "Traditional Developer";
}

export function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  return n === 0 ? 0 : n % 2 === 1 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
}

export type ChaosTimeRangeKey = "1m" | "3m" | "1y" | "max";

export function generateSyntheticChaosPoints(
  range: ChaosTimeRangeKey,
  teamNames?: string[],
): ChaosPoint[] {
  const count = range === "1m" ? 60 : range === "3m" ? 120 : range === "1y" ? 180 : 220;
  const points: ChaosPoint[] = [];
  function r(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  for (let i = 0; i < count; i++) {
    const quadrant = i % 4;
    let kp: number, churn: number;
    if (quadrant === 0) {
      kp = 200 + r(i) * 800;
      churn = 4 + r(i + 1) * 10;
    } else if (quadrant === 1) {
      kp = 200 + r(i) * 800;
      churn = 0.5 + r(i + 1) * 1.5;
    } else if (quadrant === 2) {
      kp = 1200 + r(i) * 3800;
      churn = 4 + r(i + 1) * 10;
    } else {
      kp = 1200 + r(i) * 3800;
      churn = 0.5 + r(i + 1) * 1.5;
    }
    const teamIndex = i % 5;
    const teamLabel =
      teamNames && teamNames.length > 0
        ? teamNames[teamIndex % teamNames.length]!
        : `Team ${teamIndex + 1}`;

    points.push({
      name: `Dev ${i + 1}`,
      team: teamLabel,
      medianWeeklyKp: Math.round(kp),
      churnRatePct: Math.round(churn * 10) / 10,
    });
  }
  return points;
}
