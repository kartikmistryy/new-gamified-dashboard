"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { OwnershipTimeRangeKey, DeveloperPoint } from "@/lib/orgDashboard/ownershipScatterTypes";
import {
  buildOwnershipChartData,
  WIDTH,
  HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/ownershipScatterUtils";

// Dynamically import Plotly to avoid SSR issues
// Note: react-plotly.js only exports a default export (external library)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type { OwnershipTimeRangeKey } from "@/lib/orgDashboard/ownershipScatterTypes";

type OwnershipScatterProps = {
  data?: DeveloperPoint[];
  range?: OwnershipTimeRangeKey;
};

/**
 * Ownership Scatter Plot Component (Plotly.js version)
 *
 * Displays a scatter plot of Cumulative KarmaPoints vs Ownership Percentage
 * with outlier detection, trend line, and confidence band.
 *
 * Features:
 * - Outlier classification (high/low ownership)
 * - Linear regression trend line
 * - Confidence band for normal range
 * - Interactive tooltips
 * - Responsive sizing
 */
export function OwnershipScatter({ data, range = "max" }: OwnershipScatterProps) {
  const { points, bandPath, xTicks, yTicks, trendLine } = useMemo(
    () => buildOwnershipChartData(data, range),
    [data, range]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: WIDTH, height: HEIGHT });

  /**
   * Set up responsive chart sizing
   */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) {
        setChartSize({ width, height: HEIGHT });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Build Plotly data traces
   * Separate traces for each outlier type for better legend control
   */
  const plotlyData = useMemo((): Data[] => {
    const traces: Data[] = [];

    // Separate points by outlier type
    const normalPoints = points.filter((p) => p.inNormalRange);
    const highOutliers = points.filter((p) => p.outlierType === "high");
    const lowOutliers = points.filter((p) => p.outlierType === "low");

    // Normal range points (blue)
    if (normalPoints.length > 0) {
      traces.push({
        type: "scatter",
        mode: "markers",
        x: normalPoints.map((p) => p.totalKarmaPoints),
        y: normalPoints.map((p) => p.ownershipPct),
        name: "Normal Range",
        marker: {
          color: "rgba(66, 133, 244, 0.7)",
          size: 9,
          line: {
            width: 0,
          },
        },
        text: normalPoints.map(
          (p) =>
            `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
        ),
        hovertemplate: "%{text}<extra></extra>",
        showlegend: false,
      });
    }

    // High outliers (green)
    if (highOutliers.length > 0) {
      traces.push({
        type: "scatter",
        mode: "markers",
        x: highOutliers.map((p) => p.totalKarmaPoints),
        y: highOutliers.map((p) => p.ownershipPct),
        name: "Outlier (High Ownership)",
        marker: {
          color: "#22c55e",
          size: 9,
          line: {
            width: 0,
          },
        },
        text: highOutliers.map(
          (p) =>
            `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
        ),
        hovertemplate: "%{text}<extra></extra>",
        showlegend: false,
      });
    }

    // Low outliers (red)
    if (lowOutliers.length > 0) {
      traces.push({
        type: "scatter",
        mode: "markers",
        x: lowOutliers.map((p) => p.totalKarmaPoints),
        y: lowOutliers.map((p) => p.ownershipPct),
        name: "Outlier (Low Ownership)",
        marker: {
          color: "#ef4444",
          size: 9,
          line: {
            width: 0,
          },
        },
        text: lowOutliers.map(
          (p) =>
            `<b>${p.name}</b><br>Team: ${p.team}<br>KP: ${Math.round(p.totalKarmaPoints).toLocaleString()} • Ownership: ${p.ownershipPct.toFixed(1)}%`
        ),
        hovertemplate: "%{text}<extra></extra>",
        showlegend: false,
      });
    }

    return traces;
  }, [points]);

  /**
   * Build Plotly layout configuration
   * Includes confidence band, trend line, axes, and grid
   */
  const plotlyLayout = useMemo((): Partial<Layout> => {
    const shapes: any[] = [];

    // Confidence band removed to match ChaosMatrix clean background
    // The original D3 version had a complex SVG path for the regression confidence band
    // For Plotly version, we keep the clean grey background from plot_bgcolor

    // Trend line
    if (trendLine) {
      // Convert pixel coordinates back to data coordinates
      // This is an approximation - we need to reverse the scale functions
      const xMin = 0;
      const xMax = 300000;
      const yMin = 0;
      const yMax = 80;

      const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
      const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

      // Reverse scale: pixel to data
      const x1Data = xMin + ((trendLine.x1 - MARGIN.left) / innerWidth) * (xMax - xMin);
      const x2Data = xMin + ((trendLine.x2 - MARGIN.left) / innerWidth) * (xMax - xMin);
      const y1Data = yMax - ((trendLine.y1 - MARGIN.top) / innerHeight) * (yMax - yMin);
      const y2Data = yMax - ((trendLine.y2 - MARGIN.top) / innerHeight) * (yMax - yMin);

      shapes.push({
        type: "line",
        x0: x1Data,
        x1: x2Data,
        y0: y1Data,
        y1: y2Data,
        xref: "x",
        yref: "y",
        line: {
          color: "#6b7280",
          width: 1.5,
          dash: "dash",
        },
        layer: "above",
      });
    }

    return {
      autosize: true,
      width: chartSize.width > 0 ? chartSize.width : WIDTH,
      height: HEIGHT,
      margin: {
        l: MARGIN.left,
        r: MARGIN.right,
        t: MARGIN.top,
        b: MARGIN.bottom,
      },
      plot_bgcolor: "#f9fafb",
      paper_bgcolor: "#ffffff",
      xaxis: {
        title: {
          text: "Cumulative KarmaPoints",
          font: {
            size: 14,
            color: "#334155",
          },
        },
        range: [0, 300000],
        showgrid: true,
        gridcolor: "#e2e8f0",
        gridwidth: 1,
        showline: true,
        linecolor: "#d1d5db",
        linewidth: 1,
        zerolinecolor: "#cbd5e1",
        tickfont: {
          size: 10,
          color: "#475569",
        },
        tickmode: "array",
        tickvals: [0, 50000, 100000, 150000, 200000, 250000, 300000],
        ticktext: ["0", "50k", "100k", "150k", "200k", "250k", "300k"],
      },
      yaxis: {
        title: {
          text: "Ownership %",
          font: {
            size: 14,
            color: "#334155",
          },
        },
        range: [0, 80],
        showgrid: true,
        gridcolor: "#e2e8f0",
        gridwidth: 1,
        showline: true,
        linecolor: "#d1d5db",
        linewidth: 1,
        zerolinecolor: "#cbd5e1",
        tickfont: {
          size: 10,
          color: "#475569",
        },
        tickmode: "array",
        tickvals: [0, 20, 40, 60, 80],
      },
      shapes,
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "#d1d5db",
        font: {
          size: 12,
          color: "#0f172a",
        },
      },
      showlegend: false,
    };
  }, [trendLine, bandPath, chartSize.width, data, range]);

  /**
   * Plotly configuration
   */
  const plotlyConfig = useMemo(
    (): Partial<Config> => ({
      displayModeBar: false,
      responsive: true,
      displaylogo: false,
    }),
    []
  );

  return (
    <div ref={containerRef} className="w-full overflow-visible">
      <div className="relative overflow-visible bg-white">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={plotlyConfig}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>

      {/* Legend */}
      <div
        className="mt-5 pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-700"
        role="list"
        aria-label="Chart legend"
      >
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span className="text-xs font-medium">Outlier (High Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ef4444]" />
          <span className="text-xs font-medium">Outlier (Low Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" preserveAspectRatio="none" aria-hidden>
            <line x1={0} y1={6} x2={12} y2={6} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <span className="text-xs font-medium">Trend</span>
        </div>
      </div>
    </div>
  );
}
