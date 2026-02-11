/** SPOF Treemap ECharts Configuration */

import type { EChartsOption } from "echarts";

/** Build ECharts option for SPOF treemap */
export function buildTreemapOption(chartData: any[]): EChartsOption {
  return {
    tooltip: {
      formatter: (params: any) => {
        const data = params.data;
        const riskLabel =
          data.scoreRange === "high" ? "High Risk" : data.scoreRange === "medium" ? "Medium Risk" : "Low Risk";
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
  };
}
