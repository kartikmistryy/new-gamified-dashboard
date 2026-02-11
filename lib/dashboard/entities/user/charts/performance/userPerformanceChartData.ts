/** User Performance Chart Data - types, constants, and re-exports */

import type { ChartEvent, ChartAnnotation } from "@/lib/dashboard/entities/team/types";

export type UserPerformanceComparisonDataPoint = {
  date: string;
  cumulative: number;
  add: number;
  selfDelete: number;
};

export type UserPerformanceDataPoint = {
  date: string;
  week: string;
  value: number;
};

/** User-specific events (e.g., PTO, training, milestones) */
export const USER_PERFORMANCE_EVENTS: ChartEvent[] = [
  { date: "2024-02-12", label: "Training Week", type: "milestone" },
  { date: "2024-05-20", label: "PTO", type: "holiday" },
  { date: "2024-08-05", label: "Conference", type: "milestone" },
  { date: "2024-11-25", label: "Thanksgiving", type: "holiday" },
  { date: "2024-12-23", label: "Winter Break", type: "holiday" },
];

/** User performance milestones/annotations */
export const USER_PERFORMANCE_ANNOTATIONS: ChartAnnotation[] = [
  { date: "2024-03-11", label: "Major Release", value: 82 },
  { date: "2024-06-17", label: "Project Lead", value: 75 },
  { date: "2024-09-23", label: "Mentorship", value: 68 },
];

/** Performance zones for user dashboard (matching org dashboard thresholds) */
export const USER_PERFORMANCE_ZONES = {
  excellent: { min: 70, max: 100, color: "rgba(85, 182, 133, 0.5)", label: "Above P70 (Excellent)" },
  aboveAvg: { min: 60, max: 70, color: "rgba(85, 182, 133, 0.3)", label: "P60-P70 (Above Avg)" },
  belowAvg: { min: 30, max: 40, color: "rgba(202, 58, 49, 0.25)", label: "P30-P40 (Below Avg)" },
  concerning: { min: 0, max: 30, color: "rgba(202, 58, 49, 0.4)", label: "Below P30 (Concerning)" },
} as const;

/** Baseline reference lines for user performance */
export const USER_PERFORMANCE_BASELINES = {
  p60: { value: 60, color: "#2E7D32", label: "Rolling Avg P60 (baseline)" },
  p40: { value: 40, color: "#E65100", label: "Rolling Avg P40 (baseline)" },
} as const;

// Re-export data generators from separate modules
export {
  generateUserPerformanceData,
  generateUserCumulativePerformanceData,
} from "../../mocks/userPerformanceDataGenerators";

export {
  generateTeamMedianData,
  generateOrgMedianData,
  generateTeamMedianCumulativeData,
  generateOrgMedianCumulativeData,
} from "../../mocks/medianDataGenerators";
