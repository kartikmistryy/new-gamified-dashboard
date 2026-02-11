/** Collaboration Network Graph - Tooltip Formatters */

import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

/** Format node tooltip HTML */
export function formatNodeTooltip(label: string, doaNormalized: number, degree: number): string {
  return (
    `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${label}</div>` +
    `<div style="color:${DASHBOARD_COLORS.blue700};">Total DOA (normalized): ${doaNormalized.toFixed(2)}</div>` +
    `<div style="color:${DASHBOARD_COLORS.slate600};">Active links: ${degree}</div>`
  );
}

/** Format edge tooltip HTML */
export function formatEdgeTooltip(
  sourceLabel: string,
  targetLabel: string,
  spofScore: number,
  collaborationStrength: number
): string {
  return (
    `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${sourceLabel} ↔ ${targetLabel}</div>` +
    `<div style="color:${DASHBOARD_COLORS.blue700};">SPOF score: ${spofScore.toFixed(2)}</div>` +
    `<div style="color:${DASHBOARD_COLORS.slate600};">Collaboration strength: ${collaborationStrength.toFixed(2)}</div>`
  );
}
