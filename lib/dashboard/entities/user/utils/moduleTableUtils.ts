/** Modules Table Utilities */

import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
import type { ModuleStatus } from "../types";

/** Get status badge styling based on module status (derived from bus factor) */
export function getStatusBadgeStyleFromStatus(status: ModuleStatus) {
  switch (status) {
    case "At Risk":
      return { text: "At Risk", color: DASHBOARD_COLORS.danger };
    case "Needs Attention":
      return { text: "Needs Attention", color: DASHBOARD_COLORS.warning };
    case "Healthy":
      return { text: "Healthy", color: DASHBOARD_COLORS.excellent };
  }
}

/** @deprecated Use getStatusBadgeStyleFromStatus instead */
export function getStatusBadgeStyle(scoreRange: "high" | "medium" | "low") {
  switch (scoreRange) {
    case "high":
      return { text: "At Risk", color: DASHBOARD_COLORS.danger };
    case "medium":
      return { text: "Needs Attention", color: DASHBOARD_COLORS.warning };
    case "low":
      return { text: "Healthy", color: DASHBOARD_COLORS.excellent };
  }
}

/** @deprecated Use getStatusBadgeStyleFromStatus instead */
export const getRiskBadgeStyle = getStatusBadgeStyle;

/** Get ownership color based on module status */
export function getOwnershipColorFromStatus(status: ModuleStatus): string {
  switch (status) {
    case "At Risk":
      return "#DD524C";
    case "Needs Attention":
      return "#E87B35";
    case "Healthy":
      return "#55B685";
  }
}

/** @deprecated Use getOwnershipColorFromStatus instead */
export function getOwnershipColor(scoreRange: "high" | "medium" | "low"): string {
  switch (scoreRange) {
    case "high":
      return "#DD524C";
    case "medium":
      return "#E87B35";
    case "low":
      return "#55B685";
  }
}
