"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PerformanceChartLegend } from "./PerformanceChartLegend";
import type { PerformanceChartProps } from "@/lib/dashboard/performanceChart/types";
import { usePerformanceChartData } from "@/lib/dashboard/performanceChart/usePerformanceChartData";
import { buildPlotlyData, buildPlotlyLayout, PLOTLY_CONFIG } from "@/lib/dashboard/performanceChartConfig";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/** Unified Performance Chart - supports org, team, repo, and user dashboards with Plotly.js */
export function PerformanceChart({
  dataSource,
  eventStrategy = { mode: "none" },
  annotationStrategy = { mode: "none" },
  timeRange = "max",
  entityVisibility,
  ariaLabel = "Performance chart over time",
  className = "",
}: PerformanceChartProps) {
  const { filteredData, filteredEvents, filteredAnnotations } = usePerformanceChartData(
    dataSource,
    eventStrategy,
    annotationStrategy,
    timeRange,
    entityVisibility
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 420 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) {
        setChartSize((s) => ({ ...s, width }));
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plotlyData = useMemo(() => buildPlotlyData(filteredData), [filteredData]);

  const plotlyLayout = useMemo(
    () => buildPlotlyLayout(filteredData, filteredEvents, filteredAnnotations, chartSize.width),
    [filteredData, filteredEvents, filteredAnnotations, chartSize.width]
  );

  if (filteredData.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full overflow-visible ${className}`}>
      <div className="relative overflow-visible bg-white" role="img" aria-label={ariaLabel}>
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={PLOTLY_CONFIG}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>
      <PerformanceChartLegend />
    </div>
  );
}
