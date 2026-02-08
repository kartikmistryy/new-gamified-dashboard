/**
 * User SPOF Dashboard Helpers
 *
 * Utility functions for user SPOF (Single Point of Failure) analysis including:
 * - Module filtering logic
 * - SPOF score calculations
 * - Risk categorization
 */

import type { ModuleSPOFData, SPOFScoreRange } from "./types";

/**
 * Module filter types for the SPOF modules table.
 */
export type ModuleFilter =
  | "all"
  | "highRisk"
  | "mediumRisk"
  | "lowRisk"
  | "primaryOwner"
  | "backupOwner";

/**
 * Filter tab configurations for module table.
 */
export const MODULE_FILTER_TABS: { key: ModuleFilter; label: string }[] = [
  { key: "all", label: "All Modules" },
  { key: "highRisk", label: "High Risk" },
  { key: "mediumRisk", label: "Medium Risk" },
  { key: "lowRisk", label: "Low Risk" },
  { key: "primaryOwner", label: "Primary Owner" },
  { key: "backupOwner", label: "Backup Owner" },
];

/**
 * Determines SPOF score range based on score value (0-100).
 *
 * Score ranges:
 * - Low (0-30): Healthy distribution, multiple contributors
 * - Medium (31-70): Moderate risk, some concentration
 * - High (71-100): Critical risk, high ownership concentration
 *
 * @param score - SPOF score from 0 to 100
 * @returns Score range category
 */
export function getScoreRange(score: number): SPOFScoreRange {
  if (score <= 30) return "low";
  if (score <= 70) return "medium";
  return "high";
}

/**
 * Filters modules based on the selected filter type.
 *
 * @param modules - Array of module SPOF data
 * @param filter - Filter type to apply
 * @param currentUserId - ID of the current user viewing the dashboard
 * @returns Filtered array of modules
 */
export function filterModules(
  modules: ModuleSPOFData[],
  filter: ModuleFilter,
  currentUserId?: string
): ModuleSPOFData[] {
  switch (filter) {
    case "highRisk":
      return modules.filter((m) => m.scoreRange === "high");
    case "mediumRisk":
      return modules.filter((m) => m.scoreRange === "medium");
    case "lowRisk":
      return modules.filter((m) => m.scoreRange === "low");
    case "primaryOwner":
      return modules.filter((m) => m.primaryOwner.id === currentUserId);
    case "backupOwner":
      return modules.filter((m) => m.backupOwner.id === currentUserId);
    case "all":
    default:
      return modules;
  }
}

/**
 * Sorts modules by SPOF score in descending order (highest risk first).
 *
 * @param modules - Array of module SPOF data
 * @returns Sorted array of modules
 */
export function sortModulesByRisk(modules: ModuleSPOFData[]): ModuleSPOFData[] {
  return [...modules].sort((a, b) => b.spofScore - a.spofScore);
}

/**
 * Calculates summary statistics for a user's SPOF modules.
 *
 * @param modules - Array of module SPOF data
 * @param userId - Current user ID
 * @returns Object with SPOF summary statistics
 */
export function calculateSpofSummary(modules: ModuleSPOFData[], userId: string) {
  const totalModules = modules.length;
  const highRiskCount = modules.filter((m) => m.scoreRange === "high").length;
  const mediumRiskCount = modules.filter((m) => m.scoreRange === "medium").length;
  const lowRiskCount = modules.filter((m) => m.scoreRange === "low").length;

  const primaryOwnerCount = modules.filter((m) => m.primaryOwner.id === userId).length;
  const backupOwnerCount = modules.filter((m) => m.backupOwner.id === userId).length;

  const avgSpofScore =
    totalModules > 0
      ? Math.round(modules.reduce((sum, m) => sum + m.spofScore, 0) / totalModules)
      : 0;

  return {
    totalModules,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    primaryOwnerCount,
    backupOwnerCount,
    avgSpofScore,
  };
}
