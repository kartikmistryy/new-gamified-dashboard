import { DASHBOARD_COLORS } from "./colors";

export function getSegmentRoundedClass(index: number, total: number): string {
  if (total <= 1) return "rounded-lg";
  if (index === 0) return "rounded-l-lg";
  if (index === total - 1) return "rounded-r-lg";
  return "";
}

export function getPerformanceBarColor(value: number): string {
  if (value <= 24) return DASHBOARD_COLORS.danger;
  if (value <= 44) return DASHBOARD_COLORS.warning;
  if (value <= 55) return DASHBOARD_COLORS.stable;
  if (value <= 75) return DASHBOARD_COLORS.good;
  return DASHBOARD_COLORS.excellent;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  if (full.length !== 6) return hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
