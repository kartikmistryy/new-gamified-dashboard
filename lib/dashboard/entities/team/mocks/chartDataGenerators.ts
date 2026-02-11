/** Chart Data Generation Utilities */

type ChartDataPoint = { date: string; fearGreed: number; btcPrice: number };
type Waypoint = [number, number, number]; // [dayIndex, fearGreed, btcPrice]
type VolatilityZone = [number, number, number, number];

function noise(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateAt(waypoints: Waypoint[], day: number): [number, number] {
  if (day <= waypoints[0][0]) return [waypoints[0][1], waypoints[0][2]];
  if (day >= waypoints[waypoints.length - 1][0])
    return [waypoints[waypoints.length - 1][1], waypoints[waypoints.length - 1][2]];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [d0, fg0, btc0] = waypoints[i];
    const [d1, fg1, btc1] = waypoints[i + 1];
    if (day >= d0 && day <= d1) {
      const t = (day - d0) / (d1 - d0);
      return [lerp(fg0, fg1, t), lerp(btc0, btc1, t)];
    }
  }
  return [50, 95000];
}

function formatChartDate(d: Date, full = false): string {
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  if (full) return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getVolatilityMultipliers(day: number, zones: VolatilityZone[]): [number, number] {
  let fgMult = 1, btcMult = 1;
  for (const [start, end, fm, bm] of zones) {
    if (day >= start && day <= end) {
      fgMult = Math.max(fgMult, fm);
      btcMult = Math.max(btcMult, bm);
    }
  }
  return [fgMult, btcMult];
}

export function generateStockStyleData(
  startDate: Date,
  numDays: number,
  waypoints: Waypoint[],
  fgNoise = 4,
  btcNoise = 800,
  volatilityZones: VolatilityZone[] = []
): ChartDataPoint[] {
  const out: ChartDataPoint[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const [baseFg, baseBtc] = interpolateAt(waypoints, i);
    const [fgMult, btcMult] = getVolatilityMultipliers(i, volatilityZones);
    const fgWiggle = (noise(i * 7) - 0.5) * 2 * fgNoise * fgMult;
    const btcWiggle = (noise(i * 13 + 100) - 0.5) * 2 * btcNoise * btcMult;
    const fearGreed = Math.round(Math.max(0, Math.min(100, baseFg + fgWiggle)));
    const btcPrice = Math.round(baseBtc + btcWiggle);
    out.push({
      date: i === 0 || i === numDays - 1 ? formatChartDate(d, true) : formatChartDate(d),
      fearGreed,
      btcPrice,
    });
  }
  return out;
}

export function generateStockStyleDataSampled(
  startDate: Date,
  totalDays: number,
  waypoints: Waypoint[],
  stepDays: number,
  fgNoise = 4,
  btcNoise = 800
): ChartDataPoint[] {
  const out: ChartDataPoint[] = [];
  const lastDay = Math.max(0, totalDays - 1);
  for (let i = 0; i < totalDays; i += stepDays) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const [baseFg, baseBtc] = interpolateAt(waypoints, i);
    const fgWiggle = (noise(i * 7) - 0.5) * 2 * fgNoise;
    const btcWiggle = (noise(i * 13 + 100) - 0.5) * 2 * btcNoise;
    const fearGreed = Math.round(Math.max(0, Math.min(100, baseFg + fgWiggle)));
    const btcPrice = Math.round(baseBtc + btcWiggle);
    const isFirst = i === 0, isLast = i === lastDay;
    out.push({
      date: isFirst || isLast ? formatChartDate(d, true) : formatChartDate(d),
      fearGreed,
      btcPrice,
    });
  }
  if (lastDay % stepDays !== 0) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + lastDay);
    const [baseFg, baseBtc] = interpolateAt(waypoints, lastDay);
    const fgWiggle = (noise(lastDay * 7) - 0.5) * 2 * fgNoise;
    const btcWiggle = (noise(lastDay * 13 + 100) - 0.5) * 2 * btcNoise;
    out.push({
      date: formatChartDate(d, true),
      fearGreed: Math.round(Math.max(0, Math.min(100, baseFg + fgWiggle))),
      btcPrice: Math.round(baseBtc + btcWiggle),
    });
  }
  return out;
}
