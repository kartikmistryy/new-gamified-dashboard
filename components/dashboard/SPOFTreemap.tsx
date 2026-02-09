"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";
import { ArrowLeft } from "lucide-react";

// Dynamically import ReactECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SPOFTreemapProps = {
  /** Module data for treemap visualization. */
  modules: ModuleSPOFData[];
  /** Current user ID to filter modules where user is primary owner. */
  currentUserId: string;
  /** Optional className for container styling. */
  className?: string;
};

/**
 * Get color based on SPOF score range.
 * Uses same colors as D3Gauge for consistency across dashboard.
 *
 * Score ranges:
 * - High (71-100): Red (#DD524C) - matches gauge low segment
 * - Medium (31-70): Orange (#E87B35) - matches gauge mid-low segment
 * - Low (0-30): Green (#55B685) - matches gauge high segment
 *
 * @param scoreRange - SPOF score range category
 * @returns Hex color string
 */
function getModuleColor(scoreRange: ModuleSPOFData["scoreRange"]): string {
  switch (scoreRange) {
    case "high":
      return "#DD524C"; // red - matches D3Gauge low segment
    case "medium":
      return "#E87B35"; // orange - matches D3Gauge mid-low segment
    case "low":
      return "#55B685"; // green - matches D3Gauge high segment
  }
}

/**
 * SPOF Treemap Component
 *
 * Displays an interactive ECharts treemap visualization of modules with SPOF risk scores.
 * Box sizes are proportional to module contribution size, with colors indicating risk level.
 *
 * Features:
 * - Color-coded risk levels (red = high, orange = medium, green = low)
 * - Interactive hover effects with shadow and highlight
 * - Rich tooltips showing module details and SPOF metrics
 * - Responsive sizing based on number of modules
 * - Legend for risk level interpretation
 *
 * @example
 * ```tsx
 * <SPOFTreemap modules={userModules} />
 * ```
 */
export function SPOFTreemap({ modules, currentUserId, className = "" }: SPOFTreemapProps) {
  const chartInstanceRef = useRef<any>(null);
  const [isDrilledDown, setIsDrilledDown] = useState(false);

  // Transform module data into ECharts treemap format
  // Note: modules are already filtered to primary owner in parent component
  const chartData = useMemo(() => {
    return modules.map((module) => ({
      name: module.name,
      value: module.size,
      spofScore: module.spofScore,
      scoreRange: module.scoreRange,
      itemStyle: {
        color: getModuleColor(module.scoreRange),
      },
    }));
  }, [modules]);

  // Handle back to overview
  const handleBackToOverview = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispatchAction({
        type: 'treemapZoomToNode',
        seriesIndex: 0,
      });
      setIsDrilledDown(false);
    }
  };

  // ECharts configuration
  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        formatter: (params: any) => {
          const data = params.data;
          const riskLabel =
            data.scoreRange === "high"
              ? "High Risk"
              : data.scoreRange === "medium"
                ? "Medium Risk"
                : "Low Risk";
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
              <div style="font-size: 12px; color: #666;">
                SPOF Score: ${data.spofScore}/100<br/>
                Risk Level: ${riskLabel}<br/>
                Contribution Size: ${data.value}
              </div>
            </div>
          `;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: {
          color: "#333",
        },
      },
      series: [
        {
          type: "treemap",
          data: chartData,
          width: "96%",
          height: "92%",
          top: "8%",
          left: "2%",
          roam: false,
          breadcrumb: {
            show: false,
          },
          label: {
            show: true,
            formatter: " {b}",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            overflow: "truncate",
            ellipsis: "...",
          },
          upperLabel: {
            show: false,
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
            gapWidth: 2,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 600,
            },
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 2,
              },
            },
            {
              itemStyle: {
                borderWidth: 2,
                gapWidth: 2,
                borderColor: "#fff",
              },
            },
          ],
        },
      ],
    }),
    [chartData]
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Back to Overview Button */}
      {isDrilledDown && (
        <div className="mb-4 flex justify-start">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        </div>
      )}

      {/* ECharts Treemap */}
      <div className="w-full h-[700px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge={true}
          lazyUpdate={true}
          onChartReady={(chart: any) => {
            chartInstanceRef.current = chart;
          }}
          onEvents={{
            click: (params: any) => {
              if (params.componentType === 'series' && params.seriesType === 'treemap') {
                setIsDrilledDown(true);
              }
            },
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#55B685" }} />
          <span className="text-gray-700">Low Risk (0-30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E87B35" }} />
          <span className="text-gray-700">Medium Risk (31-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DD524C" }} />
          <span className="text-gray-700">High Risk (71-100)</span>
        </div>
      </div>
    </div>
  );
}
