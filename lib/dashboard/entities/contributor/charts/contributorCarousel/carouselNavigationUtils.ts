/** Carousel Navigation Utilities */

/**
 * Calculate which dot indices to show with smart truncation.
 * Returns array with numbers (indices) and "ellipsis" strings for gaps.
 */
export function calculateVisibleDots(
  currentIndex: number,
  totalCount: number,
  maxVisible: number
): Array<number | "ellipsis"> {
  if (totalCount <= maxVisible) {
    return Array.from({ length: totalCount }, (_, i) => i);
  }

  const result: Array<number | "ellipsis"> = [];
  result.push(0);

  const slotsForMiddle = Math.max(1, maxVisible - 3);
  const halfSlots = Math.floor(slotsForMiddle / 2);

  let startRange = Math.max(1, currentIndex - halfSlots);
  let endRange = Math.min(totalCount - 2, currentIndex + halfSlots);

  const rangeSize = endRange - startRange + 1;
  if (rangeSize < slotsForMiddle) {
    if (startRange === 1) {
      endRange = Math.min(totalCount - 2, startRange + slotsForMiddle - 1);
    } else if (endRange === totalCount - 2) {
      startRange = Math.max(1, endRange - slotsForMiddle + 1);
    }
  }

  if (startRange > 1) {
    result.push("ellipsis");
  }

  for (let i = startRange; i <= endRange; i++) {
    result.push(i);
  }

  if (endRange < totalCount - 2) {
    result.push("ellipsis");
  }

  if (totalCount > 1) {
    result.push(totalCount - 1);
  }

  return result;
}
