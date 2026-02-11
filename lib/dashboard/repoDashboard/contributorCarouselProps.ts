/**
 * Component Props and Hook Result Types for Contributor Carousel
 *
 * Contains all prop interfaces for carousel components and the return type
 * for the useCarouselNavigation hook.
 */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type {
  EventGenerationStrategy,
  AnnotationGenerationStrategy,
} from "@/lib/dashboard/shared/performanceChart/types";
import type {
  ContributorBase,
  CarouselState,
  CarouselDirection,
} from "./contributorCarouselTypes";
import type {
  AnimationConfig,
  NavigationUIConfig,
  AccessibilityConfig,
  ContributorCarouselConfig,
} from "./contributorCarouselConfig";

// ============================================================================
// Hook Result Type
// ============================================================================

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
  contributor: {
    id: string;
    name: string;
    avatar?: string;
    rank: number;
    commits: number;
    additions: number;
    deletions: number;
    score: number;
    trend?: "up" | "down" | "flat";
  };
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
