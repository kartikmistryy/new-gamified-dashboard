/**
 * Core Type Definitions for Contributor Carousel
 *
 * Fundamental data types for contributors, carousel state machine,
 * navigation types, and helper types.
 */

import type { NormalizedPerformanceDataPoint } from "@/lib/dashboard/shared/performanceChart/types";

// ============================================================================
// Core Contributor Types
// ============================================================================

/** Base contributor shape that all contributors must extend */
export interface ContributorBase {
  /** Unique identifier for the contributor */
  id: string;
  /** Display name */
  name: string;
  /** Optional avatar URL or seed for avatar generation */
  avatar?: string;
}

/** Contributor with performance metrics for carousel display */
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

// ============================================================================
// Carousel State Machine
// ============================================================================

/** Animation direction: 'left' (next), 'right' (prev), 'none' (no animation) */
export type CarouselDirection = "left" | "right" | "none";

/** Discriminated union for carousel state machine (loading|error|empty|ready) */
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

// ============================================================================
// Navigation Types
// ============================================================================

/** Navigation action types for state transitions */
export type NavigationAction =
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GOTO"; index: number }
  | { type: "FIRST" }
  | { type: "LAST" }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "PAUSE_AUTOPLAY" }
  | { type: "RESUME_AUTOPLAY" };

/** Navigation state tracking position and boundaries */
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

/** Callback for navigation events (fromIndex, toIndex, direction) */
export type NavigationCallback = (
  fromIndex: number,
  toIndex: number,
  direction: CarouselDirection
) => void;

// ============================================================================
// Helper Types
// ============================================================================

/** Formats numeric metric value into display string */
export type MetricFormatter = (value: number) => string;

/** Carousel slide identifier combining contributor ID and index */
export interface CarouselSlideIdentifier {
  /** Contributor ID */
  contributorId: string;
  /** Slide index */
  index: number;
}
