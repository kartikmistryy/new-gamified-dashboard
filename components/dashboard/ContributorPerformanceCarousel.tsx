/**
 * ContributorPerformanceCarousel Component
 *
 * Main carousel container component that orchestrates all carousel functionality.
 *
 * Features:
 * - Type-safe contributor navigation
 * - Loading, error, and empty states
 * - Keyboard navigation support
 * - Optional autoplay with pause on interaction
 * - Time range filtering
 * - Event/annotation generation strategies
 * - Full accessibility support
 * - Responsive layout
 *
 * Architecture:
 * - Uses useCarouselNavigation hook for state management
 * - Composes Header, Navigation, and Slide sub-components
 * - Maintains type safety through generic constraint
 * - Follows discriminated union pattern for states
 *
 * Type Safety:
 * - Generic constraint ensures contributors have required fields
 * - All state transitions are type-safe
 * - Event handlers use proper React types
 * - Configuration is validated through type system
 */

"use client";

import { useEffect, useMemo } from "react";
import type { ContributorPerformanceCarouselProps } from "@/lib/dashboard/contributorCarousel";
import {
  isCarouselReady,
  isCarouselError,
  isCarouselEmpty,
  isCarouselLoading,
  mergeCarouselConfig,
  createSlideIdentifier,
  slideIdentifierToKey,
} from "@/lib/dashboard/contributorCarousel";
import { useCarouselNavigation } from "@/lib/dashboard/useCarouselNavigation";
import { ContributorCarouselSlide } from "./ContributorCarouselSlide";
import { ContributorCarouselNavigation } from "./ContributorCarouselNavigation";
import { LoaderCircleIcon, AlertCircleIcon } from "lucide-react";

/**
 * ContributorPerformanceCarousel Component
 *
 * A comprehensive carousel system for displaying individual contributor
 * performance charts with navigation, animations, and full accessibility.
 *
 * @template T - Contributor type (must extend ContributorBase)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ContributorPerformanceCarousel
 *   contributors={contributorsList}
 *   config={{
 *     timeRange: "3m",
 *     autoPlay: { enabled: false },
 *     navigationUI: { showArrows: true, showDots: true }
 *   }}
 * />
 *
 * // With loading state
 * <ContributorPerformanceCarousel
 *   contributors={[]}
 *   isLoading={true}
 * />
 *
 * // With error handling
 * <ContributorPerformanceCarousel
 *   contributors={[]}
 *   error={new Error("Failed to load contributors")}
 * />
 * ```
 */
export function ContributorPerformanceCarousel<T extends { id: string; name: string }>({
  contributors,
  initialIndex = 0,
  config = {},
  isLoading = false,
  error,
  emptyMessage = "No contributors available",
  className = "",
}: ContributorPerformanceCarouselProps<T>) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const mergedConfig = useMemo(() => mergeCarouselConfig(config), [config]);

  // ============================================================================
  // Navigation Hook
  // ============================================================================

  const {
    state,
    currentContributor,
    next,
    previous,
    goToIndex,
    canGoNext,
    canGoPrevious,
    handleKeyDown,
    pauseAutoPlay,
    resumeAutoPlay,
  } = useCarouselNavigation(contributors, initialIndex, mergedConfig);

  // ============================================================================
  // Accessibility - Live Region Announcements
  // ============================================================================

  useEffect(() => {
    if (!mergedConfig.accessibility.announceChanges || !isCarouselReady(state)) {
      return;
    }

    // Create screen reader announcement
    const announcement = `Now showing slide ${state.currentIndex + 1} of ${state.totalCount}`;

    // Use ARIA live region for announcements
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only"; // Visually hidden but readable by screen readers
    liveRegion.textContent = announcement;

    document.body.appendChild(liveRegion);

    // Clean up after announcement
    const timeout = setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [state, mergedConfig.accessibility.announceChanges]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Pause autoplay on mouse enter (if configured)
   */
  const handleMouseEnter = () => {
    if (mergedConfig.autoPlay.pauseOnHover) {
      pauseAutoPlay();
    }
  };

  /**
   * Resume autoplay on mouse leave (if configured)
   */
  const handleMouseLeave = () => {
    if (mergedConfig.autoPlay.pauseOnHover) {
      resumeAutoPlay();
    }
  };

  /**
   * Pause autoplay on focus (if configured)
   */
  const handleFocus = () => {
    if (mergedConfig.autoPlay.pauseOnFocus) {
      pauseAutoPlay();
    }
  };

  /**
   * Resume autoplay on blur (if configured)
   */
  const handleBlur = () => {
    if (mergedConfig.autoPlay.pauseOnFocus) {
      resumeAutoPlay();
    }
  };

  // ============================================================================
  // State-Based Rendering
  // ============================================================================

  /**
   * Loading State - Show spinner
   */
  if (isLoading || isCarouselLoading(state)) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
          <LoaderCircleIcon className="size-12 text-blue-500 animate-spin" aria-hidden="true" />
          <p className="text-gray-600 font-medium mt-4">Loading contributors...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State - Show error message
   */
  if (error || isCarouselError(state)) {
    const errorObj = error || (isCarouselError(state) ? state.error : new Error("Unknown error"));

    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-red-200">
          <AlertCircleIcon className="size-12 text-red-500" aria-hidden="true" />
          <p className="text-red-600 font-semibold text-lg mt-4">Failed to load contributors</p>
          <p className="text-gray-600 text-sm mt-2 max-w-md text-center">{errorObj.message}</p>
        </div>
      </div>
    );
  }

  /**
   * Empty State - No contributors available
   */
  if (isCarouselEmpty(state)) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
          <svg
            className="size-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 font-medium text-lg mt-4">{emptyMessage}</p>
          <p className="text-gray-400 text-sm mt-2">
            {state.message || "Add contributors to see their performance"}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Ready State - Render carousel
   */
  if (!isCarouselReady(state) || !currentContributor) {
    // This should never happen due to type guards above, but TypeScript needs this
    return null;
  }

  // ============================================================================
  // Main Carousel Render
  // ============================================================================

  return (
    <div
      className={`w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role={mergedConfig.accessibility.isLandmark ? "region" : undefined}
      aria-label={mergedConfig.accessibility.ariaLabel}
    >
      <div className="flex flex-col gap-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Carousel Slides Container */}
        <div className="relative min-h-[600px]">
          {contributors.map((contributor, index) => {
            const identifier = createSlideIdentifier(contributor, index);
            const key = slideIdentifierToKey(identifier);
            const isActive = index === state.currentIndex;

            return (
              <div
                key={key}
                className={`
                  ${isActive ? "block" : "hidden"}
                  w-full
                `}
              >
                <ContributorCarouselSlide
                  contributor={contributor}
                  isActive={isActive}
                  direction={state.direction}
                  animationConfig={
                    mergedConfig.animation as Required<
                      NonNullable<typeof mergedConfig.animation>
                    >
                  }
                  timeRange={mergedConfig.timeRange}
                  eventStrategy={mergedConfig.eventStrategy}
                  annotationStrategy={mergedConfig.annotationStrategy}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <ContributorCarouselNavigation
          currentIndex={state.currentIndex}
          totalCount={state.totalCount}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={previous}
          onNext={next}
          onGoToIndex={goToIndex}
          config={
            mergedConfig.navigationUI as Required<NonNullable<typeof mergedConfig.navigationUI>>
          }
          accessibility={
            mergedConfig.accessibility as Required<
              NonNullable<typeof mergedConfig.accessibility>
            >
          }
        />
      </div>
    </div>
  );
}
