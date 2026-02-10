/**
 * ContributorCarouselNavigation Component
 *
 * Provides navigation controls for the contributor carousel including:
 * - Previous/Next arrow buttons with disabled states
 * - Dot indicators with smart truncation for many slides
 * - Slide counter (e.g., "1 / 10")
 * - Full accessibility support
 *
 * Type Safety:
 * - Type-safe callbacks with proper React event typing
 * - Configuration validated through type system
 * - Safe index handling with boundary checks
 * - Accessible button states
 */

"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ContributorCarouselNavigationProps } from "@/lib/dashboard/contributorCarousel";

/**
 * ContributorCarouselNavigation Component
 *
 * Renders navigation controls for carousel with arrows, dots, and counter.
 * Automatically adapts based on configuration and current state.
 *
 * Features:
 * - Smart dot truncation: shows first/last + surrounding current
 * - Disabled state handling for boundary conditions
 * - Keyboard accessible (managed by parent via tabIndex)
 * - ARIA labels for screen readers
 *
 * @example
 * ```tsx
 * <ContributorCarouselNavigation
 *   currentIndex={2}
 *   totalCount={10}
 *   canGoPrevious={true}
 *   canGoNext={true}
 *   onPrevious={() => console.log('previous')}
 *   onNext={() => console.log('next')}
 *   onGoToIndex={(index) => console.log('goto', index)}
 *   config={{ showArrows: true, showDots: true, showCounter: true }}
 * />
 * ```
 */
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
  /**
   * Calculate which dots to show with smart truncation
   *
   * Algorithm:
   * - If total dots <= maxDotsVisible, show all
   * - Otherwise, show: first + (dots around current) + last
   * - Use ellipsis indicators for hidden ranges
   *
   * Example for maxDotsVisible=7, current=5, total=20:
   * [0] ... [4][5][6] ... [19]
   */
  const visibleDotIndices = calculateVisibleDots(
    currentIndex,
    totalCount,
    config.maxDotsVisible
  );

  return (
    <nav
      className={`flex items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-200 ${className}`}
      aria-label="Carousel navigation"
    >
      {/* Left Side: Previous Button + Counter */}
      <div className="flex items-center gap-4">
        {/* Previous Button */}
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

        {/* Counter */}
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

      {/* Center: Dot Indicators */}
      {config.showDots && (
        <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
          {visibleDotIndices.map((item, idx) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-gray-400 text-sm px-1"
                  aria-hidden="true"
                >
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
                  ${
                    isActive
                      ? "w-8 h-2 bg-blue-600 rounded-full"
                      : "size-2 bg-gray-300 hover:bg-gray-400 rounded-full"
                  }
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

      {/* Right Side: Next Button */}
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate which dot indices to show with smart truncation
 *
 * Returns an array that includes numbers (indices to show) and "ellipsis" strings
 * for gaps in the sequence.
 *
 * @param currentIndex - Currently active index
 * @param totalCount - Total number of slides
 * @param maxVisible - Maximum dots to show before truncating
 * @returns Array of indices and ellipsis markers
 *
 * @example
 * ```ts
 * calculateVisibleDots(0, 5, 10) // [0, 1, 2, 3, 4] - show all
 * calculateVisibleDots(5, 20, 7) // [0, "ellipsis", 4, 5, 6, "ellipsis", 19]
 * calculateVisibleDots(0, 20, 7) // [0, 1, 2, "ellipsis", 19]
 * ```
 */
function calculateVisibleDots(
  currentIndex: number,
  totalCount: number,
  maxVisible: number
): Array<number | "ellipsis"> {
  // If total count is small, show all dots
  if (totalCount <= maxVisible) {
    return Array.from({ length: totalCount }, (_, i) => i);
  }

  // For large counts, show: first + surrounding current + last
  const result: Array<number | "ellipsis"> = [];

  // Always show first dot
  result.push(0);

  // Calculate range around current index
  // Reserve 3 slots: first, last, and at least one ellipsis
  const slotsForMiddle = Math.max(1, maxVisible - 3);
  const halfSlots = Math.floor(slotsForMiddle / 2);

  let startRange = Math.max(1, currentIndex - halfSlots);
  let endRange = Math.min(totalCount - 2, currentIndex + halfSlots);

  // Adjust range to use all available slots
  const rangeSize = endRange - startRange + 1;
  if (rangeSize < slotsForMiddle) {
    if (startRange === 1) {
      // Near start, extend end
      endRange = Math.min(totalCount - 2, startRange + slotsForMiddle - 1);
    } else if (endRange === totalCount - 2) {
      // Near end, extend start
      startRange = Math.max(1, endRange - slotsForMiddle + 1);
    }
  }

  // Add ellipsis before range if needed
  if (startRange > 1) {
    result.push("ellipsis");
  }

  // Add range around current
  for (let i = startRange; i <= endRange; i++) {
    result.push(i);
  }

  // Add ellipsis after range if needed
  if (endRange < totalCount - 2) {
    result.push("ellipsis");
  }

  // Always show last dot (if not already included)
  if (totalCount > 1) {
    result.push(totalCount - 1);
  }

  return result;
}
