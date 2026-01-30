"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getGaugeColor } from "@/lib/orgDashboard/utils";
import type { ChartDataPoint } from "@/lib/orgDashboard/types";

type SummaryChartProps = {
  chartData: ChartDataPoint[];
  gaugeValue: number;
};

export function SummaryChart({ chartData, gaugeValue }: SummaryChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              return name === "Industry Average"
                ? [`${(v / 1000).toFixed(1)}K`, name]
                : [`${v}%`, name];
            }}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="linear"
            dataKey="btcPrice"
            name="Industry Average"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="linear"
            dataKey="fearGreed"
            name="Overall Score %"
            stroke={getGaugeColor(gaugeValue)}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
