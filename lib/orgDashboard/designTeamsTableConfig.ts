/** Design Teams Table Configuration */

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { DesignTeamRow, DesignTableFilter } from "./types";
import { hexToRgba } from "./tableUtils";
import { CATEGORY_COLORS } from "./chaosMatrixData";

export const OWNERSHIP_SEGMENTS = [
  { label: "High Ownership", style: { backgroundColor: hexToRgba("#22c55e", 0.25), color: "#22c55e" } },
  { label: "Balanced Ownership", style: { backgroundColor: hexToRgba("#4285f4", 0.25), color: "#4285f4" } },
  { label: "Low Ownership", style: { backgroundColor: hexToRgba("#ef4444", 0.25), color: "#ef4444" } },
];

export const CHAOS_SEGMENTS = [
  {
    label: "Skilled AI User",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Skilled AI User"], 0.25),
      color: CATEGORY_COLORS["Skilled AI User"],
    },
  },
  {
    label: "Traditional Developer",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Traditional Developer"], 0.25),
      color: CATEGORY_COLORS["Traditional Developer"],
    },
  },
  {
    label: "Unskilled AI User",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Unskilled AI User"], 0.25),
      color: CATEGORY_COLORS["Unskilled AI User"],
    },
  },
  {
    label: "Low-Skill Developer",
    style: {
      backgroundColor: hexToRgba(CATEGORY_COLORS["Low-Skill Developer"], 0.25),
      color: CATEGORY_COLORS["Low-Skill Developer"],
    },
  },
];

export const DESIGN_FILTER_TABS: { key: DesignTableFilter; label: string }[] = [
  { key: "mostOutliers", label: "Most Outliers" },
  { key: "mostSkilledAIBuilders", label: "Most Skilled AI Builders" },
  { key: "mostUnskilledVibeCoders", label: "Most Unskilled Vibe Coders" },
  { key: "mostLegacyDevs", label: "Most Legacy Devs" },
];

/** Get trend icon for count value compared to average */
export function getTrendIconForCount(counts: number[], index: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  const average = counts.length ? total / counts.length : 0;
  const value = counts[index] ?? 0;
  if (value > average) return TrendingUp;
  if (value < average) return TrendingDown;
  return ArrowRight;
}

/** Sort design teams based on filter criteria */
export function designSortFunction(rows: DesignTeamRow[], currentFilter: DesignTableFilter): DesignTeamRow[] {
  const copy = [...rows];
  if (currentFilter === "mostOutliers") return copy.sort((a, b) => b.outlierScore - a.outlierScore);
  if (currentFilter === "mostSkilledAIBuilders") return copy.sort((a, b) => b.skilledAIScore - a.skilledAIScore);
  if (currentFilter === "mostUnskilledVibeCoders") return copy.sort((a, b) => b.unskilledScore - a.unskilledScore);
  if (currentFilter === "mostLegacyDevs") return copy.sort((a, b) => b.legacyScore - a.legacyScore);
  return copy;
}
