import type { MemberPerformanceDataPoint } from "@/lib/teamDashboard/performanceTypes";

export type ContributorCandlestickPoint = {
  date: string;
  cumulative: number;
  add: number;
  selfDelete: number;
};

export type ContributorCandlestickSeries = {
  memberName: string;
  color: string;
  points: ContributorCandlestickPoint[];
  totalCumulative: number;
};

const SERIES_COLORS = ["#5B6CFA", "#E45735", "#4FC08D", "#A855F7", "#F59E0B"];

function noise(seed: number): number {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildSeriesForMember(
  memberName: string,
  data: MemberPerformanceDataPoint[],
  color: string
): ContributorCandlestickSeries {
  const points: ContributorCandlestickPoint[] = [];
  let cumulative = 0;
  const memberSeed = hashString(memberName);

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    const previous = i > 0 ? data[i - 1] : undefined;
    const currentValue = current.memberValues[memberName] ?? 0;
    const previousValue = previous ? (previous.memberValues[memberName] ?? currentValue) : currentValue;
    const delta = currentValue - previousValue;

    const daySeed = hashString(`${memberName}:${current.date}`) + memberSeed;
    const volatility = (noise(daySeed) - 0.5) * 0.24;

    // Scale contribution to represent cumulative diff-delta magnitude in a readable range.
    const activityBase = Math.max(4, currentValue) * 22;
    const add = Math.max(0, activityBase * (0.14 + Math.max(delta, 0) * 0.01 + volatility));
    const selfDelete = Math.max(0, activityBase * (0.05 + Math.max(-delta, 0) * 0.009 - volatility * 0.5));

    cumulative += add - selfDelete;

    points.push({
      date: current.date,
      cumulative,
      add,
      selfDelete,
    });
  }

  return {
    memberName,
    color,
    points,
    totalCumulative: cumulative,
  };
}

export function buildTeamPerformanceComparisonSeries(
  data: MemberPerformanceDataPoint[],
  topN: number = 3
): ContributorCandlestickSeries[] {
  if (data.length === 0) return [];

  const memberNames = Object.keys(data[0].memberValues ?? {});
  const draft = memberNames.map((memberName, index) =>
    buildSeriesForMember(memberName, data, SERIES_COLORS[index % SERIES_COLORS.length])
  );

  return draft
    .sort((a, b) => b.totalCumulative - a.totalCumulative)
    .slice(0, topN)
    .map((series, index) => ({
      ...series,
      color: SERIES_COLORS[index % SERIES_COLORS.length],
    }));
}
