import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Get the trend icon based on trend direction.
 * Used across performance and design tables.
 */
export function getTrendIcon(trend: "up" | "down" | "flat" | string): LucideIcon {
  if (trend === "up") return TrendingUp;
  if (trend === "down") return TrendingDown;
  return ArrowRight;
}

/**
 * Get trend icon based on whether a value is above, below, or at the average.
 * Used in segment bar visualizations.
 */
export function getTrendIconForCount(counts: number[], index: number): LucideIcon {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

/**
 * Format a change value with sign and label.
 * Used in performance tables.
 */
export function formatChangeLabel(change: number, unit: string = "pts"): string {
  if (change > 0) return `${change} ${unit}`;
  if (change < 0) return `${Math.abs(change)} ${unit}`;
  return `0 ${unit}`;
}

/**
 * Get color for a change value (positive = green, negative = red, zero = gray).
 */
export function getChangeColor(change: number): string {
  if (change > 0) return "#22c55e"; // green
  if (change < 0) return "#ef4444"; // red
  return "#737373"; // gray
}
