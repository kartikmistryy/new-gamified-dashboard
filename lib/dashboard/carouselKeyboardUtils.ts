/** Carousel Keyboard Navigation Utilities */

import type { KeyboardConfig } from "./contributorCarousel";

type KeyboardHandler = () => void;

export type CarouselKeyboardHandlers = {
  next: KeyboardHandler;
  previous: KeyboardHandler;
  goToFirst: KeyboardHandler;
  goToLast: KeyboardHandler;
};

/** Handle keyboard navigation events for carousel */
export function handleCarouselKeyDown(
  event: React.KeyboardEvent,
  keyboardConfig: Required<KeyboardConfig>,
  handlers: CarouselKeyboardHandlers,
  onPause?: () => void
): boolean {
  const key = event.key;
  let handled = false;

  if (keyboardConfig.nextKeys.includes(key)) {
    event.preventDefault();
    handlers.next();
    handled = true;
  } else if (keyboardConfig.previousKeys.includes(key)) {
    event.preventDefault();
    handlers.previous();
    handled = true;
  } else if (keyboardConfig.firstKeys.includes(key)) {
    event.preventDefault();
    handlers.goToFirst();
    handled = true;
  } else if (keyboardConfig.lastKeys.includes(key)) {
    event.preventDefault();
    handlers.goToLast();
    handled = true;
  }

  if (handled && onPause) {
    onPause();
  }

  return handled;
}
