"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Data, Layout, Config } from "plotly.js";
import type { MetricSeverity, DonutSegment, ThresholdZone } from "@/lib/dashboard/entities/team/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DONUT_CHART_SIZE = 120;

type PerformanceStatisticCardProps = {
  title: string;
  severity: MetricSeverity;
  severityColor: string;
  bgColor: string;
  iconColor: string;
  /** Lucide icon component rendered in the card header. */
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  /** Primary display value (e.g., "42", "8,450", "23", "12.4"). */
  primaryValue: string;
  /** Unit or label shown below the primary value (e.g., "days", "nLoC", "%"). */
  primaryLabel?: string;
  /** Type of visualization. */
  visualizationType: "donut" | "barWithZones";
  /** Breakdown segments for donut chart. */
  breakdown?: DonutSegment[];
  /** Threshold zones for bar visualization. */
  thresholds?: ThresholdZone[];
  /** Current numeric value for positioning on threshold bar. */
  currentValue?: number;
  /** Trend compared to previous period. */
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;
    upIsGood: boolean;
  };
};

/** Donut chart popover content */
function DonutPopoverContent({ breakdown }: { breakdown: DonutSegment[] }) {
  const plotlyData = useMemo((): Data[] => {
    return [
      {
        type: "pie",
        values: breakdown.map((s) => s.value),
        labels: breakdown.map((s) => s.label),
        marker: {
          colors: breakdown.map((s) => s.color),
        },
        hole: 0.5,
        textinfo: "percent",
        textposition: "inside",
        textfont: {
          size: 11,
          color: "#ffffff",
        },
        insidetextorientation: "horizontal",
        hovertemplate: "<b>%{label}</b><br>%{value}%<extra></extra>",
        sort: false,
      },
    ];
  }, [breakdown]);

  const plotlyLayout = useMemo(
    (): Partial<Layout> => ({
      width: DONUT_CHART_SIZE,
      height: DONUT_CHART_SIZE,
      margin: { t: 0, r: 0, b: 0, l: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: false,
    }),
    [],
  );

  const plotlyConfig = useMemo(
    (): Partial<Config> => ({
      displayModeBar: false,
      responsive: false,
      displaylogo: false,
    }),
    [],
  );

  return (
    <div className="flex items-center gap-4 p-2">
      {/* Donut chart */}
      <div className="flex items-center justify-center">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={plotlyConfig}
          style={{ width: `${DONUT_CHART_SIZE}px`, height: `${DONUT_CHART_SIZE}px` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {breakdown.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <div
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-gray-600 whitespace-nowrap">{segment.label}</span>
            <span className="text-xs font-medium text-gray-800">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Trend indicator showing direction and change value */
function TrendIndicator({
  direction,
  value,
  upIsGood,
}: {
  direction: "up" | "down" | "flat";
  value: string;
  upIsGood: boolean;
}) {
  const isUp = direction === "up";
  const isDown = direction === "down";
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  // Determine color based on direction and whether up is good
  let color = "#9CA3AF"; // flat = gray
  if (isUp) {
    color = upIsGood ? "#55B685" : "#CA3A31"; // up: green if good, red if bad
  } else if (isDown) {
    color = upIsGood ? "#CA3A31" : "#55B685"; // down: red if up is good, green if up is bad
  }

  return (
    <div className="flex items-center gap-1" style={{ color }}>
      <Icon size={16} strokeWidth={2} />
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

/** Horizontal bar with threshold zones and numbers */
function ThresholdBar({
  thresholds,
  currentValue,
}: {
  thresholds: ThresholdZone[];
  currentValue: number;
}) {
  const zoneCount = thresholds.length;
  const zoneWidthPercent = 100 / zoneCount;

  // Find marker position
  let markerPosition = 0;
  for (let i = 0; i < thresholds.length; i++) {
    const zone = thresholds[i];
    if (currentValue >= zone.min && currentValue < zone.max) {
      const positionInZone = (currentValue - zone.min) / (zone.max - zone.min);
      markerPosition = (i + positionInZone) * zoneWidthPercent;
      break;
    } else if (currentValue >= zone.max && i === thresholds.length - 1) {
      markerPosition = 100;
    }
  }

  return (
    <div className="w-full overflow-visible px-2">
      {/* Bar with zones */}
      <div className="relative h-4 rounded-full overflow-hidden flex">
        {thresholds.map((zone) => (
          <div
            key={zone.label}
            className="h-full"
            style={{
              width: `${zoneWidthPercent}%`,
              backgroundColor: zone.color,
              opacity: 0.7,
            }}
          />
        ))}
        {/* Marker */}
        <div
          className="absolute top-0 h-full w-1 bg-gray-800 rounded-full"
          style={{ left: `calc(${markerPosition}% - 2px)` }}
        />
      </div>

      {/* Numbers between zones */}
      <div className="relative flex mt-2 h-4 text-[10px] text-gray-500">
        {thresholds.map((zone, i) => (
          <div
            key={`num-${zone.label}`}
            className="relative"
            style={{ width: `${zoneWidthPercent}%` }}
          >
            {/* Show number at left boundary of each zone */}
            <span className="absolute left-0 -translate-x-1/2 whitespace-nowrap">{zone.min}</span>
            {/* Show final number at right boundary of last zone */}
            {i === thresholds.length - 1 && (
              <span className="absolute right-0 translate-x-1/2 whitespace-nowrap">{zone.max}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Get current zone color based on value and thresholds */
function getZoneColor(thresholds: ThresholdZone[], currentValue: number): string {
  for (const zone of thresholds) {
    if (currentValue >= zone.min && currentValue < zone.max) {
      return zone.color;
    }
  }
  return thresholds[thresholds.length - 1]?.color ?? "#9CA3AF";
}

/** Donut visualization: shows number with hover tooltip for chart */
function DonutVisualization({
  primaryValue,
  primaryLabel,
  breakdown,
  thresholds,
  currentValue,
  trend,
}: {
  primaryValue: string;
  primaryLabel?: string;
  breakdown: DonutSegment[];
  thresholds?: ThresholdZone[];
  currentValue?: number;
  trend?: { direction: "up" | "down" | "flat"; value: string; upIsGood: boolean };
}) {
  const valueColor = thresholds && currentValue !== undefined
    ? getZoneColor(thresholds, currentValue)
    : "#374151";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Primary value with trend stacked above unit */}
      <div className="flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-6xl font-bold cursor-pointer" style={{ color: valueColor }}>
              {primaryValue}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className="bg-white border border-border shadow-lg rounded-lg p-0"
          >
            <DonutPopoverContent breakdown={breakdown} />
          </TooltipContent>
        </Tooltip>
        {/* Right column: trend on top, unit below */}
        <div className="flex flex-col items-start ml-1">
          {trend && <TrendIndicator direction={trend.direction} value={trend.value} upIsGood={trend.upIsGood} />}
          {primaryLabel && (
            <span className="text-xl text-gray-500">{primaryLabel}</span>
          )}
        </div>
      </div>

      {/* Threshold bar */}
      {thresholds && thresholds.length > 0 && currentValue !== undefined && (
        <ThresholdBar thresholds={thresholds} currentValue={currentValue} />
      )}
    </div>
  );
}

/** Bar-only visualization (no donut hover) */
function BarWithZonesVisualization({
  primaryValue,
  primaryLabel,
  thresholds,
  currentValue,
  trend,
}: {
  primaryValue: string;
  primaryLabel?: string;
  thresholds: ThresholdZone[];
  currentValue: number;
  trend?: { direction: "up" | "down" | "flat"; value: string; upIsGood: boolean };
}) {
  const valueColor = getZoneColor(thresholds, currentValue);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Primary value with trend stacked above unit */}
      <div className="flex items-center justify-center">
        <span className="text-6xl font-bold" style={{ color: valueColor }}>
          {primaryValue}
        </span>
        {/* Right column: trend on top, unit below */}
        <div className="flex flex-col items-start ml-1">
          {trend && <TrendIndicator direction={trend.direction} value={trend.value} upIsGood={trend.upIsGood} />}
          {primaryLabel && (
            <span className="text-xl text-gray-500">{primaryLabel}</span>
          )}
        </div>
      </div>

      {/* Threshold bar */}
      <ThresholdBar thresholds={thresholds} currentValue={currentValue} />
    </div>
  );
}

export function PerformanceStatisticCard({
  title,
  severity,
  severityColor,
  bgColor,
  iconColor,
  icon: Icon,
  primaryValue,
  primaryLabel,
  visualizationType,
  breakdown,
  thresholds,
  currentValue,
  trend,
}: PerformanceStatisticCardProps) {
  return (
    <Card className="gap-3 rounded-[10px] border-none p-4 shadow-none min-w-0 flex-1 bg-white">
      <CardHeader className="gap-[10px] p-0">
        <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <div
            className="flex size-5 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <Icon size={14} color={iconColor} strokeWidth={2} />
          </div>
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full overflow-hidden p-0">
        {/* Primary Visualization */}
        {visualizationType === "donut" && breakdown && breakdown.length > 0 ? (
          <DonutVisualization
            primaryValue={primaryValue}
            primaryLabel={primaryLabel}
            breakdown={breakdown}
            thresholds={thresholds}
            currentValue={currentValue}
            trend={trend}
          />
        ) : visualizationType === "barWithZones" && thresholds && thresholds.length > 0 ? (
          <BarWithZonesVisualization
            primaryValue={primaryValue}
            primaryLabel={primaryLabel}
            thresholds={thresholds}
            currentValue={currentValue ?? 0}
            trend={trend}
          />
        ) : (
          /* Fallback: just show primary value */
          <div className="py-4">
            <span className="text-4xl font-bold" style={{ color: severityColor }}>
              {primaryValue}
            </span>
            {primaryLabel && (
              <span className="text-lg text-gray-500 ml-1">{primaryLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
