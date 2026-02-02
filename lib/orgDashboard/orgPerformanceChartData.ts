import type { ChartEvent, ChartAnnotation } from "./types";

export type OrgPerformanceDataPoint = {
  date: string;
  week: string;
  value: number;
};

/** US holidays for 2024 */
export const ORG_PERFORMANCE_HOLIDAYS: ChartEvent[] = [
  { date: "2024-01-01", label: "New Year's Day", type: "holiday" },
  { date: "2024-01-15", label: "MLK Day", type: "holiday" },
  { date: "2024-02-19", label: "Presidents' Day", type: "holiday" },
  { date: "2024-05-27", label: "Memorial Day", type: "holiday" },
  { date: "2024-06-19", label: "Juneteenth", type: "holiday" },
  { date: "2024-07-04", label: "Independence Day", type: "holiday" },
  { date: "2024-09-02", label: "Labor Day", type: "holiday" },
  { date: "2024-10-14", label: "Columbus Day", type: "holiday" },
  { date: "2024-11-11", label: "Veterans Day", type: "holiday" },
  { date: "2024-11-28", label: "Thanksgiving", type: "holiday" },
  { date: "2024-12-25", label: "Christmas", type: "holiday" },
];

/** Notable events/annotations on the chart */
export const ORG_PERFORMANCE_ANNOTATIONS: ChartAnnotation[] = [
  { date: "2024-02-05", label: "New VP", value: 71 },
  { date: "2024-07-22", label: "Architect Leave", value: 27 },
  { date: "2024-09-16", label: "Launch Sprint", value: 85 },
  { date: "2024-11-18", label: "Pre-Thxgvg", value: 62 },
  { date: "2024-12-16", label: "Pre-Xmas", value: 73 },
];

/** Generate weekly data points for the org performance chart */
export function generateOrgPerformanceData(): OrgPerformanceDataPoint[] {
  const data: OrgPerformanceDataPoint[] = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-01-06");

  // Weekly values matching the reference chart pattern
  // Index 0 = Jan 1, each index = +1 week
  // Key points:
  // - Index 5 (Feb 5): New VP peak ~71
  // - Index 29 (Jul 22): Architect Leave low ~27
  // - Index 37 (Sep 16): Launch Sprint peak ~85
  // - Index 46 (Nov 18): Pre-Thxgvg ~62
  // - Index 50 (Dec 16): Pre-Xmas ~73
  const values = [
    // Jan 2024 (weeks 0-4)
    36, 55, 45, 55, 50,
    // Feb 2024 (weeks 5-8) - New VP at week 5
    71, 65, 53, 50,
    // Mar 2024 (weeks 9-13)
    51, 49, 50, 48, 50,
    // Apr 2024 (weeks 14-17)
    51, 49, 50, 38,
    // May 2024 (weeks 18-22)
    55, 48, 52, 50, 54,
    // Jun 2024 (weeks 23-26)
    35, 50, 54, 50,
    // Jul 2024 (weeks 27-31) - Architect Leave at week 29
    33, 50, 27, 50, 50,
    // Aug 2024 (weeks 32-35)
    50, 49, 50, 40,
    // Sep 2024 (weeks 36-39) - Launch Sprint at week 37
    40, 85, 79, 52,
    // Oct 2024 (weeks 40-44)
    50, 48, 50, 45, 50,
    // Nov 2024 (weeks 45-48) - Pre-Thxgvg at week 46
    50, 62, 50, 50,
    // Dec 2024 (weeks 49-52) - Pre-Xmas at week 50
    15, 73, 67, 14,
  ];

  const current = new Date(startDate);
  let index = 0;

  while (current <= endDate && index < values.length) {
    const dateStr = current.toISOString().split("T")[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[current.getMonth()];
    const year = current.getFullYear();
    const week = `${month} ${year}`;

    data.push({
      date: dateStr,
      week,
      value: values[index],
    });

    // Move to next week
    current.setDate(current.getDate() + 7);
    index++;
  }

  return data;
}

/** Performance zone thresholds */
export const PERFORMANCE_ZONES = {
  excellent: { min: 70, max: 100, color: "rgba(85, 182, 133, 0.5)", label: "Above P70 (Excellent)" },
  aboveAvg: { min: 60, max: 70, color: "rgba(85, 182, 133, 0.3)", label: "P60-P70 (Above Avg)" },
  belowAvg: { min: 30, max: 40, color: "rgba(202, 58, 49, 0.25)", label: "P30-P40 (Below Avg)" },
  concerning: { min: 0, max: 30, color: "rgba(202, 58, 49, 0.4)", label: "Below P30 (Concerning)" },
} as const;

/** Baseline reference lines */
export const PERFORMANCE_BASELINES = {
  p60: { value: 60, color: "#2E7D32", label: "Rolling Avg P60 (baseline)" },
  p40: { value: 40, color: "#E65100", label: "Rolling Avg P40 (baseline)" },
} as const;
