/** Carousel Navigation Hook - manages carousel state, navigation, keyboard handling, and autoplay */

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useCarouselAutoPlay } from "./useCarouselAutoPlay";
import { handleCarouselKeyDown } from "./carouselKeyboardUtils";

export function useCarouselNavigation<T extends ContributorBase>(
  contributors: T[],
  initialIndex: number = 0,
  config: ContributorCarouselConfig = {}
): UseCarouselNavigationResult<T> {
  const mergedConfig = useMemo(() => mergeCarouselConfig(config), [config]);
  const autoPlayConfig = mergedConfig.autoPlay as Required<AutoPlayConfig>;
  const keyboardConfig = mergedConfig.keyboard as Required<KeyboardConfig>;

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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const currentContributor = useMemo<T | undefined>(() => {
    if (!isCarouselReady(state)) return undefined;
    return contributors[state.currentIndex] ?? undefined;
  }, [state, contributors]);

  const canGoNext = useMemo<boolean>(() => {
    if (!isCarouselReady(state)) return false;
    return state.currentIndex < state.totalCount - 1 || autoPlayConfig.loop;
  }, [state, autoPlayConfig.loop]);

  const canGoPrevious = useMemo<boolean>(() => {
    if (!isCarouselReady(state)) return false;
    return state.currentIndex > 0 || autoPlayConfig.loop;
  }, [state, autoPlayConfig.loop]);
  const navigateToIndex = useCallback(
    (newIndex: number, direction: CarouselDirection) => {
      if (!isCarouselReady(state)) return;

      const clampedIndex = clampIndex(newIndex, contributors.length);
      if (clampedIndex === state.currentIndex) return;

      if (mergedConfig.onSlideChange) {
        mergedConfig.onSlideChange(state.currentIndex, clampedIndex, direction);
      }

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
  const next = useCallback(() => {
    if (!isCarouselReady(state) || !canGoNext) return;
    setHasUserInteracted(true);
    const nextIndex = getNextIndex(state.currentIndex, state.totalCount, autoPlayConfig.loop);
    navigateToIndex(nextIndex, "left");
  }, [state, canGoNext, navigateToIndex, autoPlayConfig.loop]);

  const previous = useCallback(() => {
    if (!isCarouselReady(state) || !canGoPrevious) return;
    setHasUserInteracted(true);
    const prevIndex = getPreviousIndex(state.currentIndex, state.totalCount, autoPlayConfig.loop);
    navigateToIndex(prevIndex, "right");
  }, [state, canGoPrevious, navigateToIndex, autoPlayConfig.loop]);
  const goToIndex = useCallback(
    (index: number) => {
      if (!isCarouselReady(state)) return;
      setHasUserInteracted(true);
      const direction: CarouselDirection =
        index > state.currentIndex ? "left" : index < state.currentIndex ? "right" : "none";
      navigateToIndex(index, direction);
    },
    [state, navigateToIndex]
  );

  const goToFirst = useCallback(() => goToIndex(0), [goToIndex]);

  const goToLast = useCallback(() => {
    if (isCarouselReady(state)) goToIndex(state.totalCount - 1);
  }, [state, goToIndex]);

  const {
    toggleAutoPlay: toggleAutoPlayInternal,
    pauseAutoPlay,
    resumeAutoPlay,
    clearAutoPlayTimer,
  } = useCarouselAutoPlay({
    state,
    autoPlayConfig,
    hasUserInteracted,
    onNext: next,
  });

  const toggleAutoPlay = useCallback(() => {
    if (!isCarouselReady(state)) return;
    const newAutoPlayState = toggleAutoPlayInternal();
    if (newAutoPlayState !== null) {
      setState({ ...state, isAutoPlaying: newAutoPlayState });
    }
  }, [state, toggleAutoPlayInternal]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!keyboardConfig.enabled || !isCarouselReady(state)) return;
      handleCarouselKeyDown(
        event,
        keyboardConfig,
        { next, previous, goToFirst, goToLast },
        autoPlayConfig.pauseOnFocus ? pauseAutoPlay : undefined
      );
    },
    [keyboardConfig, state, next, previous, goToFirst, goToLast, autoPlayConfig.pauseOnFocus, pauseAutoPlay]
  );
  useEffect(() => {
    if (contributors.length === 0) {
      setState({ status: "empty", message: "No contributors available" });
      clearAutoPlayTimer();
      return;
    }

    setState((prevState) => {
      if (!isCarouselReady(prevState)) {
        return {
          status: "ready",
          currentIndex: clampIndex(initialIndex, contributors.length),
          totalCount: contributors.length,
          direction: "none",
          isAutoPlaying: autoPlayConfig.enabled,
        };
      }

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
