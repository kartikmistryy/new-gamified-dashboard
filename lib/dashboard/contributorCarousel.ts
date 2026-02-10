/**
 * Contributor Performance Carousel Type System
 *
 * Comprehensive type definitions for a type-safe carousel component system
 * that displays individual contributor performance charts with navigation,
 * transitions, and full accessibility support.
 *
 * Design Patterns:
 * - Discriminated unions for carousel states (loading, error, ready, empty)
 * - Generic constraints for flexible contributor data shapes
 * - Type-safe navigation with boundary checking
 * - Event handler types using React event types
 * - Direction tracking for animation transitions
 * - Builder pattern for configuration
 *
 * Type Safety Goals:
 * - Zero `any` types
 * - Full type inference in consuming code
 * - Exhaustive discriminated union handling
 * - Safe index/boundary handling
 * - Proper React event types
 */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type {
  NormalizedPerformanceDataPoint,
  EventGenerationStrategy,
  AnnotationGenerationStrategy,
} from "@/lib/dashboard/performanceChart/types";

// ============================================================================
// Core Contributor Types
// ============================================================================

/**
 * Base contributor shape that all contributors must extend
 *
 * Generic constraint ensures contributors have required fields for display.
 * Consumer types can extend this with additional domain-specific fields.
 */
export interface ContributorBase {
  /** Unique identifier for the contributor */
  id: string;
  /** Display name */
  name: string;
  /** Optional avatar URL or seed for avatar generation */
  avatar?: string;
}

/**
 * Contributor with performance metrics for carousel display
 *
 * Extends base with metrics shown in the carousel header.
 * These metrics are displayed alongside the performance chart.
 */
export interface ContributorWithMetrics extends ContributorBase {
  /** Rank among all contributors (1 = top performer) */
  rank: number;
  /** Total commits in time period */
  commits: number;
  /** Total lines added */
  additions: number;
  /** Total lines deleted */
  deletions: number;
  /** Calculated performance score (0-100) */
  score: number;
  /** Performance trend indicator */
  trend?: "up" | "down" | "flat";
  /** Optional performance data points for charting */
  performanceData?: NormalizedPerformanceDataPoint[];
}

/**
 * Type guard to check if contributor has performance data
 *
 * Narrows contributor type to include performanceData field.
 * Useful for conditionally rendering charts based on data availability.
 *
 * @param contributor - The contributor to check
 * @returns True if contributor has non-empty performance data
 *
 * @example
 * ```ts
 * if (hasPerformanceData(contributor)) {
 *   // contributor.performanceData is guaranteed to exist and be non-empty
 *   renderChart(contributor.performanceData);
 * }
 * ```
 */
export function hasPerformanceData<T extends ContributorBase>(
  contributor: T
): contributor is T & Required<Pick<ContributorWithMetrics, "performanceData">> {
  return (
    "performanceData" in contributor &&
    Array.isArray(contributor.performanceData) &&
    contributor.performanceData.length > 0
  );
}

// ============================================================================
// Carousel State Machine
// ============================================================================

/**
 * Animation direction for slide transitions
 *
 * Used to determine slide entry/exit animation direction:
 * - 'left': Next slide (move left, previous content exits left)
 * - 'right': Previous slide (move right, previous content exits right)
 * - 'none': No animation (initial render or jump to index)
 */
export type CarouselDirection = "left" | "right" | "none";

/**
 * Discriminated union representing all possible carousel states
 *
 * Type-safe state machine prevents invalid state combinations.
 * Each state includes only relevant data for that state.
 *
 * State transitions:
 * - loading → ready | error | empty
 * - ready → ready (navigation within same state)
 * - error → remains in error (requires reload)
 * - empty → remains empty (requires new data)
 *
 * @example
 * ```ts
 * function renderCarousel(state: CarouselState) {
 *   switch (state.status) {
 *     case 'loading':
 *       return <Spinner />;
 *     case 'error':
 *       return <ErrorMessage error={state.error} />;
 *     case 'empty':
 *       return <EmptyState />;
 *     case 'ready':
 *       return <Carousel index={state.currentIndex} total={state.totalCount} />;
 *   }
 * }
 * ```
 */
export type CarouselState =
  | {
      /** Loading state - data is being fetched or prepared */
      status: "loading";
    }
  | {
      /** Error state - something went wrong during data load or navigation */
      status: "error";
      /** Error object for display or logging */
      error: Error;
    }
  | {
      /** Empty state - no contributors available to display */
      status: "empty";
      /** Optional message explaining why carousel is empty */
      message?: string;
    }
  | {
      /** Ready state - carousel has data and is interactive */
      status: "ready";
      /** Current slide index (0-based) */
      currentIndex: number;
      /** Total number of slides/contributors */
      totalCount: number;
      /** Current animation direction */
      direction: CarouselDirection;
      /** Whether autoplay is currently active */
      isAutoPlaying?: boolean;
    };

/**
 * Type guard to check if carousel is in ready state
 *
 * Narrows CarouselState to ready variant, enabling access to
 * currentIndex and totalCount properties.
 *
 * @param state - The carousel state to check
 * @returns True if state is ready
 */
export function isCarouselReady(
  state: CarouselState
): state is Extract<CarouselState, { status: "ready" }> {
  return state.status === "ready";
}

/**
 * Type guard to check if carousel is in error state
 */
export function isCarouselError(
  state: CarouselState
): state is Extract<CarouselState, { status: "error" }> {
  return state.status === "error";
}

/**
 * Type guard to check if carousel is in empty state
 */
export function isCarouselEmpty(
  state: CarouselState
): state is Extract<CarouselState, { status: "empty" }> {
  return state.status === "empty";
}

/**
 * Type guard to check if carousel is in loading state
 */
export function isCarouselLoading(
  state: CarouselState
): state is Extract<CarouselState, { status: "loading" }> {
  return state.status === "loading";
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Navigation action types for state transitions
 *
 * Internal representation of navigation intents.
 * Used by useCarouselNavigation hook to update state.
 */
export type NavigationAction =
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GOTO"; index: number }
  | { type: "FIRST" }
  | { type: "LAST" }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "PAUSE_AUTOPLAY" }
  | { type: "RESUME_AUTOPLAY" };

/**
 * Navigation state for carousel control
 *
 * Tracks current position and boundaries for safe navigation.
 * Used internally by useCarouselNavigation hook.
 */
export interface CarouselNavigationState {
  /** Current slide index (0-based, guaranteed to be within bounds) */
  currentIndex: number;
  /** Total number of slides (minimum 0) */
  totalCount: number;
  /** Animation direction for transitions */
  direction: CarouselDirection;
  /** Whether carousel is currently animating */
  isAnimating: boolean;
  /** Whether autoplay is enabled */
  isAutoPlaying: boolean;
}

/**
 * Callback type for navigation events
 *
 * Called when user initiates navigation (before state update).
 * Can be used for analytics, logging, or side effects.
 *
 * @param fromIndex - Index being navigated away from
 * @param toIndex - Index being navigated to
 * @param direction - Animation direction
 */
export type NavigationCallback = (
  fromIndex: number,
  toIndex: number,
  direction: CarouselDirection
) => void;

/**
 * Return type for useCarouselNavigation hook
 *
 * Provides all state and functions needed for carousel navigation.
 * All navigation functions are boundary-safe and type-safe.
 *
 * @template T - Contributor type extending ContributorBase
 */
export interface UseCarouselNavigationResult<T extends ContributorBase> {
  /** Current carousel state (loading, error, empty, or ready) */
  state: CarouselState;
  /** Current contributor being displayed (undefined if not ready) */
  currentContributor: T | undefined;
  /** Navigate to next slide (no-op if at end) */
  next: () => void;
  /** Navigate to previous slide (no-op if at start) */
  previous: () => void;
  /** Navigate to specific index (clamped to valid range) */
  goToIndex: (index: number) => void;
  /** Navigate to first slide */
  goToFirst: () => void;
  /** Navigate to last slide */
  goToLast: () => void;
  /** Check if can navigate to next slide */
  canGoNext: boolean;
  /** Check if can navigate to previous slide */
  canGoPrevious: boolean;
  /** Keyboard event handler for arrow key navigation */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Toggle autoplay on/off */
  toggleAutoPlay: () => void;
  /** Pause autoplay (e.g., on hover or interaction) */
  pauseAutoPlay: () => void;
  /** Resume autoplay (e.g., on mouse leave) */
  resumeAutoPlay: () => void;
}

// ============================================================================
// Carousel Configuration
// ============================================================================

/**
 * Configuration for carousel autoplay behavior
 */
export interface AutoPlayConfig {
  /** Whether autoplay is enabled */
  enabled: boolean;
  /** Delay between slides in milliseconds */
  intervalMs: number;
  /** Whether to pause autoplay on hover */
  pauseOnHover: boolean;
  /** Whether to pause autoplay on keyboard focus */
  pauseOnFocus: boolean;
  /** Whether to loop back to first slide after last */
  loop: boolean;
}

/**
 * Configuration for carousel animation behavior
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds */
  durationMs: number;
  /** Animation easing function (CSS easing string) */
  easing: string;
  /** Whether to use reduced motion for accessibility */
  respectReducedMotion: boolean;
}

/**
 * Configuration for carousel navigation UI
 */
export interface NavigationUIConfig {
  /** Show previous/next arrow buttons */
  showArrows: boolean;
  /** Show dot indicators */
  showDots: boolean;
  /** Show slide counter (e.g., "1 / 10") */
  showCounter: boolean;
  /** Maximum dots to show before truncating (e.g., show dots 1-5 + last) */
  maxDotsVisible: number;
  /** Position of navigation controls */
  position: "top" | "bottom" | "sides";
}

/**
 * Configuration for carousel keyboard shortcuts
 */
export interface KeyboardConfig {
  /** Enable keyboard navigation */
  enabled: boolean;
  /** Key codes that trigger next slide */
  nextKeys: string[];
  /** Key codes that trigger previous slide */
  previousKeys: string[];
  /** Key codes that trigger first slide */
  firstKeys: string[];
  /** Key codes that trigger last slide */
  lastKeys: string[];
}

/**
 * Default keyboard configuration
 */
export const DEFAULT_KEYBOARD_CONFIG: KeyboardConfig = {
  enabled: true,
  nextKeys: ["ArrowRight", "ArrowDown"],
  previousKeys: ["ArrowLeft", "ArrowUp"],
  firstKeys: ["Home"],
  lastKeys: ["End"],
} as const;

/**
 * Configuration for carousel accessibility
 */
export interface AccessibilityConfig {
  /** ARIA label for the carousel container */
  ariaLabel: string;
  /** ARIA label for previous button */
  previousButtonLabel: string;
  /** ARIA label for next button */
  nextButtonLabel: string;
  /** Whether carousel is landmark (role="region") */
  isLandmark: boolean;
  /** Announce slide changes to screen readers */
  announceChanges: boolean;
}

/**
 * Main configuration object for the contributor carousel
 *
 * Provides all configuration options for behavior, appearance,
 * and accessibility. All fields have sensible defaults.
 */
export interface ContributorCarouselConfig {
  /** Autoplay configuration */
  autoPlay?: Partial<AutoPlayConfig>;
  /** Animation configuration */
  animation?: Partial<AnimationConfig>;
  /** Navigation UI configuration */
  navigationUI?: Partial<NavigationUIConfig>;
  /** Keyboard navigation configuration */
  keyboard?: Partial<KeyboardConfig>;
  /** Accessibility configuration */
  accessibility?: Partial<AccessibilityConfig>;
  /** Time range for filtering performance data */
  timeRange?: TimeRangeKey;
  /** Event generation strategy for charts */
  eventStrategy?: EventGenerationStrategy;
  /** Annotation generation strategy for charts */
  annotationStrategy?: AnnotationGenerationStrategy;
  /** Callback when slide changes */
  onSlideChange?: NavigationCallback;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CAROUSEL_CONFIG: Required<
  Omit<ContributorCarouselConfig, "onSlideChange" | "className">
> = {
  autoPlay: {
    enabled: false,
    intervalMs: 5000,
    pauseOnHover: true,
    pauseOnFocus: true,
    loop: true,
  },
  animation: {
    durationMs: 300,
    easing: "ease-in-out",
    respectReducedMotion: true,
  },
  navigationUI: {
    showArrows: true,
    showDots: true,
    showCounter: true,
    maxDotsVisible: 10,
    position: "bottom",
  },
  keyboard: DEFAULT_KEYBOARD_CONFIG,
  accessibility: {
    ariaLabel: "Contributor performance carousel",
    previousButtonLabel: "Previous contributor",
    nextButtonLabel: "Next contributor",
    isLandmark: true,
    announceChanges: true,
  },
  timeRange: "max",
  eventStrategy: { mode: "none" },
  annotationStrategy: { mode: "none" },
} as const;

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the main ContributorPerformanceCarousel component
 *
 * @template T - Contributor type extending ContributorBase
 */
export interface ContributorPerformanceCarouselProps<T extends ContributorBase> {
  /** Array of contributors to display in carousel */
  contributors: T[];
  /** Initial slide index (defaults to 0) */
  initialIndex?: number;
  /** Configuration for carousel behavior and appearance */
  config?: ContributorCarouselConfig;
  /** Optional loading state (shows spinner instead of carousel) */
  isLoading?: boolean;
  /** Optional error state (shows error message instead of carousel) */
  error?: Error;
  /** Optional empty state message */
  emptyMessage?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ContributorCarouselHeader component
 *
 * Displays contributor identity and key metrics.
 */
export interface ContributorCarouselHeaderProps {
  /** Contributor to display */
  contributor: ContributorWithMetrics;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ContributorCarouselNavigation component
 *
 * Renders navigation controls (arrows, dots, counter).
 */
export interface ContributorCarouselNavigationProps {
  /** Current slide index (0-based) */
  currentIndex: number;
  /** Total number of slides */
  totalCount: number;
  /** Whether can navigate to previous slide */
  canGoPrevious: boolean;
  /** Whether can navigate to next slide */
  canGoNext: boolean;
  /** Callback to navigate to previous slide */
  onPrevious: () => void;
  /** Callback to navigate to next slide */
  onNext: () => void;
  /** Callback to navigate to specific index */
  onGoToIndex: (index: number) => void;
  /** Navigation UI configuration */
  config: Required<NavigationUIConfig>;
  /** Accessibility configuration */
  accessibility: Required<AccessibilityConfig>;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ContributorPerformanceChartAdapter component
 *
 * Adapts existing PerformanceChart for single contributor display.
 */
export interface ContributorPerformanceChartAdapterProps<T extends ContributorBase> {
  /** Contributor to display chart for */
  contributor: T;
  /** Time range for filtering */
  timeRange: TimeRangeKey;
  /** Event generation strategy */
  eventStrategy: EventGenerationStrategy;
  /** Annotation generation strategy */
  annotationStrategy: AnnotationGenerationStrategy;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ContributorCarouselSlide component
 *
 * Wrapper for a single slide with animation support.
 */
export interface ContributorCarouselSlideProps<T extends ContributorBase> {
  /** Contributor for this slide */
  contributor: T;
  /** Whether this slide is currently active */
  isActive: boolean;
  /** Animation direction for entering/exiting */
  direction: CarouselDirection;
  /** Animation configuration */
  animationConfig: Required<AnimationConfig>;
  /** Time range for chart */
  timeRange: TimeRangeKey;
  /** Event generation strategy */
  eventStrategy: EventGenerationStrategy;
  /** Annotation generation strategy */
  annotationStrategy: AnnotationGenerationStrategy;
  /** Optional CSS class name */
  className?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Metric formatter function type
 *
 * Formats a numeric metric value into a display string.
 *
 * @param value - The numeric value to format
 * @returns Formatted string for display
 *
 * @example
 * ```ts
 * const formatCommits: MetricFormatter = (value) => `${value.toLocaleString()} commits`;
 * ```
 */
export type MetricFormatter = (value: number) => string;

/**
 * Default metric formatters
 */
export const DEFAULT_METRIC_FORMATTERS = {
  rank: (value: number) => `#${value}`,
  commits: (value: number) => value.toLocaleString(),
  additions: (value: number) => `+${value.toLocaleString()}`,
  deletions: (value: number) => `-${value.toLocaleString()}`,
  score: (value: number) => `${Math.round(value)}`,
} as const satisfies Record<string, MetricFormatter>;

/**
 * Carousel slide identifier
 *
 * Combines contributor ID with slide index for unique identification.
 * Used for React keys and animation tracking.
 */
export interface CarouselSlideIdentifier {
  /** Contributor ID */
  contributorId: string;
  /** Slide index */
  index: number;
}

/**
 * Creates a unique slide identifier
 *
 * @param contributor - The contributor
 * @param index - The slide index
 * @returns Unique identifier object
 */
export function createSlideIdentifier<T extends ContributorBase>(
  contributor: T,
  index: number
): CarouselSlideIdentifier {
  return { contributorId: contributor.id, index };
}

/**
 * Converts slide identifier to string key for React
 *
 * @param identifier - The slide identifier
 * @returns String key (e.g., "contributor-123-slide-5")
 */
export function slideIdentifierToKey(identifier: CarouselSlideIdentifier): string {
  return `contributor-${identifier.contributorId}-slide-${identifier.index}`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamps an index to valid range [0, max)
 *
 * Ensures index is always within bounds for safe array access.
 * Prevents out-of-bounds errors during navigation.
 *
 * @param index - The index to clamp
 * @param max - The maximum value (exclusive)
 * @returns Clamped index
 *
 * @example
 * ```ts
 * clampIndex(-1, 10) // Returns 0
 * clampIndex(15, 10) // Returns 9
 * clampIndex(5, 10)  // Returns 5
 * ```
 */
export function clampIndex(index: number, max: number): number {
  return Math.max(0, Math.min(index, max - 1));
}

/**
 * Calculates the next index with optional looping
 *
 * @param currentIndex - Current index
 * @param totalCount - Total number of items
 * @param loop - Whether to loop back to start
 * @returns Next index, or currentIndex if at end and not looping
 */
export function getNextIndex(currentIndex: number, totalCount: number, loop: boolean): number {
  if (currentIndex >= totalCount - 1) {
    return loop ? 0 : currentIndex;
  }
  return currentIndex + 1;
}

/**
 * Calculates the previous index with optional looping
 *
 * @param currentIndex - Current index
 * @param totalCount - Total number of items
 * @param loop - Whether to loop back to end
 * @returns Previous index, or currentIndex if at start and not looping
 */
export function getPreviousIndex(currentIndex: number, totalCount: number, loop: boolean): number {
  if (currentIndex <= 0) {
    return loop ? totalCount - 1 : currentIndex;
  }
  return currentIndex - 1;
}

/**
 * Merges partial config with defaults
 *
 * Deep merges user-provided configuration with default values.
 * Type-safe: return type includes all required fields.
 *
 * @param config - Partial user configuration
 * @returns Complete configuration with all fields
 */
export function mergeCarouselConfig(
  config: ContributorCarouselConfig = {}
): Required<Omit<ContributorCarouselConfig, "onSlideChange" | "className">> & {
  onSlideChange?: NavigationCallback;
  className?: string;
} {
  return {
    autoPlay: { ...DEFAULT_CAROUSEL_CONFIG.autoPlay, ...config.autoPlay },
    animation: { ...DEFAULT_CAROUSEL_CONFIG.animation, ...config.animation },
    navigationUI: { ...DEFAULT_CAROUSEL_CONFIG.navigationUI, ...config.navigationUI },
    keyboard: { ...DEFAULT_CAROUSEL_CONFIG.keyboard, ...config.keyboard },
    accessibility: { ...DEFAULT_CAROUSEL_CONFIG.accessibility, ...config.accessibility },
    timeRange: config.timeRange ?? DEFAULT_CAROUSEL_CONFIG.timeRange,
    eventStrategy: config.eventStrategy ?? DEFAULT_CAROUSEL_CONFIG.eventStrategy,
    annotationStrategy: config.annotationStrategy ?? DEFAULT_CAROUSEL_CONFIG.annotationStrategy,
    onSlideChange: config.onSlideChange,
    className: config.className,
  };
}
