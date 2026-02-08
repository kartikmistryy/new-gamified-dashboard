"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";

// Dynamically import ReactECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SPOFTreemapProps = {
  /** Module data for treemap visualization. */
  modules: ModuleSPOFData[];
  /** Optional className for container styling. */
  className?: string;
};

/**
 * Get color based on SPOF score range.
 * Uses Tailwind color values for consistency.
 *
 * Score ranges:
 * - High (71-100): Red (#ef4444)
 * - Medium (31-70): Orange (#fb923c)
 * - Low (0-30): Green (#22c55e)
 *
 * @param scoreRange - SPOF score range category
 * @returns Hex color string
 */
function getModuleColor(scoreRange: ModuleSPOFData["scoreRange"]): string {
  switch (scoreRange) {
    case "high":
      return "#ef4444"; // red-500
    case "medium":
      return "#fb923c"; // orange-400
    case "low":
      return "#22c55e"; // green-500
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
export function SPOFTreemap({ modules, className = "" }: SPOFTreemapProps) {
  // Transform module data into ECharts treemap format
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
          height: "96%",
          top: "2%",
          left: "2%",
          roam: false,
          breadcrumb: {
            show: false,
          },
          label: {
            show: true,
            formatter: "{b}",
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
      {/* ECharts Treemap */}
      <div className="w-full h-[700px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-700">Low Risk (0-30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span className="text-gray-700">Medium Risk (31-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-700">High Risk (71-100)</span>
        </div>
      </div>
    </div>
  );
}
