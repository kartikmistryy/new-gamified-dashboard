/** Centralized dashboard color palette (hex). */
export const DASHBOARD_COLORS = {
  danger: "#CA3A31",
  warning: "#E87B35",
  caution: "#E9A23B",
  stable: "#E2B53E",
  good: "#94CA42",
  excellent: "#55B685",
  blue: "#3D81FF",
} as const;

/** Tailwind bg classes for segments and bars. */
export const DASHBOARD_BG_CLASSES = {
  danger: "bg-[#CA3A31]",
  warning: "bg-[#E87B35]",
  caution: "bg-[#E9A23B]",
  stable: "bg-[#E2B53E]",
  good: "bg-[#94CA42]",
  excellent: "bg-[#55B685]",
  blue: "bg-[#3D81FF]",
  blueLight: "bg-[#64B5F6]",
  danger60: "bg-[#CA3A31]/60",
  danger90: "bg-[#CA3A31]/90",
  blue60: "bg-[#3D81FF]/60",
  excellent60: "bg-[#55B685]/60",
  excellent90: "bg-[#55B685]/90",
} as const;

/** Change badge (e.g. performance delta): success and danger. */
export const DASHBOARD_CHANGE_CLASSES = {
  successBg: "bg-[#E8F5E9]",
  successText: "text-[#55B685]",
  dangerBg: "bg-[#FFEBEE]",
  dangerText: "text-[#CA3A31]",
  neutralBg: "bg-gray-100",
  neutralText: "text-[#737373]",
} as const;

/** Muted rank text in tables. */
export const DASHBOARD_TEXT_CLASSES = {
  rankMuted: "text-[#737373] font-medium",
} as const;
