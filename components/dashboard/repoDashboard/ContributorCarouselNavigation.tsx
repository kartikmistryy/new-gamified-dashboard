"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ContributorCarouselNavigationProps } from "@/lib/dashboard/contributorCarousel";
import { calculateVisibleDots } from "@/lib/dashboard/carouselNavigationUtils";

/** Carousel Navigation - arrows, dots, and counter with smart truncation */
export function ContributorCarouselNavigation({
  currentIndex,
  totalCount,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onGoToIndex,
  config,
  accessibility,
  className = "",
}: ContributorCarouselNavigationProps) {
  const visibleDotIndices = calculateVisibleDots(currentIndex, totalCount, config.maxDotsVisible);

  return (
    <nav
      className={`flex items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-200 ${className}`}
      aria-label="Carousel navigation"
    >
      <div className="flex items-center gap-4">
        {config.showArrows && (
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`
              inline-flex items-center justify-center
              size-10 rounded-lg
              transition-colors duration-150
              ${
                canGoPrevious
                  ? "bg-white hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-300"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            aria-label={accessibility.previousButtonLabel}
            type="button"
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </button>
        )}

        {config.showCounter && (
          <div className="text-sm font-medium text-gray-700 min-w-[4rem] text-center">
            <span aria-label={`Slide ${currentIndex + 1} of ${totalCount}`}>
              <span className="text-blue-600 font-semibold">{currentIndex + 1}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-600">{totalCount}</span>
            </span>
          </div>
        )}
      </div>

      {config.showDots && (
        <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
          {visibleDotIndices.map((item, idx) => {
            if (item === "ellipsis") {
              return (
                <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1" aria-hidden="true">
                  ...
                </span>
              );
            }

            const dotIndex = item as number;
            const isActive = dotIndex === currentIndex;

            return (
              <button
                key={dotIndex}
                onClick={() => onGoToIndex(dotIndex)}
                className={`
                  transition-all duration-200
                  ${isActive ? "w-8 h-2 bg-blue-600 rounded-full" : "size-2 bg-gray-300 hover:bg-gray-400 rounded-full"}
                `}
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={isActive ? "true" : undefined}
                role="tab"
                type="button"
              />
            );
          })}
        </div>
      )}

      {config.showArrows && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            inline-flex items-center justify-center
            size-10 rounded-lg
            transition-colors duration-150
            ${
              canGoNext
                ? "bg-white hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-300"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
          aria-label={accessibility.nextButtonLabel}
          type="button"
        >
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
