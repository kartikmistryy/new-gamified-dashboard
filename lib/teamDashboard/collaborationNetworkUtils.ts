/** Collaboration Network Data Generation Utilities */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";

export function noise(seed: number): number {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

export function seedFromText(input: string): number {
  return input.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getRangeConfig(timeRange: TimeRangeKey) {
  switch (timeRange) {
    case "1m":
      return { seedOffset: 101, affinityCutoff: 0.58, doaVolatility: 0.18 };
    case "3m":
      return { seedOffset: 211, affinityCutoff: 0.5, doaVolatility: 0.12 };
    case "1y":
      return { seedOffset: 307, affinityCutoff: 0.44, doaVolatility: 0.08 };
    case "max":
    default:
      return { seedOffset: 401, affinityCutoff: 0.4, doaVolatility: 0.04 };
  }
}
