/**
 * Shared Mock Data Utilities
 *
 * Common utilities for generating deterministic mock data across all dashboards.
 * These functions ensure consistent, reproducible mock data generation.
 */

/**
 * Simple deterministic noise function based on seed
 * Returns a value between 0 and 1
 */
export function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Simple hash function to convert string to number seed
 * Ensures same string always produces same seed
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Convert text to numeric seed for deterministic randomness
 * Used for consistent mock data generation
 */
export function seedFromText(input: string): number {
  return input.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

/**
 * Clamp a value between min and max bounds
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Get time range configuration for collaboration network generation
 * Different time ranges have different affinity cutoffs and volatility
 */
export function getRangeConfig(timeRange: "1m" | "3m" | "1y" | "max") {
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
