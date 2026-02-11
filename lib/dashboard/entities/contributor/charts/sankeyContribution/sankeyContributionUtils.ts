/** Sankey Contribution Chart Utilities */

/** Format repo/module labels by removing hyphens and capitalizing */
export function formatTargetLabel(label: string): string {
  return label
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Get color for target nodes based on health status */
export function getTargetNodeColor(health?: "healthy" | "needsAttention" | "critical"): string {
  switch (health) {
    case "healthy":
      return "#10b981";
    case "needsAttention":
      return "#f59e0b";
    case "critical":
      return "#ef4444";
    default:
      return "#64748b";
  }
}

/** Add alpha channel to hex color */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
