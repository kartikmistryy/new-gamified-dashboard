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
 *
 * Architecture:
 * This file serves as the main entry point (barrel export) for the carousel
 * type system. The implementation is split across focused modules:
 *
 * - contributorCarouselTypes.ts - Core data types and state machine
 * - contributorCarouselConfig.ts - Configuration interfaces and defaults
 * - contributorCarouselProps.ts - Component props and hook result types
 * - contributorCarouselUtils.ts - Utility functions and type guards
 *
 * This modular structure keeps each file under 200 lines while maintaining
 * a single import point for consumers.
 */

// ============================================================================
// Core Types and State Machine
// ============================================================================

export type {
  ContributorBase,
  ContributorWithMetrics,
  CarouselDirection,
  CarouselState,
  NavigationAction,
  CarouselNavigationState,
  NavigationCallback,
  MetricFormatter,
  CarouselSlideIdentifier,
} from "./contributorCarouselTypes";

// ============================================================================
// Configuration Types
// ============================================================================

export type {
  AutoPlayConfig,
  AnimationConfig,
  NavigationUIConfig,
  KeyboardConfig,
  AccessibilityConfig,
  ContributorCarouselConfig,
} from "./contributorCarouselConfig";

export {
  DEFAULT_KEYBOARD_CONFIG,
  DEFAULT_CAROUSEL_CONFIG,
  DEFAULT_METRIC_FORMATTERS,
} from "./contributorCarouselConfig";

// ============================================================================
// Component Props and Hook Result Types
// ============================================================================

export type {
  UseCarouselNavigationResult,
  ContributorPerformanceCarouselProps,
  ContributorCarouselHeaderProps,
  ContributorCarouselNavigationProps,
  ContributorPerformanceChartAdapterProps,
  ContributorCarouselSlideProps,
} from "./contributorCarouselProps";

// ============================================================================
// Utility Functions and Type Guards
// ============================================================================

export {
  // Type guards
  hasPerformanceData,
  isCarouselReady,
  isCarouselError,
  isCarouselEmpty,
  isCarouselLoading,
  // Slide identifiers
  createSlideIdentifier,
  slideIdentifierToKey,
  // Index manipulation
  clampIndex,
  getNextIndex,
  getPreviousIndex,
  // Configuration
  mergeCarouselConfig,
} from "./contributorCarouselUtils";
