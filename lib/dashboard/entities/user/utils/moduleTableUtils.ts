/** Modules Table Utilities */

import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

/** Get status badge styling based on SPOF score range */
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

/** @deprecated Use getStatusBadgeStyle instead */
export const getRiskBadgeStyle = getStatusBadgeStyle;

/** Get ownership color based on risk level */
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
