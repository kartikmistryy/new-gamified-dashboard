import type { ContributionNode } from "../mocks/spofContributionData";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

export const CONTRIBUTOR_FALLBACK_COLORS = [
  DASHBOARD_COLORS.blueTailwind,
  DASHBOARD_COLORS.greenLight,
  DASHBOARD_COLORS.amber,
  DASHBOARD_COLORS.purple,
  DASHBOARD_COLORS.cyan,
  DASHBOARD_COLORS.red,
];

export function formatModuleLabel(label: string): string {
  return label
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function getModuleColor(node: ContributionNode): string {
  if (node.health === "healthy") return DASHBOARD_COLORS.green;
  if (node.health === "needsAttention") return DASHBOARD_COLORS.amber;
  return DASHBOARD_COLORS.red;
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
