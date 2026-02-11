"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { MetricSeverity } from "@/lib/orgDashboard/types";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const MINI_CHART_HEIGHT = 160;

/** Icon rendered inside the statistic card header (generic line-chart style). */
function MetricIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.17 10.5L4.67 7L7 9.33L12.83 3.5"
        stroke={color}
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.17 3.5H12.83V8.17"
        stroke={color}
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PerformanceStatisticCardProps = {
  title: string;
  severity: MetricSeverity;
  severityColor: string;
  bgColor: string;
  iconColor: string;
  chartData: { date: string; value: number }[];
};

export function PerformanceStatisticCard({
  title,
  severity,
  severityColor,
  bgColor,
  iconColor,
  chartData,
}: PerformanceStatisticCardProps) {
  /** Build Plotly traces for the mini line chart. */
  const plotlyData = useMemo((): Data[] => {
    if (chartData.length === 0) return [];

    return [
      {
        type: "scatter",
        mode: "lines+markers",
        x: chartData.map((d) => d.date),
        y: chartData.map((d) => d.value),
        line: {
          color: severityColor,
          width: 2,
          shape: "spline",
        },
        marker: {
          color: severityColor,
          size: 4,
        },
        hovertemplate: "<b>%{x|%b %d}</b><br>Value: %{y}<extra></extra>",
      },
    ];
  }, [chartData, severityColor]);

  /** Build Plotly layout. */
  const plotlyLayout = useMemo(
    (): Partial<Layout> => ({
      autosize: true,
      height: MINI_CHART_HEIGHT,
      margin: { t: 8, r: 12, b: 28, l: 36 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        showgrid: false,
        showline: false,
        tickformat: "%b",
        tickfont: { size: 10, color: "#6b7280" },
      },
      yaxis: {
        showgrid: true,
        gridcolor: "rgba(0,0,0,0.06)",
        gridwidth: 1,
        griddash: "dot",
        showline: false,
        tickfont: { size: 10, color: "#6b7280" },
      },
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "#d1d5db",
        font: { size: 11, color: "#0f172a" },
      },
      showlegend: false,
    }),
    [],
  );

  /** Plotly config. */
  const plotlyConfig = useMemo(
    (): Partial<Config> => ({
      displayModeBar: false,
      responsive: true,
      displaylogo: false,
    }),
    [],
  );

  return (
    <div
      className="flex flex-col gap-4 rounded-[10px] p-4"
      style={{ backgroundColor: bgColor, flex: "1 1 0%" }}
    >
      {/* Header: icon + title + severity badge */}
      <div className="flex items-center justify-between gap-[10px]">
        <div className="flex items-center gap-2">
          <div
            className="flex size-5 items-center justify-center rounded-md"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <MetricIcon color={iconColor} />
          </div>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span
          className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: severityColor, color: "#FAFAFA" }}
        >
          {severity}
        </span>
      </div>

      {/* Mini chart */}
      <div className="w-full overflow-hidden">
        {chartData.length > 0 ? (
          <Plot
            data={plotlyData}
            layout={plotlyLayout}
            config={plotlyConfig}
            style={{ width: "100%", height: `${MINI_CHART_HEIGHT}px` }}
            useResizeHandler
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ height: `${MINI_CHART_HEIGHT}px`, backgroundColor: "rgba(0,0,0,0.03)" }}
          >
            <p className="text-sm text-gray-400">No data</p>
          </div>
        )}
      </div>
    </div>
  );
}
