/** Single developer point (KarmaPoints vs Ownership %). */
export type DeveloperPoint = {
  name: string;
  team: string;
  totalKarmaPoints: number;
  ownershipPct: number;
};

export type OwnershipTimeRangeKey = "1m" | "3m" | "1y" | "max";

/** Developer point with regression residual and normal-range flag. */
export type ClassifiedPoint = DeveloperPoint & {
  residual: number;
  inNormalRange: boolean;
};

/** Band boundary point for normal range area. */
export type BandPoint = {
  x: number;
  yLower: number;
  yUpper: number;
};

/** Tooltip position and point. */
export type TooltipState = {
  point: ClassifiedPoint & { cx?: number; cy?: number };
  x: number;
  y: number;
} | null;

/** Trend line in pixel coordinates. */
export type TrendLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
