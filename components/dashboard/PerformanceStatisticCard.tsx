"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { MetricSeverity } from "@/lib/orgDashboard/types";
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

const MINI_CHART_HEIGHT = 160;

type PerformanceStatisticCardProps = {
  title: string;
  severity: MetricSeverity;
  severityColor: string;
  bgColor: string;
  iconColor: string;
  /** Lucide icon component rendered in the card header. */
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  chartData: { date: string; value: number }[];
};

export function PerformanceStatisticCard({
  title,
  severity,
  severityColor,
  bgColor,
  iconColor,
  icon: Icon,
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
    <Card
      className="gap-4 rounded-[10px] border-none p-4 shadow-none min-w-0 flex-1"
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
      </CardContent>
    </Card>
  );
}
