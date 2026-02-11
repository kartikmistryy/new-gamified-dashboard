/** SPOF Treemap Utilities */

import type { ModuleSPOFData } from "../../types";

/** Get color based on SPOF score range - matches D3Gauge colors */
export function getModuleColor(scoreRange: ModuleSPOFData["scoreRange"]): string {
  switch (scoreRange) {
    case "high":
      return "#DD524C";
    case "medium":
      return "#E87B35";
    case "low":
      return "#55B685";
  }
}

/** Transform module data into ECharts treemap format */
export function transformModulesToTreemapData(modules: ModuleSPOFData[]) {
  return modules.map((module) => ({
    name: module.name,
    value: module.size,
    spofScore: module.spofScore,
    scoreRange: module.scoreRange,
    itemStyle: {
      color: getModuleColor(module.scoreRange),
    },
  }));
}
