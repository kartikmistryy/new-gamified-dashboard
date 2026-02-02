"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getGaugeColor,
  getGaugeSecondaryLabel,
  getPerformanceGaugeLabel,
} from "@/lib/orgDashboard/utils";
import { D3Gauge } from "./D3Gauge";

type GaugeSectionProps = {
  gaugeValue: number;
  timeRange?: string;
  onTimeRangeChange?: (value: string | undefined) => void;
  /** Use "performance" for org overview (Underperforming / Outperforming). */
  labelVariant?: "fearGreed" | "performance";
};

export function GaugeSection({
  gaugeValue,
  timeRange = "1-month",
  onTimeRangeChange,
  labelVariant = "fearGreed",
}: GaugeSectionProps) {
  const isPerformance = labelVariant === "performance";
  const primaryLabel = isPerformance
    ? getPerformanceGaugeLabel(gaugeValue)
    : getGaugeSecondaryLabel(gaugeValue);
  const labelColor = getGaugeColor(gaugeValue);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-0">
        <div
          className="w-full h-full min-w-[400px] flex justify-center"
          aria-label={isPerformance ? "Performance gauge" : "Fear & Greed Index gauge"}
        >
          <D3Gauge
            value={gaugeValue}
            label={primaryLabel}
            labelColor={labelColor}
            valueDisplay={isPerformance ? `${Math.round(gaugeValue)}/100` : undefined}
          />
        </div>
      </div>
      {!isPerformance && onTimeRangeChange && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .timespan-toggle[data-slot="toggle-group"] button {
                  background-color: white;
                  color: #111827;
                  border: 1px solid #e5e7eb;
                  border-radius: 4px !important;
                }
                .timespan-toggle[data-slot="toggle-group"] button:hover,
                .timespan-toggle[data-slot="toggle-group"] button[data-state="on"] {
                  background-color: #111827 !important;
                  color: white !important;
                  border-color: #111827 !important;
                }
              `,
            }}
          />
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={onTimeRangeChange}
            variant="outline"
            className="timespan-toggle p-1 flex flex-row gap-2"
          >
            <ToggleGroupItem
              value="1-month"
              className="px-4 rounded-none cursor-pointer"
            >
              1 Month
            </ToggleGroupItem>
            <ToggleGroupItem
              value="1-year"
              className="px-4 rounded-none cursor-pointer"
            >
              1 Year
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className="px-4 rounded-none cursor-pointer">
              All
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="flex flex-row justify-between max-w-sm mx-auto gap-8 w-full">
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-base text-gray-500">Fear & Greed Index</p>
              <p className="font-bold text-3xl leading-tight text-gray-900">
                {getGaugeSecondaryLabel(gaugeValue)}
              </p>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-base text-gray-500">Index Value</p>
              <p className="font-bold text-3xl leading-tight text-gray-900">
                {gaugeValue}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
