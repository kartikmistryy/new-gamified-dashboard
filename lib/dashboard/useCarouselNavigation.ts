/**
 * useCarouselNavigation Hook
 *
 * Type-safe custom hook for managing carousel navigation state and behavior.
 *
 * Features:
 * - Boundary-safe navigation (prevents out-of-bounds access)
 * - Direction tracking for animations
 * - Optional autoplay with pause on interaction
 * - Keyboard event handling
 * - Type-safe state management
 * - Cleanup of timers and event listeners
 *
 * Type Safety:
 * - Generic constraint ensures contributors have required fields
 * - Index is always clamped to valid range [0, length-1]
 * - Navigation functions handle edge cases gracefully
 * - Direction is discriminated type ('left' | 'right' | 'none')
 * - Full type inference for return values
 *
 * @module lib/dashboard/useCarouselNavigation
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type {
  ContributorBase,
  CarouselState,
  CarouselDirection,
  UseCarouselNavigationResult,
  ContributorCarouselConfig,
  AutoPlayConfig,
  KeyboardConfig,
} from "./contributorCarousel";
import {
  clampIndex,
  getNextIndex,
  getPreviousIndex,
  mergeCarouselConfig,
  isCarouselReady,
} from "./contributorCarousel";

/**
 * Custom hook for carousel navigation
 *
 * Manages carousel state, navigation functions, keyboard handling, and autoplay.
 * All navigation functions are boundary-safe and maintain consistent state.
 *
 * @template T - Contributor type extending ContributorBase
 * @param contributors - Array of contributors to navigate through
 * @param initialIndex - Starting index (defaults to 0, clamped to valid range)
 * @param config - Optional carousel configuration
 * @returns Navigation state and control functions
 *
 * @example
 * ```tsx
 * function MyCarousel({ contributors }: { contributors: Contributor[] }) {
 *   const {
 *     state,
 *     currentContributor,
 *     next,
 *     previous,
 *     canGoNext,
 *     canGoPrevious,
 *     handleKeyDown
 *   } = useCarouselNavigation(contributors, 0, {
 *     autoPlay: { enabled: true, intervalMs: 5000 }
 *   });
 *
 *   if (!isCarouselReady(state)) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return (
 *     <div onKeyDown={handleKeyDown}>
 *       <ContributorCard contributor={currentContributor} />
 *       <button onClick={previous} disabled={!canGoPrevious}>Previous</button>
 *       <button onClick={next} disabled={!canGoNext}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCarouselNavigation<T extends ContributorBase>(
  contributors: T[],
  initialIndex: number = 0,
  config: ContributorCarouselConfig = {}
): UseCarouselNavigationResult<T> {
  // ============================================================================
  // Configuration
  // ============================================================================

  const mergedConfig = useMemo(() => mergeCarouselConfig(config), [config]);
  const autoPlayConfig = mergedConfig.autoPlay as Required<AutoPlayConfig>;
  const keyboardConfig = mergedConfig.keyboard as Required<KeyboardConfig>;

  // ============================================================================
  // State Management
  // ============================================================================

  // Determine initial carousel state based on contributors
  const initialState = useMemo<CarouselState>(() => {
    if (contributors.length === 0) {
      return { status: "empty", message: "No contributors available" };
    }

    const clampedIndex = clampIndex(initialIndex, contributors.length);
    return {
      status: "ready",
      currentIndex: clampedIndex,
      totalCount: contributors.length,
      direction: "none",
      isAutoPlaying: autoPlayConfig.enabled,
    };
  }, [contributors.length, initialIndex, autoPlayConfig.enabled]);

  const [state, setState] = useState<CarouselState>(initialState);

  // Track if user has interacted (for autoplay pause logic)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Refs for autoplay timer management
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoPlayPausedRef = useRef(false);

  // ============================================================================
  // Derived State
  // ============================================================================

  /**
   * Get current contributor from state
   * Type-safe: returns undefined if not in ready state or index out of bounds
   */
  const currentContributor = useMemo<T | undefined>(() => {
    if (!isCarouselReady(state)) {
      return undefined;
    }
    const contributor = contributors[state.currentIndex];
    return contributor ?? undefined;
  }, [state, contributors]);

  /**
   * Check if can navigate to next slide
   * Returns false if not ready, at end without loop, or animating
   */
  const canGoNext = useMemo<boolean>(() => {
    if (!isCarouselReady(state)) {
      return false;
    }
    // Can go next if not at end, or if looping is enabled
    return state.currentIndex < state.totalCount - 1 || autoPlayConfig.loop;
  }, [state, autoPlayConfig.loop]);

  /**
   * Check if can navigate to previous slide
   * Returns false if not ready, at start without loop, or animating
   */
  const canGoPrevious = useMemo<boolean>(() => {
    if (!isCarouselReady(state)) {
      return false;
    }
    // Can go previous if not at start, or if looping is enabled
    return state.currentIndex > 0 || autoPlayConfig.loop;
  }, [state, autoPlayConfig.loop]);

  // ============================================================================
  // Navigation Functions
  // ============================================================================

  /**
   * Internal function to update carousel state with new index and direction
   * Ensures index is clamped and calls onSlideChange callback
   */
  const navigateToIndex = useCallback(
    (newIndex: number, direction: CarouselDirection) => {
      if (!isCarouselReady(state)) {
        return;
      }

      const clampedIndex = clampIndex(newIndex, contributors.length);

      // Only update if index actually changed
      if (clampedIndex === state.currentIndex) {
        return;
      }

      // Call onSlideChange callback if provided
      if (mergedConfig.onSlideChange) {
        mergedConfig.onSlideChange(state.currentIndex, clampedIndex, direction);
      }

      // Update state
      setState({
        status: "ready",
        currentIndex: clampedIndex,
        totalCount: contributors.length,
        direction,
        isAutoPlaying: state.isAutoPlaying,
      });
    },
    [state, contributors.length, mergedConfig]
  );

  /**
   * Navigate to next slide
   * No-op if at end and not looping
   */
  const next = useCallback(() => {
    if (!isCarouselReady(state) || !canGoNext) {
      return;
    }

    setHasUserInteracted(true);
    const nextIndex = getNextIndex(state.currentIndex, state.totalCount, autoPlayConfig.loop);
    navigateToIndex(nextIndex, "left");
  }, [state, canGoNext, navigateToIndex, autoPlayConfig.loop]);

  /**
   * Navigate to previous slide
   * No-op if at start and not looping
   */
  const previous = useCallback(() => {
    if (!isCarouselReady(state) || !canGoPrevious) {
      return;
    }

    setHasUserInteracted(true);
    const prevIndex = getPreviousIndex(state.currentIndex, state.totalCount, autoPlayConfig.loop);
    navigateToIndex(prevIndex, "right");
  }, [state, canGoPrevious, navigateToIndex, autoPlayConfig.loop]);

  /**
   * Navigate to specific index (clamped to valid range)
   * Direction is 'none' for direct jumps
   */
  const goToIndex = useCallback(
    (index: number) => {
      if (!isCarouselReady(state)) {
        return;
      }

      setHasUserInteracted(true);

      // Determine direction based on index change
      const direction: CarouselDirection =
        index > state.currentIndex ? "left" : index < state.currentIndex ? "right" : "none";

      navigateToIndex(index, direction);
    },
    [state, navigateToIndex]
  );

  /**
   * Navigate to first slide
   */
  const goToFirst = useCallback(() => {
    goToIndex(0);
  }, [goToIndex]);

  /**
   * Navigate to last slide
   */
  const goToLast = useCallback(() => {
    if (isCarouselReady(state)) {
      goToIndex(state.totalCount - 1);
    }
  }, [state, goToIndex]);

  // ============================================================================
  // Autoplay Management
  // ============================================================================

  /**
   * Clear autoplay timer
   */
  const clearAutoPlayTimer = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  /**
   * Start autoplay timer
   */
  const startAutoPlayTimer = useCallback(() => {
    if (!autoPlayConfig.enabled || isAutoPlayPausedRef.current) {
      return;
    }

    clearAutoPlayTimer();

    autoPlayTimerRef.current = setTimeout(() => {
      if (isCarouselReady(state) && state.isAutoPlaying) {
        next();
      }
    }, autoPlayConfig.intervalMs);
  }, [autoPlayConfig.enabled, autoPlayConfig.intervalMs, state, next, clearAutoPlayTimer]);

  /**
   * Toggle autoplay on/off
   */
  const toggleAutoPlay = useCallback(() => {
    if (!isCarouselReady(state)) {
      return;
    }

    const newAutoPlayState = !state.isAutoPlaying;

    setState({
      ...state,
      isAutoPlaying: newAutoPlayState,
    });

    if (newAutoPlayState) {
      isAutoPlayPausedRef.current = false;
      startAutoPlayTimer();
    } else {
      clearAutoPlayTimer();
    }
  }, [state, startAutoPlayTimer, clearAutoPlayTimer]);

  /**
   * Pause autoplay (e.g., on hover or focus)
   * Does not change isAutoPlaying state, just pauses timer
   */
  const pauseAutoPlay = useCallback(() => {
    isAutoPlayPausedRef.current = true;
    clearAutoPlayTimer();
  }, [clearAutoPlayTimer]);

  /**
   * Resume autoplay (e.g., on mouse leave or blur)
   */
  const resumeAutoPlay = useCallback(() => {
    if (!isCarouselReady(state) || !state.isAutoPlaying) {
      return;
    }

    // Don't resume if user has interacted manually
    if (hasUserInteracted && autoPlayConfig.pauseOnFocus) {
      return;
    }

    isAutoPlayPausedRef.current = false;
    startAutoPlayTimer();
  }, [state, hasUserInteracted, autoPlayConfig.pauseOnFocus, startAutoPlayTimer]);

  // ============================================================================
  // Keyboard Handling
  // ============================================================================

  /**
   * Keyboard event handler for arrow key navigation
   * Prevents default browser behavior for arrow keys
   *
   * @param event - React keyboard event
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!keyboardConfig.enabled || !isCarouselReady(state)) {
        return;
      }

      const key = event.key;

      // Check if key matches any navigation shortcuts
      let handled = false;

      if (keyboardConfig.nextKeys.includes(key)) {
        event.preventDefault();
        next();
        handled = true;
      } else if (keyboardConfig.previousKeys.includes(key)) {
        event.preventDefault();
        previous();
        handled = true;
      } else if (keyboardConfig.firstKeys.includes(key)) {
        event.preventDefault();
        goToFirst();
        handled = true;
      } else if (keyboardConfig.lastKeys.includes(key)) {
        event.preventDefault();
        goToLast();
        handled = true;
      }

      // Pause autoplay on keyboard interaction
      if (handled && autoPlayConfig.pauseOnFocus) {
        pauseAutoPlay();
      }
    },
    [
      keyboardConfig,
      state,
      next,
      previous,
      goToFirst,
      goToLast,
      autoPlayConfig.pauseOnFocus,
      pauseAutoPlay,
    ]
  );

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Update state when contributors array changes
   * Clamp current index if it's now out of bounds
   */
  useEffect(() => {
    if (contributors.length === 0) {
      setState({ status: "empty", message: "No contributors available" });
      clearAutoPlayTimer();
      return;
    }

    setState((prevState) => {
      if (!isCarouselReady(prevState)) {
        // Transition from empty/loading/error to ready
        return {
          status: "ready",
          currentIndex: clampIndex(initialIndex, contributors.length),
          totalCount: contributors.length,
          direction: "none",
          isAutoPlaying: autoPlayConfig.enabled,
        };
      }

      // Already ready, just update counts and clamp index
      const newIndex = clampIndex(prevState.currentIndex, contributors.length);
      return {
        status: "ready",
        currentIndex: newIndex,
        totalCount: contributors.length,
        direction: prevState.direction,
        isAutoPlaying: prevState.isAutoPlaying,
      };
    });
  }, [contributors.length, initialIndex, autoPlayConfig.enabled, clearAutoPlayTimer]);

  /**
   * Manage autoplay timer lifecycle
   * Start/stop timer based on autoplay state
   */
  useEffect(() => {
    if (!isCarouselReady(state) || !state.isAutoPlaying) {
      clearAutoPlayTimer();
      return;
    }

    startAutoPlayTimer();

    // Cleanup on unmount or state change
    return () => {
      clearAutoPlayTimer();
    };
  }, [state, startAutoPlayTimer, clearAutoPlayTimer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearAutoPlayTimer();
    };
  }, [clearAutoPlayTimer]);

  // ============================================================================
  // Return Hook Result
  // ============================================================================

  return {
    state,
    currentContributor,
    next,
    previous,
    goToIndex,
    goToFirst,
    goToLast,
    canGoNext,
    canGoPrevious,
    handleKeyDown,
    toggleAutoPlay,
    pauseAutoPlay,
    resumeAutoPlay,
  };
}
