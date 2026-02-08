"use client";

import { useMemo } from "react";

type MetricType = "commits" | "additions" | "deletions";

type TimeSeriesDataPoint = {
  week: string;
  value: number;
};

type ContributorMetricsChartProps = {
  data: TimeSeriesDataPoint[];
  metricType: MetricType;
  title: string;
  subtitle?: string;
  showMiniVersion?: boolean;
  height?: number;
};

export function ContributorMetricsChart({
  data,
  metricType,
  title,
  subtitle,
  showMiniVersion = false,
  height: propHeight,
}: ContributorMetricsChartProps) {
  // Determine bar color based on metric type
  const barColor = useMemo(() => {
    switch (metricType) {
      case "additions":
        return "#10b981"; // green
      case "deletions":
        return "#ef4444"; // red
      case "commits":
      default:
        return "#3b82f6"; // blue
    }
  }, [metricType]);

  const chartConfig = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    // Use a reasonable base width that will scale responsively
    const height = propHeight ?? (showMiniVersion ? 140 : 360);
    // Calculate width based on data length for better readability
    // For mini version, keep it fixed to fit in cards. For full version, calculate based on data.
    const minBarWidth = 12;
    const width = showMiniVersion ? 400 : Math.max(800, data.length * minBarWidth);
    const margin = showMiniVersion
      ? { top: 5, right: 5, bottom: 25, left: 5 }
      : { top: 10, right: 20, bottom: 40, left: 50 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const barWidth = Math.max(2, (innerWidth / data.length) * 0.8);
    const barGap = (innerWidth / data.length) * 0.2;

    const bars = data.map((point, index) => {
      const x = margin.left + (index * innerWidth) / data.length + barGap / 2;
      const barHeight = (point.value / maxValue) * innerHeight;
      const y = margin.top + innerHeight - barHeight;

      return {
        x,
        y,
        width: barWidth,
        height: Math.max(1, barHeight),
        value: point.value,
        week: point.week,
      };
    });

    // Y-axis ticks
    const tickCount = showMiniVersion ? 3 : 5;
    const yTicks = [];
    for (let i = 0; i <= tickCount; i++) {
      const value = Math.round((maxValue / tickCount) * i);
      const y = margin.top + innerHeight - (i / tickCount) * innerHeight;
      yTicks.push({ y, value });
    }

    // X-axis ticks
    const labelCount = showMiniVersion ? 4 : 8;
    const labelInterval = Math.max(1, Math.floor(data.length / labelCount));
    const xTicks = data
      .map((point, index) => {
        if (index % labelInterval === 0 || index === data.length - 1) {
          const x = margin.left + (index * innerWidth) / data.length + barWidth / 2 + barGap / 2;
          return { x, label: point.week };
        }
        return null;
      })
      .filter((tick): tick is { x: number; label: string } => tick !== null);

    return {
      bars,
      yTicks,
      xTicks,
      width,
      height,
      margin,
    };
  }, [data, metricType, showMiniVersion, propHeight]);

  if (!chartConfig) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-50 p-8">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div style={showMiniVersion ? { width: "100%", height: `${chartConfig.height}px` } : { width: `${chartConfig.width}px`, height: `${chartConfig.height}px` }}>
      <svg
        viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
        {...(showMiniVersion ? { className: "w-full", style: { display: "block", height: `${chartConfig.height}px` } } : { width: chartConfig.width, height: chartConfig.height, style: { display: "block" } })}
      >
        {/* Horizontal grid lines */}
        {!showMiniVersion && chartConfig.yTicks.map((tick, i) => (
          <line
            key={i}
            x1={chartConfig.margin.left}
            x2={chartConfig.width - chartConfig.margin.right}
            y1={tick.y}
            y2={tick.y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="3 3"
            opacity={0.8}
          />
        ))}

        {/* Bars */}
        {chartConfig.bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={barColor}
            rx={1}
          />
        ))}

        {/* Y-axis */}
        {!showMiniVersion && (
          <>
            <line
              x1={chartConfig.margin.left}
              x2={chartConfig.margin.left}
              y1={chartConfig.margin.top}
              y2={chartConfig.height - chartConfig.margin.bottom}
              stroke="#d1d5db"
              strokeWidth={1}
            />
            {chartConfig.yTicks.map((tick, i) => (
              <text
                key={i}
                x={chartConfig.margin.left - 8}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#6b7280"
                fontSize={10}
              >
                {tick.value}
              </text>
            ))}
          </>
        )}

        {/* X-axis */}
        <line
          x1={chartConfig.margin.left}
          x2={chartConfig.width - chartConfig.margin.right}
          y1={chartConfig.height - chartConfig.margin.bottom}
          y2={chartConfig.height - chartConfig.margin.bottom}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        {chartConfig.xTicks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={chartConfig.height - chartConfig.margin.bottom + (showMiniVersion ? 15 : 20)}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={showMiniVersion ? 8 : 10}
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
