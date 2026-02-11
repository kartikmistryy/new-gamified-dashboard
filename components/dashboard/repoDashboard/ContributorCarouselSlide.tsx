/**
 * ContributorCarouselSlide Component
 *
 * Wrapper component for a single carousel slide with animation support.
 *
 * Features:
 * - Smooth slide transitions using framer-motion
 * - Direction-aware animations (left/right)
 * - Reduced motion support for accessibility
 * - Combines header and chart in a single slide layout
 * - Type-safe animation variants
 *
 * Type Safety:
 * - Generic constraint for contributor type
 * - Type-safe animation direction
 * - Validated animation config
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ContributorCarouselSlideProps } from "@/lib/dashboard/entities/contributor/charts/contributorCarousel/contributorCarousel";
import { ContributorCarouselHeader } from "./ContributorCarouselHeader";
import { ContributorPerformanceChartAdapter } from "./ContributorPerformanceChartAdapter";
import type { ContributorWithMetrics } from "@/lib/dashboard/entities/contributor/charts/contributorCarousel/contributorCarousel";

/**
 * Check if contributor has metrics for header display
 *
 * Type guard to narrow contributor to ContributorWithMetrics.
 * Returns true if contributor has all required metric fields.
 */
function hasMetrics(contributor: unknown): contributor is ContributorWithMetrics {
  return (
    typeof contributor === "object" &&
    contributor !== null &&
    "rank" in contributor &&
    "commits" in contributor &&
    "additions" in contributor &&
    "deletions" in contributor &&
    "score" in contributor
  );
}

/**
 * Create animation variants based on direction and config
 *
 * Returns framer-motion variants for enter/exit animations.
 * Respects reduced motion preferences if configured.
 *
 * @param direction - Animation direction (left/right/none)
 * @param config - Animation configuration
 * @returns Framer Motion variants object
 */
function createSlideVariants(
  direction: ContributorCarouselSlideProps<any>["direction"],
  config: ContributorCarouselSlideProps<any>["animationConfig"]
): Variants {
  // Check if reduced motion is preferred (accessibility)
  const prefersReducedMotion =
    config.respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If reduced motion, use opacity-only transitions
  if (prefersReducedMotion || direction === "none") {
    return {
      enter: {
        opacity: 1,
        transition: {
          duration: config.durationMs / 1000,
          ease: "easeInOut",
        },
      },
      center: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
        transition: {
          duration: config.durationMs / 1000,
          ease: "easeInOut",
        },
      },
    };
  }

  // Full motion: slide in from direction
  const enterX = direction === "left" ? 100 : -100;
  const exitX = direction === "left" ? -100 : 100;

  return {
    enter: {
      x: enterX,
      opacity: 0,
      transition: {
        duration: config.durationMs / 1000,
        ease: "easeInOut",
      },
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: config.durationMs / 1000,
        ease: "easeInOut",
      },
    },
    exit: {
      x: exitX,
      opacity: 0,
      transition: {
        duration: config.durationMs / 1000,
        ease: "easeInOut",
      },
    },
  };
}

/**
 * ContributorCarouselSlide Component
 *
 * Renders a single slide in the carousel with header and chart.
 * Handles animations for slide transitions.
 *
 * @example
 * ```tsx
 * <ContributorCarouselSlide
 *   contributor={contributor}
 *   isActive={currentIndex === slideIndex}
 *   direction="left"
 *   animationConfig={{ durationMs: 300, easing: "ease-in-out" }}
 *   timeRange="3m"
 *   eventStrategy={{ mode: "none" }}
 *   annotationStrategy={{ mode: "none" }}
 * />
 * ```
 */
export function ContributorCarouselSlide<T extends { id: string; name: string }>({
  contributor,
  isActive,
  direction,
  animationConfig,
  timeRange,
  eventStrategy,
  annotationStrategy,
  className = "",
}: ContributorCarouselSlideProps<T>) {
  const variants = createSlideVariants(direction, animationConfig);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <motion.div
          key={contributor.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className={`w-full ${className}`}
        >
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section - Show if contributor has metrics */}
            {hasMetrics(contributor) && <ContributorCarouselHeader contributor={contributor} />}

            {/* Chart Section */}
            <div className="p-6">
              <ContributorPerformanceChartAdapter
                contributor={contributor}
                timeRange={timeRange}
                eventStrategy={eventStrategy}
                annotationStrategy={annotationStrategy}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
