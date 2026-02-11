/** Event and Annotation Generators for Performance Charts */

import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { NormalizedPerformanceDataPoint } from "./types";

/** Pick a data point at a specific ratio position in the dataset */
function pickDataPointAtRatio(
  data: NormalizedPerformanceDataPoint[],
  ratio: number
): NormalizedPerformanceDataPoint | null {
  if (data.length === 0) return null;
  const index = Math.min(
    data.length - 1,
    Math.max(0, Math.round((data.length - 1) * ratio))
  );
  return data[index] ?? null;
}

/** Find data points with significant value changes (peaks and valleys) */
function findSignificantChangePoints(
  data: NormalizedPerformanceDataPoint[],
  threshold: number = 15
): NormalizedPerformanceDataPoint[] {
  if (data.length < 2) return [];
  const significantPoints: NormalizedPerformanceDataPoint[] = [];
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];

    if (!prev || !curr || !next) continue;

    const changeToPrev = Math.abs(curr.value - prev.value);
    const changeToNext = Math.abs(curr.value - next.value);
    const isPeak = curr.value > prev.value && curr.value > next.value;
    const isValley = curr.value < prev.value && curr.value < next.value;

    if ((isPeak || isValley) && (changeToPrev >= threshold || changeToNext >= threshold)) {
      significantPoints.push(curr);
    }
  }

  return significantPoints;
}

/** Generate events at fixed ratio positions in the dataset */
export function generateRatioBasedEvents(
  data: NormalizedPerformanceDataPoint[],
  config: {
    positions: number[];
    labels: string[];
    eventType?: "holiday" | "milestone";
  }
): ChartEvent[] {
  const { positions, labels, eventType = "milestone" } = config;

  return positions
    .map((ratio, idx) => {
      const point = pickDataPointAtRatio(data, ratio);
      if (!point) return null;

      return {
        date: point.date,
        label: labels[idx] ?? "Event",
        type: eventType,
      } satisfies ChartEvent;
    })
    .filter((event): event is ChartEvent => event !== null);
}

/** Generate events with alternating types (milestone/holiday) */
export function generateAlternatingTypeEvents(
  data: NormalizedPerformanceDataPoint[],
  config: {
    positions: number[];
    labels: string[];
  }
): ChartEvent[] {
  const { positions, labels } = config;

  return positions
    .map((ratio, idx) => {
      const point = pickDataPointAtRatio(data, ratio);
      if (!point) return null;

      return {
        date: point.date,
        label: labels[idx] ?? "Event",
        type: idx % 2 === 0 ? ("milestone" as const) : ("holiday" as const),
      } satisfies ChartEvent;
    })
    .filter((event): event is ChartEvent => event !== null);
}

/** Generate annotations at fixed ratio positions in the dataset */
export function generateRatioBasedAnnotations(
  data: NormalizedPerformanceDataPoint[],
  config: {
    positions: number[];
    labels: string[];
  }
): ChartAnnotation[] {
  const { positions, labels } = config;

  return positions
    .map((ratio, idx) => {
      const point = pickDataPointAtRatio(data, ratio);
      if (!point) return null;

      return {
        date: point.date,
        label: labels[idx] ?? "Note",
        value: point.value,
      } satisfies ChartAnnotation;
    })
    .filter((annotation): annotation is ChartAnnotation => annotation !== null);
}

/** Generate annotations at significant performance change points */
export function generateChangePointAnnotations(
  data: NormalizedPerformanceDataPoint[],
  config: {
    threshold?: number;
    maxAnnotations?: number;
    labelPrefix?: string;
  } = {}
): ChartAnnotation[] {
  const {
    threshold = 15,
    maxAnnotations = 5,
    labelPrefix = "Change Point",
  } = config;

  const significantPoints = findSignificantChangePoints(data, threshold);
  const selected =
    significantPoints.length <= maxAnnotations
      ? significantPoints
      : significantPoints.filter((_, idx) => {
          const step = Math.floor(significantPoints.length / maxAnnotations);
          return idx % step === 0;
        }).slice(0, maxAnnotations);

  return selected.map((point, idx) => ({
    date: point.date,
    label: `${labelPrefix} ${idx + 1}`,
    value: point.value,
  }));
}

/** Team dashboard event generator */
export function generateTeamEvents(
  data: NormalizedPerformanceDataPoint[]
): ChartEvent[] {
  return generateAlternatingTypeEvents(data, {
    positions: [0.18, 0.55, 0.82],
    labels: ["Release", "Incident", "Sprint Planning"],
  });
}

/** Team dashboard annotation generator */
export function generateTeamAnnotations(
  data: NormalizedPerformanceDataPoint[]
): ChartAnnotation[] {
  return generateRatioBasedAnnotations(data, {
    positions: [0.35, 0.72],
    labels: ["Process Upgrade", "Staffing Shift"],
  });
}

/** Repo dashboard event generator */
export function generateRepoEvents(
  data: NormalizedPerformanceDataPoint[]
): ChartEvent[] {
  return generateAlternatingTypeEvents(data, {
    positions: [0.2, 0.5, 0.85],
    labels: ["Deployment", "Bug Fix", "Feature Release"],
  });
}

/** Repo dashboard annotation generator */
export function generateRepoAnnotations(
  data: NormalizedPerformanceDataPoint[]
): ChartAnnotation[] {
  return generateRatioBasedAnnotations(data, {
    positions: [0.4, 0.75],
    labels: ["Architecture Change", "Dependency Update"],
  });
}

/** Generic performance insight annotation generator */
export function generatePerformanceInsightAnnotations(
  data: NormalizedPerformanceDataPoint[]
): ChartAnnotation[] {
  return generateChangePointAnnotations(data, {
    threshold: 15,
    maxAnnotations: 4,
    labelPrefix: "Notable Change",
  });
}
