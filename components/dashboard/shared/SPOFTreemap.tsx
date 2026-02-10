"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";
import { ArrowLeft } from "lucide-react";
import { transformModulesToTreemapData } from "@/lib/userDashboard/spofTreemapUtils";
import { buildTreemapOption } from "@/lib/userDashboard/spofTreemapConfig";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SPOFTreemapProps = {
  modules: ModuleSPOFData[];
  currentUserId: string;
  className?: string;
};

/** SPOF Treemap - interactive ECharts treemap of modules with risk-based coloring */
export function SPOFTreemap({ modules, currentUserId, className = "" }: SPOFTreemapProps) {
  const chartInstanceRef = useRef<any>(null);
  const [isDrilledDown, setIsDrilledDown] = useState(false);

  const chartData = useMemo(() => transformModulesToTreemapData(modules), [modules]);

  const handleBackToOverview = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispatchAction({
        type: "treemapZoomToNode",
        seriesIndex: 0,
      });
      setIsDrilledDown(false);
    }
  };

  const option = useMemo(() => buildTreemapOption(chartData), [chartData]);

  return (
    <div className={`w-full ${className}`}>
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
              if (params.componentType === "series" && params.seriesType === "treemap") {
                setIsDrilledDown(true);
              }
            },
          }}
        />
      </div>

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
