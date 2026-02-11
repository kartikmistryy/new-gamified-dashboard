/**
 * Configuration Types and Defaults for Contributor Carousel
 *
 * Contains all configuration interfaces, default values, and configuration
 * constants for carousel behavior, animation, navigation, and accessibility.
 */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type {
  EventGenerationStrategy,
  AnnotationGenerationStrategy,
} from "@/lib/dashboard/shared/performanceChart/types";
import type { NavigationCallback, MetricFormatter } from "./contributorCarouselTypes";

// ============================================================================
// Carousel Configuration Interfaces
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

// ============================================================================
// Default Configuration Values
// ============================================================================

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
