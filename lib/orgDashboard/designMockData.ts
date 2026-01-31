import type { OutlierRow, SummaryCardConfig } from "./types";

/** Mock outlier data for the Org Design "Need attention" cards (upper-left: low KP / high ownership). */
export const UPPER_LEFT_OUTLIERS: OutlierRow[] = [
  { name: "Sky Wilson 105", role: "Backend", kp: "5k", own: "25.0%", delta: "+6.64σ" },
  { name: "Alex Davis 495", role: "Backend", kp: "7k", own: "21.6%", delta: "+5.56σ" },
  { name: "Riley Taylor 550", role: "Backend", kp: "7k", own: "17.7%", delta: "+4.40σ" },
  { name: "Avery Patel 340", role: "Backend", kp: "2k", own: "16.6%", delta: "+4.40σ" },
];

/** Mock outlier data for the Org Design "Need attention" cards (lower-right: high KP / low ownership). */
export const LOWER_RIGHT_OUTLIERS: OutlierRow[] = [
  { name: "Avery Thomas 577", role: "DevOps", kp: "107k", own: "0.7%", delta: "-7.10σ" },
  { name: "Jordan Patel 375", role: "DevOps", kp: "31k", own: "2.4%", delta: "-1.64σ" },
];

/** Mock summary card config for the Org Design page (Star, Key Player, Bottleneck, etc.). */
export const SUMMARY_CARD_CONFIGS: SummaryCardConfig[] = [
  { key: "star", title: "Star", count: 2, pct: 20, bg: "bg-green-100", iconColor: "text-green-600" },
  { key: "key-player", title: "Key Player", count: 2, pct: 20, bg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { key: "bottleneck", title: "Bottleneck", count: 1, pct: 10, bg: "bg-orange-100", iconColor: "text-orange-600" },
  { key: "stable", title: "Stable", count: 3, pct: 30, bg: "bg-blue-100", iconColor: "text-blue-600" },
  { key: "risky", title: "Risky", count: 1, pct: 10, bg: "bg-purple-100", iconColor: "text-purple-600" },
  { key: "time-bomb", title: "Time Bomb", count: 1, pct: 10, bg: "bg-red-100", iconColor: "text-red-600" },
];
