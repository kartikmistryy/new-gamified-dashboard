"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { MetricSeverity, DonutSegment, ThresholdZone } from "@/lib/orgDashboard/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
};

/** Donut chart visualization with number | donut | legend layout. */
function DonutVisualization({
  primaryValue,
  primaryLabel,
  breakdown,
  severityColor,
}: {
  primaryValue: string;
  primaryLabel?: string;
  breakdown: DonutSegment[];
  severityColor: string;
}) {
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
    <div className="flex items-center justify-center w-full gap-4">
      {/* Big number on left */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: severityColor }}>
          {primaryValue}
        </span>
        {primaryLabel && (
          <span className="text-sm text-gray-500">{primaryLabel}</span>
        )}
      </div>

      {/* Vertical divider */}
      <div className="h-16 w-px bg-gray-300" />

      {/* Donut chart */}
      <div className="flex items-center justify-center">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={plotlyConfig}
          style={{ width: `${DONUT_CHART_SIZE}px`, height: `${DONUT_CHART_SIZE}px` }}
        />
      </div>

      {/* Legend on right */}
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

/** Horizontal bar with threshold zones visualization. */
function BarWithZonesVisualization({
  primaryValue,
  primaryLabel,
  thresholds,
  currentValue,
  severityColor,
}: {
  primaryValue: string;
  primaryLabel?: string;
  thresholds: ThresholdZone[];
  currentValue: number;
  severityColor: string;
}) {
  // Calculate marker position (0-100 scale based on max threshold)
  const maxThreshold = Math.max(...thresholds.map((t) => t.max));
  const markerPosition = Math.min((currentValue / maxThreshold) * 100, 100);

  // Find which zone the current value falls into
  const currentZone = thresholds.find(
    (t) => currentValue >= t.min && currentValue < t.max,
  ) || thresholds[thresholds.length - 1];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary value */}
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold" style={{ color: severityColor }}>
          {primaryValue}
        </span>
        {primaryLabel && (
          <span className="text-lg text-gray-500">{primaryLabel}</span>
        )}
      </div>

      {/* Bar with zones */}
      <div className="w-full">
        <div className="relative h-5 rounded-full overflow-hidden flex">
          {thresholds.map((zone) => {
            const width = ((zone.max - zone.min) / maxThreshold) * 100;
            return (
              <div
                key={zone.label}
                className="h-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: zone.color,
                  opacity: 0.7,
                }}
              />
            );
          })}
          {/* Marker */}
          <div
            className="absolute top-0 h-full w-1 bg-gray-800 rounded-full"
            style={{ left: `calc(${markerPosition}% - 2px)` }}
          />
        </div>

        {/* Zone labels */}
        <div className="flex mt-1">
          {thresholds.map((zone) => {
            const width = ((zone.max - zone.min) / maxThreshold) * 100;
            return (
              <div
                key={zone.label}
                className="text-center"
                style={{ width: `${width}%` }}
              >
                <span className="text-[9px] text-gray-500">{zone.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current zone indicator */}
      <div
        className="text-xs font-medium px-2 py-0.5 rounded w-fit"
        style={{ backgroundColor: currentZone.color, color: "white" }}
      >
        {currentZone.label}
      </div>
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
}: PerformanceStatisticCardProps) {
  return (
    <Card
      className="gap-3 rounded-[10px] border-none p-4 shadow-none min-w-0 flex-1"
      style={{ backgroundColor: bgColor }}
    >
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
        <CardAction>
          <Badge
            className="rounded-lg font-semibold"
            style={{ backgroundColor: severityColor, color: "#FAFAFA" }}
          >
            {severity}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="w-full overflow-hidden p-0">
        {/* Primary Visualization */}
        {visualizationType === "donut" && breakdown && breakdown.length > 0 ? (
          <DonutVisualization
            primaryValue={primaryValue}
            primaryLabel={primaryLabel}
            breakdown={breakdown}
            severityColor={severityColor}
          />
        ) : visualizationType === "barWithZones" && thresholds && thresholds.length > 0 ? (
          <BarWithZonesVisualization
            primaryValue={primaryValue}
            primaryLabel={primaryLabel}
            thresholds={thresholds}
            currentValue={currentValue ?? 0}
            severityColor={severityColor}
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
