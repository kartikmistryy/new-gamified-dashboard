/** Modules Table Utilities */

import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

/** Get risk badge styling based on SPOF score range */
export function getRiskBadgeStyle(scoreRange: "high" | "medium" | "low") {
  switch (scoreRange) {
    case "high":
      return { text: "High Risk", color: DASHBOARD_COLORS.danger };
    case "medium":
      return { text: "Medium Risk", color: DASHBOARD_COLORS.warning };
    case "low":
      return { text: "Low Risk", color: DASHBOARD_COLORS.excellent };
  }
}

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
