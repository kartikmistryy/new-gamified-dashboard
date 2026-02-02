import { DASHBOARD_BG_CLASSES } from "./colors";

export function getSegmentRoundedClass(index: number, total: number): string {
  if (total <= 1) return "rounded-lg";
  if (index === 0) return "rounded-l-lg";
  if (index === total - 1) return "rounded-r-lg";
  return "";
}

export function getPerformanceBarColor(value: number): string {
  if (value <= 24) return DASHBOARD_BG_CLASSES.danger;
  if (value <= 44) return DASHBOARD_BG_CLASSES.warning;
  if (value <= 55) return DASHBOARD_BG_CLASSES.stable;
  if (value <= 75) return DASHBOARD_BG_CLASSES.good;
  return DASHBOARD_BG_CLASSES.excellent;
}
