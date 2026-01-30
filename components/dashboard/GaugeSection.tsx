"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getGaugeColor,
  getGaugeSecondaryLabel,
  getGaugeSecondaryLabelText,
  getGaugeSecondaryLabelIcon,
} from "@/lib/orgDashboard/utils";
import { useGauge } from "./useGauge";
import { INDUSTRY_AVERAGE_GAUGE } from "@/lib/orgDashboard/constants";

type GaugeSectionProps = {
  gaugeValue: number;
  timeRange: string;
  onTimeRangeChange: (value: string | undefined) => void;
};

export function GaugeSection({
  gaugeValue,
  timeRange,
  onTimeRangeChange,
}: GaugeSectionProps) {
  const gaugeRef = useGauge(gaugeValue, INDUSTRY_AVERAGE_GAUGE);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-0">
        <div
          ref={gaugeRef}
          className="w-full h-full min-w-[400px]"
          aria-label="Overall score gauge"
        />
        <div
          className="flex items-center justify-center gap-1.5 text-sm font-medium"
          style={{ color: getGaugeColor(gaugeValue) }}
        >
          {React.createElement(getGaugeSecondaryLabelIcon(gaugeValue), {
            className: "size-4 shrink-0",
            "aria-hidden": true,
          })}
          <span>{getGaugeSecondaryLabelText(gaugeValue)}</span>
        </div>
      </div>
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
          <p className="text-base text-gray-500">Overall Quality</p>
          <p className="font-bold text-3xl leading-tight text-gray-900">
            {getGaugeSecondaryLabel(gaugeValue)}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-base text-gray-500">Percentile</p>
          <p className="font-bold text-3xl leading-tight text-gray-900">
            {Math.round((gaugeValue / 100) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
