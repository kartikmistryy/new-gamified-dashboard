"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import type { ChartDataPoint } from "@/lib/orgDashboard/types";

type SummaryChartProps = {
  chartData: ChartDataPoint[];
  gaugeValue: number;
};

// Chart shows 2 lines:
// 1. BTC Price (left Y-axis, grey)
// 2. Fear & Greed Index (right Y-axis) — single line whose color changes by value (red → orange → yellow → green)

function getColorForValue(value: number): string {
  if (value <= 25) return "#EE6666"; // Red
  if (value <= 50) return "#FD994D"; // Orange
  if (value <= 75) return "#FAC858"; // Yellow
  return "#91CC75"; // Green
}

// Split Fear & Greed series into segments so the line color can change by value (Recharts has no gradient stroke per point)
function createSegments(data: ChartDataPoint[]) {
  if (data.length === 0) return [];
  
  const segments: Array<{
    data: ChartDataPoint[];
    color: string;
  }> = [];
  
  let startIdx = 0;
  let currentColor = getColorForValue(data[0].fearGreed);

  for (let i = 1; i < data.length; i++) {
    const pointColor = getColorForValue(data[i].fearGreed);
    
    if (pointColor !== currentColor) {
      // End current segment, include transition point
      segments.push({
        data: data.slice(startIdx, i + 1),
        color: currentColor,
      });
      startIdx = i;
      currentColor = pointColor;
    }
  }
  
  // Add final segment
  if (startIdx < data.length) {
    segments.push({
      data: data.slice(startIdx),
      color: currentColor,
    });
  }
  
  return segments;
}

// Find absolute highest and lowest Fear & Greed points for value labels
function getLabelPoints(data: ChartDataPoint[]): Array<{ point: ChartDataPoint; index: number }> {
  if (data.length === 0) return [];
  
  let maxPoint = data[0];
  let maxIdx = 0;
  let minPoint = data[0];
  let minIdx = 0;
  
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    if (point.fearGreed > maxPoint.fearGreed) {
      maxPoint = point;
      maxIdx = i;
    }
    if (point.fearGreed < minPoint.fearGreed) {
      minPoint = point;
      minIdx = i;
    }
  }
  
  const results: Array<{ point: ChartDataPoint; index: number }> = [];
  results.push({ point: maxPoint, index: maxIdx });
  if (minIdx !== maxIdx) {
    results.push({ point: minPoint, index: minIdx });
  }
  return results;
}

type ChartDataPointWithIndex = ChartDataPoint & { index: number };

export function SummaryChart({ chartData, gaugeValue }: SummaryChartProps) {
  const dataWithIndex = React.useMemo<ChartDataPointWithIndex[]>(
    () => chartData.map((d, i) => ({ ...d, index: i })),
    [chartData]
  );
  const segments = React.useMemo(() => createSegments(dataWithIndex), [dataWithIndex]);
  const labelPoints = React.useMemo(() => getLabelPoints(chartData), [chartData]);
  const xDomain = React.useMemo(
    () => [0, Math.max(0, chartData.length - 1)] as [number, number],
    [chartData.length]
  );

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataWithIndex}
          margin={{ top: 10, right: 30, left: 20, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* Four colored rows matching Fear & Greed ranges: red, orange, yellow, green */}
          <ReferenceArea yAxisId="right" y1={0} y2={25} fill="#EE6666" fillOpacity={0.15} stroke="none" />
          <ReferenceArea yAxisId="right" y1={75} y2={100} fill="#91CC75" fillOpacity={0.15} stroke="none" />
          
          <XAxis 
            dataKey="index" 
            type="number"
            domain={xDomain}
            tick={{ fontSize: 11, fill: "#6b7280" }} 
            stroke="#6b7280"
            padding={{ left: 0, right: 0 }}
            allowDecimals={false}
            tickFormatter={(index) => {
              const point = chartData[Number(index)];
              if (!point) return "";
              return point.date;
            }}
            label={{ value: "Date", position: "insideBottom", offset: -5, style: { fontSize: 12, fill: "#6b7280" } }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
            domain={["dataMin", "dataMax"]}
            allowDecimals={false}
            label={{ value: "BTC Price", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#6b7280" } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
            label={{ value: "Fear & Greed Index", angle: 90, position: "insideRight", style: { fontSize: 12, fill: "#6b7280" } }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const index = payload[0]?.payload?.index != null ? Number(payload[0].payload.index) : Number(label);
              const dateLabel = chartData[index]?.date ?? String(label);
              const btcEntry = payload.find((p) => p.dataKey === "btcPrice");
              const fearGreedEntry = payload.find((p) => p.dataKey === "fearGreed");
              const btcVal = btcEntry?.value != null ? Number(btcEntry.value) : null;
              const fearVal = fearGreedEntry?.value != null ? Number(fearGreedEntry.value) : null;
              return (
                <div
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  style={{ fontSize: 12 }}
                >
                  <p className="font-semibold text-gray-900 mb-1.5">{dateLabel}</p>
                  {btcVal != null && (
                    <p className="text-gray-600">
                      BTC Price: ${(btcVal / 1000).toFixed(1)}K
                    </p>
                  )}
                  {fearVal != null && (
                    <p className="text-gray-600">
                      Fear & Greed Index: {Math.round(fearVal)}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
          />
          
          {/* Line 1: BTC Price (left axis) — thicker, smooth curve */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="btcPrice"
            name="BTC Price"
            stroke="#9ca3af"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          
          {/* Line 2: Fear & Greed Index (right axis) — thinner, jagged; color changes by value */}
          {segments.map((segment, idx) => (
            <Line
              key={`segment-${idx}`}
              yAxisId="right"
              type="linear"
              dataKey="fearGreed"
              data={segment.data}
              name="fearGreed"
              stroke={segment.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
              legendType="none"
            />
          ))}
          {/* Legend-only: Fear & Greed (color matches current gauge) */}
          <Line
            yAxisId="right"
            type="linear"
            dataKey="fearGreed"
            name="Fear & Greed Index"
            stroke={getColorForValue(gaugeValue)}
            strokeWidth={0}
            style={{ strokeOpacity: 0 }}
            dot={false}
            legendType="line"
          />
          
          {/* Labels for high/low Fear & Greed points (hidden from legend) */}
          {labelPoints.map(({ point, index }, idx) => {
            const pointWithIndex = dataWithIndex[index];
            if (!pointWithIndex) return null;
            return (
              <Line
                key={`label-line-${idx}`}
                yAxisId="right"
                type="linear"
                dataKey="fearGreed"
                data={[pointWithIndex]}
                stroke="transparent"
                strokeWidth={0}
                dot={false}
                name=""
                legendType="none"
                label={({ x, y }) => (
                  <text
                    x={x}
                    y={y}
                    dy={point.fearGreed >= 50 ? -8 : 14}
                    textAnchor="middle"
                    fill="#1f2937"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {Math.round(point.fearGreed)}
                  </text>
                )}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
