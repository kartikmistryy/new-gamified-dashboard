/** Carousel Autoplay Management Hook */

import { useRef, useCallback, useEffect } from "react";
import type { CarouselState, AutoPlayConfig } from "./contributorCarousel";
import { isCarouselReady } from "./contributorCarousel";

type UseCarouselAutoPlayParams = {
  state: CarouselState;
  autoPlayConfig: Required<AutoPlayConfig>;
  hasUserInteracted: boolean;
  onNext: () => void;
};

type UseCarouselAutoPlayResult = {
  toggleAutoPlay: () => void;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
  clearAutoPlayTimer: () => void;
};

export function useCarouselAutoPlay({
  state,
  autoPlayConfig,
  hasUserInteracted,
  onNext,
}: UseCarouselAutoPlayParams): UseCarouselAutoPlayResult {
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoPlayPausedRef = useRef(false);
  const onNextRef = useRef(onNext);

  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  const clearAutoPlayTimer = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const startAutoPlayTimer = useCallback(() => {
    if (!autoPlayConfig.enabled || isAutoPlayPausedRef.current) {
      return;
    }

    clearAutoPlayTimer();

    autoPlayTimerRef.current = setTimeout(() => {
      if (isCarouselReady(state) && state.isAutoPlaying) {
        onNextRef.current();
      }
    }, autoPlayConfig.intervalMs);
  }, [autoPlayConfig.enabled, autoPlayConfig.intervalMs, state, clearAutoPlayTimer]);

  const toggleAutoPlay = useCallback(() => {
    if (!isCarouselReady(state)) {
      return null;
    }

    const newAutoPlayState = !state.isAutoPlaying;

    if (newAutoPlayState) {
      isAutoPlayPausedRef.current = false;
      startAutoPlayTimer();
    } else {
      clearAutoPlayTimer();
    }

    return newAutoPlayState;
  }, [state, startAutoPlayTimer, clearAutoPlayTimer]);

  const pauseAutoPlay = useCallback(() => {
    isAutoPlayPausedRef.current = true;
    clearAutoPlayTimer();
  }, [clearAutoPlayTimer]);

  const resumeAutoPlay = useCallback(() => {
    if (!isCarouselReady(state) || !state.isAutoPlaying) {
      return;
    }

    if (hasUserInteracted && autoPlayConfig.pauseOnFocus) {
      return;
    }

    isAutoPlayPausedRef.current = false;
    startAutoPlayTimer();
  }, [state, hasUserInteracted, autoPlayConfig.pauseOnFocus, startAutoPlayTimer]);

  useEffect(() => {
    if (!isCarouselReady(state) || !state.isAutoPlaying) {
      clearAutoPlayTimer();
      return;
    }

    startAutoPlayTimer();

    return () => {
      clearAutoPlayTimer();
    };
  }, [state, startAutoPlayTimer, clearAutoPlayTimer]);

  useEffect(() => {
    return () => {
      clearAutoPlayTimer();
    };
  }, [clearAutoPlayTimer]);

  return {
    toggleAutoPlay,
    pauseAutoPlay,
    resumeAutoPlay,
    clearAutoPlayTimer,
  };
}
