"use client";

import * as React from "react";
import {
  AgCharts,
  ModuleRegistry,
  AllGaugeModule,
  AnimationModule,
  CrosshairModule,
  ContextMenuModule,
} from "ag-charts-enterprise";
import type { AgRadialGaugeOptions } from "ag-charts-types";

const INDUSTRY_AVERAGE = 80;
let gaugeModulesRegistered = false;

function registerGaugeModules() {
  if (gaugeModulesRegistered) return;
  ModuleRegistry.registerModules([
    AllGaugeModule,
    AnimationModule,
    CrosshairModule,
    ContextMenuModule,
  ]);
  gaugeModulesRegistered = true;
}

export function useGauge(
  gaugeValue: number,
  industryAverage: number = INDUSTRY_AVERAGE,
) {
  const gaugeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = gaugeRef.current;
    if (!container) return;
    registerGaugeModules();
    const options: AgRadialGaugeOptions = {
      type: "radial-gauge",
      width: 500,
      value: gaugeValue,
      scale: { min: 0, max: 100, label: { enabled: false } },
      bar: {
        fills: [
          { color: "#EE6666", stop: 25 },
          { color: "#FD994D", stop: 50 },
          { color: "#FAC858", stop: 75 },
          { color: "#91CC75", stop: 100 },
        ],
        fillMode: "discrete",
      },
      label: { formatter: ({ value }) => String(Math.round(value)) },
      secondaryLabel: { enabled: false },
      startAngle: 270,
      endAngle: 450,
      segmentation: { enabled: true, interval: { count: 3 } },
      targets: [{ value: industryAverage, text: "Market Average" }],
      cornerMode: "container",
      cornerRadius: 10,
    };
    options.container = container;
    const chart = AgCharts.createGauge(options);
    return () => chart.destroy();
  }, [gaugeValue, industryAverage]);

  return gaugeRef;
}
