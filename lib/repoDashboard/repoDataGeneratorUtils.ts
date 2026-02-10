/** Repo Data Generator Utilities */

/** Simple deterministic noise function based on seed */
export function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Hash function to convert string to number seed */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** Calculate sprint phase multiplier for realistic activity patterns */
export function getSprintMultiplier(weekIndex: number): number {
  const sprintPhase = weekIndex % 4;
  return sprintPhase === 0 ? 1.3 :
         sprintPhase === 1 ? 1.7 :
         sprintPhase === 2 ? 1.0 :
         0.6;
}

/** Calculate seasonal multiplier based on month */
export function getSeasonalMultiplier(month: number): number {
  const isHolidaySeason = month === 11 || month === 0;
  const isSummerSlump = month === 6 || month === 7;
  return isHolidaySeason ? 0.45 : isSummerSlump ? 0.65 : 1.0;
}

/** Check if week is a milestone week */
export function isMilestoneWeek(weekIndex: number): boolean {
  return weekIndex % 7 === 2 || weekIndex % 11 === 4;
}

/** Check if week is a refactoring week */
export function isRefactoringWeek(weekIndex: number): boolean {
  return weekIndex % 8 === 5;
}

/** Generate week labels for time series */
export function generateWeekLabels(weekCount: number): string[] {
  const weeks: string[] = [];
  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = weekCount - 1; i >= 0; i--) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);
    weeks.push(`${monthNames[weekDate.getMonth()]} '${weekDate.getFullYear().toString().slice(2)}`);
  }

  return weeks;
}
