"use client";

import * as React from "react";
import {
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Line,
  Cell,
} from "recharts";

type KarmaPoint = {
  karmaPoints: number;
  ownership: number;
  isOutlier: boolean;
};

// Deterministic pseudo-random for stable data per time range
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Config per time range: max karma (x scale), number of points, outlier count
function getConfigForTimeRange(timeRange: string): { maxKarma: number; numNormal: number; numOutliers: number } {
  switch (timeRange) {
    case "1-month":
      return { maxKarma: 80000, numNormal: 35, numOutliers: 3 };
    case "1-year":
      return { maxKarma: 300000, numNormal: 100, numOutliers: 5 };
    case "all":
      return { maxKarma: 300000, numNormal: 150, numOutliers: 6 };
    default:
      return { maxKarma: 300000, numNormal: 100, numOutliers: 5 };
  }
}

// Generate sample data in sync with time range: positive correlation with some outliers
function generateKarmaPointsData(timeRange: string): KarmaPoint[] {
  const { maxKarma, numNormal, numOutliers } = getConfigForTimeRange(timeRange);
  const data: KarmaPoint[] = [];
  const seedBase = timeRange === "1-month" ? 1 : timeRange === "1-year" ? 2 : 3;

  // Normal range points
  for (let i = 0; i < numNormal; i++) {
    const karmaPoints = seededRandom(seedBase * 1000 + i * 7) * maxKarma;
    const baseOwnership = (karmaPoints / maxKarma) * 60;
    const noise = (seededRandom(seedBase * 2000 + i * 11) - 0.5) * 16;
    const ownership = Math.max(0, Math.min(80, baseOwnership + noise));

    const expectedOwnership = (karmaPoints / maxKarma) * 60;
    const deviation = Math.abs(ownership - expectedOwnership);
    const isOutlier =
      deviation > 18 ||
      (karmaPoints < maxKarma * 0.2 && ownership > 20) ||
      (karmaPoints > maxKarma * 0.8 && ownership < 25) ||
      (karmaPoints > maxKarma * 0.9 && ownership > 70);

    if (!isOutlier) {
      data.push({ karmaPoints, ownership, isOutlier: false });
    }
  }

  // Outliers: positions scale with maxKarma
  for (let i = 0; i < numOutliers; i++) {
    const karmaPoints = seededRandom(seedBase * 3000 + i) * maxKarma * 0.9 + maxKarma * 0.05;
    const offTrack = seededRandom(seedBase * 4000 + i);
    const ownership = Math.max(5, Math.min(75, offTrack * 70));
    data.push({ karmaPoints, ownership, isOutlier: true });
  }

  return data;
}

// Trend line and band scale with max karma for current time range
function getTrendLineData(maxKarma: number): Array<{ karmaPoints: number; ownership: number }> {
  return [
    { karmaPoints: 0, ownership: 0 },
    { karmaPoints: maxKarma, ownership: 60 },
  ];
}

function getNormalRangeBandData(maxKarma: number): Array<{ karmaPoints: number; ownershipLower: number; ownershipUpper: number }> {
  const points: Array<{ karmaPoints: number; ownershipLower: number; ownershipUpper: number }> = [];
  const step = Math.max(2000, Math.floor(maxKarma / 60));
  for (let kp = 0; kp <= maxKarma; kp += step) {
    const expected = (kp / maxKarma) * 60;
    const band = 12;
    points.push({
      karmaPoints: kp,
      ownershipLower: Math.max(0, expected - band),
      ownershipUpper: Math.min(80, expected + band),
    });
  }
  return points;
}

type KarmaPointsScatterChartProps = {
  timeRange: string;
};

export function KarmaPointsScatterChart({ timeRange }: KarmaPointsScatterChartProps) {
  const config = React.useMemo(() => getConfigForTimeRange(timeRange), [timeRange]);
  const data = React.useMemo(() => generateKarmaPointsData(timeRange), [timeRange]);
  const trendData = React.useMemo(() => getTrendLineData(config.maxKarma), [config.maxKarma]);
  const normalRangeBand = React.useMemo(() => getNormalRangeBandData(config.maxKarma), [config.maxKarma]);
  
  const normalPoints = React.useMemo(() => data.filter((d) => !d.isOutlier), [data]);
  const outlierPoints = React.useMemo(() => data.filter((d) => d.isOutlier), [data]);

  return (
    <div className="w-full">
      <h3 className="text-3xl font-semibold text-gray-900 mb-4">
        Cumulative KarmaPoints vs Ownership % (Positive Correlation Expected)
      </h3>
      <div className="flex flex-wrap items-start gap-4 pb-10">
        {/* Chart container: max width 600px */}
        <div className="h-[400px] w-full max-w-[800px] shrink-0 bg-gray-100 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{ top: 20, right: 20, left: 20, bottom: 28 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeOpacity={0.5} />
              
              {/* Normal range band (light green shaded area) */}
              {normalRangeBand.map((point, idx) => {
                if (idx === 0) return null;
                const prev = normalRangeBand[idx - 1];
                return (
                  <ReferenceArea
                    key={`band-${idx}`}
                    x1={prev.karmaPoints}
                    x2={point.karmaPoints}
                    y1={prev.ownershipLower}
                    y2={point.ownershipUpper}
                    fill="#dcfce7"
                    fillOpacity={0.35}
                    stroke="none"
                  />
                );
              })}
              
              <XAxis
                type="number"
                dataKey="karmaPoints"
                name="Cumulative KarmaPoints"
                domain={[0, config.maxKarma]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#6b7280"
                tickFormatter={(v) => {
                  if (v === 0) return "0";
                  return `${(v / 1000).toFixed(0)}k`;
                }}
                ticks={
                  config.maxKarma <= 100000
                    ? [0, Math.floor(config.maxKarma / 4), Math.floor(config.maxKarma / 2), Math.floor((3 * config.maxKarma) / 4), config.maxKarma]
                    : [0, 100000, 200000, 300000]
                }
                label={{ value: "Cumulative KarmaPoints", position: "insideBottom", offset: -5, style: { fontSize: 12, fill: "#6b7280" } }}
              />
              <YAxis
                type="number"
                dataKey="ownership"
                name="Ownership %"
                domain={[0, 80]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#6b7280"
                tickFormatter={(v) => `${v}`}
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80]}
                label={{ value: "Ownership %", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#6b7280" } }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as KarmaPoint;
                  return (
                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <p className="font-semibold text-gray-900 mb-1">
                        {point.isOutlier ? "Outlier" : "Normal Range"}
                      </p>
                      <p className="text-xs text-gray-600">
                        KarmaPoints: {Math.round(point.karmaPoints).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        Ownership: {point.ownership.toFixed(1)}%
                      </p>
                    </div>
                  );
                }}
              />
              
              {/* Trend line (dashed gray) */}
              <Line
                data={trendData}
                dataKey="ownership"
                stroke="#6b7280"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                name="Trend"
                legendType="none"
                connectNulls={true}
              />
              
              {/* Normal range points (blue) */}
              <Scatter
                name="Normal Range"
                data={normalPoints}
                fill="#3b82f6"
                shape="circle"
                legendType="none"
              >
                {normalPoints.map((entry, index) => (
                  <Cell key={`normal-${index}`} fill="#3b82f6" />
                ))}
              </Scatter>
              
              {/* Outlier points (red) */}
              <Scatter
                name="Outlier"
                data={outlierPoints}
                fill="#ef4444"
                shape="circle"
                legendType="none"
              >
                {outlierPoints.map((entry, index) => (
                  <Cell key={`outlier-${index}`} fill="#ef4444" />
                ))}
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend block: to the right of the chart */}
        <div className="flex flex-col gap-1.5 text-xs bg-white rounded-md p-3 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: "#dcfce7" }} />
            <span className="text-gray-700 font-medium">Normal Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#3b82f6" }} />
            <span className="text-gray-700 font-medium">Normal Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-gray-700 font-medium">Outlier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed shrink-0" style={{ borderColor: "#6b7280" }} />
            <span className="text-gray-700 font-medium">Trend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
