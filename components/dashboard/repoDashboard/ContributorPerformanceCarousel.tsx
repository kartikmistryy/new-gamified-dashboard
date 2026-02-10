/** ContributorPerformanceCarousel - Main carousel container with navigation and accessibility */

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
import { CarouselLoadingState, CarouselErrorState, CarouselEmptyState } from "./CarouselStates";

export function ContributorPerformanceCarousel<T extends { id: string; name: string }>({
  contributors,
  initialIndex = 0,
  config = {},
  isLoading = false,
  error,
  emptyMessage = "No contributors available",
  className = "",
}: ContributorPerformanceCarouselProps<T>) {
  const mergedConfig = useMemo(() => mergeCarouselConfig(config), [config]);

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

  const handleMouseEnter = () => {
    if (mergedConfig.autoPlay.pauseOnHover) {
      pauseAutoPlay();
    }
  };

  const handleMouseLeave = () => {
    if (mergedConfig.autoPlay.pauseOnHover) {
      resumeAutoPlay();
    }
  };

  const handleFocus = () => {
    if (mergedConfig.autoPlay.pauseOnFocus) {
      pauseAutoPlay();
    }
  };

  const handleBlur = () => {
    if (mergedConfig.autoPlay.pauseOnFocus) {
      resumeAutoPlay();
    }
  };

  if (isLoading || isCarouselLoading(state)) {
    return <CarouselLoadingState className={className} />;
  }

  if (error || isCarouselError(state)) {
    const errorObj = error || (isCarouselError(state) ? state.error : new Error("Unknown error"));
    return <CarouselErrorState error={errorObj} className={className} />;
  }

  if (isCarouselEmpty(state)) {
    return <CarouselEmptyState message={emptyMessage} detailMessage={state.message} className={className} />;
  }

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
