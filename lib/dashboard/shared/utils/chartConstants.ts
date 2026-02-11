/**
 * Chart dimension constants and configuration values.
 * All dimension values are in pixels unless otherwise noted.
 *
 * Centralizes magic numbers to improve maintainability and make
 * configuration changes easier.
 */

// Performance Chart
export const PERFORMANCE_CHART = {
  MIN_WIDTH: 460,
  MIN_HEIGHT: 140,
  DEFAULT_WIDTH: 720,
  DEFAULT_HEIGHT: 420,
  MARGIN: { top: 20, right: 20, bottom: 30, left: 40 },
  CIRCLE_RADIUS: 4,
  CIRCLE_HOVER_RADIUS: 6,
  STROKE_WIDTH: 2,
  HOVER_STROKE_WIDTH: 3,
} as const;

// Collaboration Network
export const COLLABORATION_NETWORK = {
  /** Radii for shell-based layout (inner to outer shells) */
  SHELL_RADII: [80, 165, 245] as const,
  /** Base link distance for force simulation */
  LINK_DISTANCE: 65,
  /** Number of simulation iterations for layout */
  SIMULATION_ITERATIONS: 300,
  /** Reduced iterations with good initial positioning */
  OPTIMIZED_ITERATIONS: 100,
  /** Force strengths for different forces */
  FORCES: {
    charge: -125,
    collide: 35,
    centerX: 0.37,
    centerY: 0.37,
  },
  /** Node and edge styling */
  NODE_RADIUS: 8,
  NODE_HOVER_RADIUS: 10,
  EDGE_WIDTH: 2,
  EDGE_HOVER_WIDTH: 4,
} as const;

// SPOF Distribution Chart
export const SPOF_CHART = {
  /** Bin count for histogram */
  BIN_COUNT: 20,
  /** Bar opacity */
  BAR_OPACITY: 0.7,
  /** Normal curve stroke width */
  CURVE_STROKE_WIDTH: 2,
} as const;

// Ownership Scatter
export const OWNERSHIP_SCATTER = {
  /** IQR multiplier for outlier detection */
  OUTLIER_THRESHOLD: 1.5,
  /** Target sample size for regression analysis */
  SAMPLE_TARGET: 40,
  /** Point size range (min, max) */
  POINT_SIZE: { min: 4, max: 12 },
  /** Regression line stroke width */
  REGRESSION_LINE_WIDTH: 2,
} as const;

// Skillgraph
export const SKILLGRAPH = {
  /** Progress bar width in pixels */
  PROGRESS_BAR_WIDTH: 140,
  /** Max proficiency level */
  MAX_PROFICIENCY: 5,
  /** Bar height */
  BAR_HEIGHT: 8,
} as const;

// Contribution Flow (Sankey)
export const CONTRIBUTION_FLOW = {
  /** Margins for Sankey diagram */
  MARGIN: { top: 24, right: 220, bottom: 24, left: 220 },
  /** Node width */
  NODE_WIDTH: 20,
  /** Gap between nodes */
  NODE_GAP: 10,
  /** Link opacity */
  LINK_OPACITY: 0.5,
  /** Link hover opacity */
  LINK_HOVER_OPACITY: 0.8,
} as const;

// Gauge (D3Gauge)
export const GAUGE = {
  /** Default size */
  DEFAULT_SIZE: 280,
  /** Arc thickness */
  ARC_THICKNESS: 20,
  /** Inner radius ratio (0-1) */
  INNER_RADIUS_RATIO: 0.6,
  /** Outer radius ratio (0-1) */
  OUTER_RADIUS_RATIO: 0.8,
  /** Needle length ratio (0-1) */
  NEEDLE_LENGTH_RATIO: 0.7,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  /** Trend threshold in points (change below this is considered flat) */
  TREND: 5,
  /** Risk threshold percentile */
  RISK: 75,
  /** Optimal threshold percentile */
  OPTIMAL: 80,
  /** Excellent performance minimum */
  EXCELLENT: 80,
  /** Good performance minimum */
  GOOD: 60,
  /** Fair performance minimum */
  FAIR: 40,
} as const;

// Ownership thresholds
export const OWNERSHIP_THRESHOLDS = {
  /** High ownership percentage */
  HIGH: 60,
  /** Balanced ownership percentage */
  BALANCED: 30,
  /** SPOF risk threshold (% ownership by single person) */
  SPOF_RISK: 70,
} as const;

// Chaos thresholds
export const CHAOS_THRESHOLDS = {
  /** High chaos score */
  HIGH: 60,
  /** Medium chaos score */
  MEDIUM: 30,
  /** Churn rate thresholds */
  CHURN: {
    HIGH: 40,
    MEDIUM: 20,
  },
} as const;

// Animation durations (milliseconds)
export const ANIMATION_DURATIONS = {
  /** Fast transitions (hover states) */
  FAST: 150,
  /** Normal transitions (state changes) */
  NORMAL: 300,
  /** Slow transitions (large changes) */
  SLOW: 500,
  /** Chart data transitions */
  CHART_TRANSITION: 400,
  /** Tooltip delay */
  TOOLTIP_DELAY: 200,
} as const;

// Z-index layers
export const Z_INDEX = {
  /** Base content layer */
  BASE: 0,
  /** Chart elements */
  CHART: 10,
  /** Interactive elements (hover states) */
  INTERACTIVE: 20,
  /** Tooltips */
  TOOLTIP: 100,
  /** Modals and overlays */
  MODAL: 1000,
} as const;

// Table pagination
export const TABLE = {
  /** Default page size */
  DEFAULT_PAGE_SIZE: 10,
  /** Page size options */
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  /** Max visible page buttons */
  MAX_PAGE_BUTTONS: 7,
} as const;

// Data sampling
export const SAMPLING = {
  /** Max data points before sampling */
  MAX_POINTS: 1000,
  /** Target data points after sampling */
  TARGET_POINTS: 200,
  /** Sampling algorithm: 'lttb' (Largest Triangle Three Buckets) */
  ALGORITHM: 'lttb' as const,
} as const;
