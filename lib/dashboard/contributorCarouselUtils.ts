/**
 * Utility Functions and Type Guards for Contributor Carousel
 */

import type {
  ContributorBase,
  ContributorWithMetrics,
  CarouselState,
  CarouselSlideIdentifier,
  NavigationCallback,
} from "./contributorCarouselTypes";
import type { ContributorCarouselConfig } from "./contributorCarouselConfig";
import { DEFAULT_CAROUSEL_CONFIG } from "./contributorCarouselConfig";

// ============================================================================
// Type Guards
// ============================================================================

/** Type guard to check if contributor has performance data */
export function hasPerformanceData<T extends ContributorBase>(
  contributor: T
): contributor is T & Required<Pick<ContributorWithMetrics, "performanceData">> {
  return (
    "performanceData" in contributor &&
    Array.isArray(contributor.performanceData) &&
    contributor.performanceData.length > 0
  );
}

/** Type guard to check if carousel is in ready state */
export function isCarouselReady(
  state: CarouselState
): state is Extract<CarouselState, { status: "ready" }> {
  return state.status === "ready";
}

/** Type guard to check if carousel is in error state */
export function isCarouselError(
  state: CarouselState
): state is Extract<CarouselState, { status: "error" }> {
  return state.status === "error";
}

/** Type guard to check if carousel is in empty state */
export function isCarouselEmpty(
  state: CarouselState
): state is Extract<CarouselState, { status: "empty" }> {
  return state.status === "empty";
}

/** Type guard to check if carousel is in loading state */
export function isCarouselLoading(
  state: CarouselState
): state is Extract<CarouselState, { status: "loading" }> {
  return state.status === "loading";
}

// ============================================================================
// Slide Identifier Utilities
// ============================================================================

/** Creates a unique slide identifier */
export function createSlideIdentifier<T extends ContributorBase>(
  contributor: T,
  index: number
): CarouselSlideIdentifier {
  return { contributorId: contributor.id, index };
}

/** Converts slide identifier to React key string */
export function slideIdentifierToKey(identifier: CarouselSlideIdentifier): string {
  return `contributor-${identifier.contributorId}-slide-${identifier.index}`;
}

// ============================================================================
// Index Manipulation Utilities
// ============================================================================

/** Clamps index to valid range [0, max) */
export function clampIndex(index: number, max: number): number {
  return Math.max(0, Math.min(index, max - 1));
}

/** Calculates next index with optional looping */
export function getNextIndex(currentIndex: number, totalCount: number, loop: boolean): number {
  if (currentIndex >= totalCount - 1) {
    return loop ? 0 : currentIndex;
  }
  return currentIndex + 1;
}

/** Calculates previous index with optional looping */
export function getPreviousIndex(currentIndex: number, totalCount: number, loop: boolean): number {
  if (currentIndex <= 0) {
    return loop ? totalCount - 1 : currentIndex;
  }
  return currentIndex - 1;
}


// ============================================================================
// Configuration Utilities
// ============================================================================

/** Merges partial config with defaults */
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
