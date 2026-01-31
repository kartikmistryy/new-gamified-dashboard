export const MARKET_AVERAGE_GAUGE = 80;
export const INDUSTRY_AVERAGE_GAUGE = MARKET_AVERAGE_GAUGE; // Alias for backward compatibility

type ChartDataPoint = { date: string; fearGreed: number; btcPrice: number };
type Waypoint = [number, number, number]; // [dayIndex, fearGreed, btcPrice]

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

/** [dayStart, dayEnd, fgNoiseMultiplier, btcNoiseMultiplier] — use >1 for very deep fluctuations in that period */
type VolatilityZone = [number, number, number, number];

function getVolatilityMultipliers(day: number, zones: VolatilityZone[]): [number, number] {
  let fgMult = 1;
  let btcMult = 1;
  for (const [start, end, fm, bm] of zones) {
    if (day >= start && day <= end) {
      fgMult = Math.max(fgMult, fm);
      btcMult = Math.max(btcMult, bm);
    }
  }
  return [fgMult, btcMult];
}

function generateStockStyleData(
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

/** Same as above but one point every stepDays to reduce clutter for long ranges */
function generateStockStyleDataSampled(
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
    const isFirst = i === 0;
    const isLast = i === lastDay;
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

// 1-month: ~60 points (every ~12 hours) with lots of fluctuation
const MONTH_START = new Date("2024-12-02");
const MONTH_WAYPOINTS: Waypoint[] = [
  [0, 48, 96200],
  [5, 32, 93800],
  [10, 58, 97200],
  [15, 44, 94800],
  [20, 65, 100200],
  [25, 38, 96600],
  [30, 72, 101800],
  [35, 52, 99200],
  [45, 62, 102400],
  [55, 35, 99600],
  [60, 68, 104200],
];
const MONTH_VOLATILITY_ZONES: VolatilityZone[] = [
  [8, 18, 2.5, 2],
  [35, 50, 2.2, 1.8],
];
export const CHART_DATA_1_MONTH = generateStockStyleData(
  MONTH_START,
  61,
  MONTH_WAYPOINTS,
  5,
  1200,
  MONTH_VOLATILITY_ZONES
);

// 1-year: FG start high (90) → dip to ~10 late Mar/Apr → peak ~81 mid-Jul → trough ~6 late Dec → end ~23
//         BTC start ~98K → dip ~80K late Mar/Apr → peak ~120K mid-Aug → ~85K late Dec → end ~90K
const YEAR_START = new Date("2025-01-30");
const YEAR_WAYPOINTS: Waypoint[] = [
  [0, 92, 98000],
  [15, 70, 92000],
  [30, 45, 88000],
  [60, 12, 80700],
  [75, 18, 83000],
  [90, 35, 88000],
  [120, 52, 95000],
  [150, 68, 104000],
  [165, 78, 112000],
  [175, 81, 118000],
  [195, 75, 120000],
  [212, 65, 120800],
  [230, 48, 115000],
  [260, 32, 102000],
  [290, 18, 92000],
  [320, 10, 87000],
  [350, 6, 85000],
  [360, 14, 88000],
  [365, 23, 90000],
];
// 1-year: same fluctuation style as "All" — weekly sampling, moderate noise, no volatility zones
export const CHART_DATA_1_YEAR = generateStockStyleDataSampled(
  YEAR_START,
  366,
  YEAR_WAYPOINTS,
  7,
  4,
  1200
);

// All: 2 years sampled weekly (~105 points) so the chart isn’t cluttered
const ALL_START = new Date("2024-01-01");
const ALL_WAYPOINTS: Waypoint[] = [
  [0, 72, 42800],
  [90, 58, 49200],
  [180, 78, 56400],
  [270, 48, 51800],
  [365, 52, 59800],
  [455, 38, 55200],
  [545, 42, 62800],
  [635, 28, 58200],
  [730, 44, 84900],
];
export const CHART_DATA_ALL = generateStockStyleDataSampled(
  ALL_START,
  731,
  ALL_WAYPOINTS,
  7,
  4,
  1200
);

export const CRYPTO_ROWS = [
  { rank: 1, name: "Bitcoin", symbol: "BTC", price: 82954.09, marketCap: "1.66T", color: "bg-orange-500" },
  { rank: 2, name: "Ethereum", symbol: "ETH", price: 2750.00, marketCap: "338.15B", color: "bg-blue-600" },
  { rank: 3, name: "Solana", symbol: "SOL", price: 115.53, marketCap: "65.41B", color: "bg-purple-500" },
  { rank: 4, name: "ChainLink", symbol: "LINK", price: 10.923, marketCap: "7.73B", color: "bg-blue-400" },
  { rank: 5, name: "Avalanche", symbol: "AVAX", price: 10.969, marketCap: "4.73B", color: "bg-red-500" },
];
