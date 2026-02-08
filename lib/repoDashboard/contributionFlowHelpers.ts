import type { ContributionNode } from "./spofContributionData";

export const CONTRIBUTOR_FALLBACK_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444"];

export function formatModuleLabel(label: string): string {
  return label
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function getModuleColor(node: ContributionNode): string {
  if (node.health === "healthy") return "#10b981";
  if (node.health === "needsAttention") return "#f59e0b";
  return "#ef4444";
}

export function withAlpha(hex: string, alpha: number): string {
  const safe = hex.replace("#", "");
  const full = safe.length === 3
    ? safe.split("").map((char) => `${char}${char}`).join("")
    : safe;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
