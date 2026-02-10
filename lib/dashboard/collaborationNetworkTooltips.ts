/** Collaboration Network Graph - Tooltip Formatters */

/** Format node tooltip HTML */
export function formatNodeTooltip(label: string, doaNormalized: number, degree: number): string {
  return (
    `<div style="font-weight:600; color:#0f172a;">${label}</div>` +
    `<div style="color:#1d4ed8;">Total DOA (normalized): ${doaNormalized.toFixed(2)}</div>` +
    `<div style="color:#475569;">Active links: ${degree}</div>`
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
    `<div style="font-weight:600; color:#0f172a;">${sourceLabel} ↔ ${targetLabel}</div>` +
    `<div style="color:#1d4ed8;">SPOF score: ${spofScore.toFixed(2)}</div>` +
    `<div style="color:#475569;">Collaboration strength: ${collaborationStrength.toFixed(2)}</div>`
  );
}
