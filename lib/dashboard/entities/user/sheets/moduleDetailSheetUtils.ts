/** Module Detail Sheet Utilities */

/** Get team load color based on pressure level */
export function getTeamLoadColor(teamLoad?: string): string {
  switch (teamLoad) {
    case "High Pressure":
      return "#DD524C";
    case "Medium Pressure":
      return "#E87B35";
    case "Low Pressure":
      return "#55B685";
    default:
      return "#94A3B8";
  }
}

/** Get team load percentage for progress bar */
export function getTeamLoadPercentage(teamLoad?: string): number {
  switch (teamLoad) {
    case "High Pressure":
      return 80;
    case "Medium Pressure":
      return 50;
    case "Low Pressure":
      return 30;
    default:
      return 0;
  }
}

/** Get SPOF score color for capability highlighting */
export function getSpofScoreColor(score?: number): string {
  if (!score) return "transparent";
  if (score >= 7.0) return "#DD524C";
  if (score >= 5.0) return "#E87B35";
  return "transparent";
}

/** Get contributor color based on rank */
export function getContributorColor(index: number): string {
  if (index === 0) return "#3b82f6";
  if (index === 1) return "#10b981";
  return "#94a3b8";
}
