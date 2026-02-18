import type { OutliersTeamRow, OutlierRow, SummaryCardConfig } from "../types";
import { DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

/** Mock outlier data for the Org Outliers "Need attention" cards (upper-left: low KP / high ownership). */
export const UPPER_LEFT_OUTLIERS: OutlierRow[] = [
  { name: "Sky Wilson 105", role: "Backend", kp: "5k", own: "25.0%", delta: "+6.64σ" },
  { name: "Alex Davis 495", role: "Backend", kp: "7k", own: "21.6%", delta: "+5.56σ" },
  { name: "Riley Taylor 550", role: "Backend", kp: "7k", own: "17.7%", delta: "+4.40σ" },
  { name: "Avery Patel 340", role: "Backend", kp: "2k", own: "16.6%", delta: "+4.40σ" },
];

/** Mock outlier data for the Org Outliers "Need attention" cards (lower-right: high KP / low ownership). */
export const LOWER_RIGHT_OUTLIERS: OutlierRow[] = [
  { name: "Avery Thomas 577", role: "DevOps", kp: "107k", own: "0.7%", delta: "-7.10σ" },
  { name: "Jordan Patel 375", role: "DevOps", kp: "31k", own: "2.4%", delta: "-1.64σ" },
];

/** Mock summary card config for the Org Outliers page (Star, Key Player, Bottleneck, etc.). */
export const SUMMARY_CARD_CONFIGS: SummaryCardConfig[] = [
  { key: "star", title: "Star", count: 2, pct: 20, bg: "bg-green-100", iconColor: "text-green-600" },
  { key: "key-player", title: "Key Player", count: 2, pct: 20, bg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { key: "bottleneck", title: "Bottleneck", count: 1, pct: 10, bg: "bg-orange-100", iconColor: "text-orange-600" },
  { key: "stable", title: "Stable", count: 3, pct: 30, bg: "bg-blue-100", iconColor: "text-blue-600" },
  { key: "risky", title: "Risky", count: 1, pct: 10, bg: "bg-purple-100", iconColor: "text-purple-600" },
  { key: "time-bomb", title: "Time Bomb", count: 1, pct: 10, bg: "bg-red-100", iconColor: "text-red-600" },
];

const OUTLIERS_TEAM_NAMES = [
  "Frontend Development",
  "UI/UX Design",
  "AI / ML Development",
  "Mobile App Development",
  "Web Development",
] as const;

const OUTLIERS_TEAM_COLORS = [
  DASHBOARD_BG_CLASSES.danger,
  DASHBOARD_BG_CLASSES.excellent,
  DASHBOARD_BG_CLASSES.blue,
  DASHBOARD_BG_CLASSES.blueLight,
  DASHBOARD_BG_CLASSES.danger,
] as const;

/** Base mock outliers teams: ownership allocation (red, blue, green) and engineering chaos (red, light orange, blue, green). */
const BASE_OUTLIERS_TEAM_ROWS: OutliersTeamRow[] = [
  {
    teamName: OUTLIERS_TEAM_NAMES[0],
    teamColor: OUTLIERS_TEAM_COLORS[0],
    ownershipAllocation: [8, 4, 10],
    engineeringChaos: [9, 7, 4, 3],
    outlierScore: 9,
    skilledAIScore: 7,
    unskilledScore: 3,
    legacyScore: 2,
  },
  {
    teamName: OUTLIERS_TEAM_NAMES[1],
    teamColor: OUTLIERS_TEAM_COLORS[1],
    ownershipAllocation: [5, 5, 14],
    engineeringChaos: [4, 3, 6, 8],
    outlierScore: 6,
    skilledAIScore: 9,
    unskilledScore: 2,
    legacyScore: 3,
  },
  {
    teamName: OUTLIERS_TEAM_NAMES[2],
    teamColor: OUTLIERS_TEAM_COLORS[2],
    ownershipAllocation: [6, 7, 11],
    engineeringChaos: [7, 6, 7, 4],
    outlierScore: 8,
    skilledAIScore: 8,
    unskilledScore: 5,
    legacyScore: 4,
  },
  {
    teamName: OUTLIERS_TEAM_NAMES[3],
    teamColor: OUTLIERS_TEAM_COLORS[3],
    ownershipAllocation: [4, 6, 14],
    engineeringChaos: [3, 4, 5, 7],
    outlierScore: 5,
    skilledAIScore: 6,
    unskilledScore: 4,
    legacyScore: 7,
  },
  {
    teamName: OUTLIERS_TEAM_NAMES[4],
    teamColor: OUTLIERS_TEAM_COLORS[4],
    ownershipAllocation: [7, 5, 10],
    engineeringChaos: [6, 5, 6, 5],
    outlierScore: 7,
    skilledAIScore: 5,
    unskilledScore: 8,
    legacyScore: 6,
  },
];

/** Default rows used where a specific time range is not required. */
export const OUTLIERS_TEAM_ROWS: OutliersTeamRow[] = BASE_OUTLIERS_TEAM_ROWS;

function getRangeFactor(range: TimeRangeKey): number {
  if (range === "1m") return 0.8;
  if (range === "3m") return 1;
  if (range === "1y") return 1.1;
  return 1.2;
}

function clampScore(value: number, factor: number): number {
  const scaled = Math.round(value * factor);
  if (scaled < 1) return 1;
  if (scaled > 10) return 10;
  return scaled;
}

/** Range-aware mock rows so the Teams table can stay in sync with the chaos time filter. */
export function getOutliersTeamRowsForRange(range: TimeRangeKey): OutliersTeamRow[] {
  const factor = getRangeFactor(range);
  return BASE_OUTLIERS_TEAM_ROWS.map((row) => ({
    ...row,
    ownershipAllocation: [
      clampScore(row.ownershipAllocation[0], factor),
      clampScore(row.ownershipAllocation[1], factor),
      clampScore(row.ownershipAllocation[2], factor),
    ],
    engineeringChaos: [
      clampScore(row.engineeringChaos[0], factor),
      clampScore(row.engineeringChaos[1], factor),
      clampScore(row.engineeringChaos[2], factor),
      clampScore(row.engineeringChaos[3], factor),
    ],
    outlierScore: clampScore(row.outlierScore, factor),
    skilledAIScore: clampScore(row.skilledAIScore, factor),
    unskilledScore: clampScore(row.unskilledScore, factor),
    legacyScore: clampScore(row.legacyScore, factor),
  }));
}
