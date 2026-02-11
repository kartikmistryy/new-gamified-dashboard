/** Centralized dashboard color palette (hex). */
export const DASHBOARD_COLORS = {
  // Performance level colors
  danger: "#CA3A31",
  warning: "#E87B35",
  caution: "#E9A23B",
  stable: "#E2B53E",
  good: "#94CA42",
  excellent: "#55B685",

  // Primary UI colors
  blue: "#3D81FF",
  blueChart: "#2563eb",
  blue700: "#1d4ed8",
  blueTailwind: "#3b82f6",
  blue800: "#1e40af",

  // Success/positive colors
  green: "#10b981",
  greenLight: "#22c55e",

  // Alert/negative colors
  red: "#ef4444",

  // Warning/caution colors
  amber: "#f59e0b",

  // Accent colors
  violet: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  purple: "#a855f7",

  // Skillgraph colors
  skillGreen: "#6BC095",
  skillBlue: "#86B1D4",
  skillLavender: "#B6B5D4",
  skillOrange: "#F3BC8F",

  // Neutral/gray colors
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  slate400: "#94a3b8",
  gray500: "#6b7280",
  slate600: "#475569",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  gray950: "#0f172a",

  // Neutral text
  neutral: "#737373",

  // Background colors
  bgLight: "#e8edf5",
  borderLight: "#E5E5E5",

  // Card background colors (light tints)
  bgGreenLight: "#D9F9E6",
  bgRedLight: "#F9E3E2",
  bgOrangeLight: "#FCEED8",
  bgYellowLight: "#FCF3CC",
  bgBlueLight: "#E5ECF6",

  // Additional UI colors
  blueAccent: "#7BA8E6",

  // Chart-specific colors
  chartBackground: "#ffffff",
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
  /** Skillgraph badge colors. */
  skillGreen: "bg-[#6BC095]",
  skillBlue: "bg-[#86B1D4]",
  skillLavender: "bg-[#B6B5D4]",
  skillOrange: "bg-[#F3BC8F]",
  /** Additional bg classes */
  bgLight: "bg-[#e8edf5]",
  borderLight: "border-[#E5E5E5]",
  green: "bg-[#22c55e]",
  red: "bg-[#ef4444]",
} as const;

/** Badge styles that use a translucent fill with matching text color. */
export const DASHBOARD_BADGE_CLASSES = {
  danger: "bg-[rgba(202,58,49,0.25)] text-[#CA3A31]",
  warning: "bg-[rgba(232,123,53,0.25)] text-[#E87B35]",
  caution: "bg-[rgba(233,162,59,0.25)] text-[#E9A23B]",
  stable: "bg-[rgba(226,181,62,0.25)] text-[#E2B53E]",
  good: "bg-[rgba(148,202,66,0.25)] text-[#94CA42]",
  excellent: "bg-[rgba(85,182,133,0.25)] text-[#55B685]",
  blue: "bg-[rgba(61,129,255,0.25)] text-[#3D81FF]",
} as const;

/** Change badge (e.g. performance delta): success and danger. */
export const DASHBOARD_CHANGE_CLASSES = {
  successBg: "bg-[rgba(85,182,133,0.25)]",
  successText: "text-[#55B685]",
  dangerBg: "bg-[rgba(202,58,49,0.25)]",
  dangerText: "text-[#CA3A31]",
  neutralBg: "bg-[rgba(115,115,115,0.2)]",
  neutralText: "text-[#737373]",
} as const;

/** Muted rank text in tables. */
export const DASHBOARD_TEXT_CLASSES = {
  rankMuted: "text-[#737373] font-medium",
} as const;
