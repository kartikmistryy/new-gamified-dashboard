/** Data Generator Utilities - shared helpers for mock data generation */

/** Creates a deterministic seeded random number generator */
export function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  let state = Math.abs(hash);
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format week label from date */
export function formatWeekLabel(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
}

/** Calculate seasonal multiplier based on month */
export function getSeasonalMultiplier(month: number, holidayFactor: number = 0.6, summerFactor: number = 0.8): number {
  const isHolidaySeason = month === 11 || month === 0;
  const isSummerSlump = month === 6 || month === 7;
  return isHolidaySeason ? holidayFactor : isSummerSlump ? summerFactor : 1.0;
}

/** Calculate sprint phase multiplier (4-week sprint cycle) */
export function getSprintMultiplier(weekIndex: number, intensity: 'high' | 'medium' | 'low' = 'high'): number {
  const sprintPhase = weekIndex % 4;

  if (intensity === 'high') {
    return sprintPhase === 0 ? 1.3 : sprintPhase === 1 ? 1.5 : sprintPhase === 2 ? 0.9 : 0.7;
  } else if (intensity === 'medium') {
    return sprintPhase === 0 ? 1.1 : sprintPhase === 1 ? 1.2 : sprintPhase === 2 ? 0.95 : 0.85;
  } else {
    return sprintPhase === 1 ? 1.08 : sprintPhase === 3 ? 0.92 : 1.0;
  }
}

/** Check if current week is a refactoring week (every ~8 weeks) */
export function isRefactoringWeek(weekIndex: number): boolean {
  return weekIndex % 8 === 5;
}

/** Generate deterministic noise from seed and index */
export function generateNoise(seed: number, index: number): number {
  return (Math.sin(seed * index * 0.1) + 1) * 10 - 10;
}
