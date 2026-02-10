"use client";

import { useMemo } from "react";
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
import type { MemberPerformanceDataPoint, ViewMode } from "@/lib/teamDashboard/performanceTypes";
import type { MemberPerformanceRow } from "@/lib/teamDashboard/types";
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

type MemberPerformanceChartProps = {
  data: MemberPerformanceDataPoint[];
  members: MemberPerformanceRow[];
  viewMode: ViewMode;
  visibleMembers: Set<string>;
  timeRange: TimeRangeKey;
};

// Define member line colors using dashboard palette
const MEMBER_LINE_COLORS = [
  DASHBOARD_COLORS.excellent,
  DASHBOARD_COLORS.warning,
  DASHBOARD_COLORS.danger,
  DASHBOARD_COLORS.caution,
  DASHBOARD_COLORS.stable,
  "#2563eb",
];

export function MemberPerformanceChart({
  data,
  members,
  viewMode,
  visibleMembers,
  timeRange,
}: MemberPerformanceChartProps) {
  // Assign colors to members by cycling through palette
  const memberColors = useMemo(() => {
    const colors = new Map<string, string>();
    members.forEach((member, index) => {
      colors.set(member.memberName, MEMBER_LINE_COLORS[index % MEMBER_LINE_COLORS.length]);
    });
    return colors;
  }, [members]);

  // Transform data based on view mode
  const chartData = useMemo(() => {
    if (viewMode === "aggregate") {
      return data.map((point) => ({
        date: point.date,
        teamAverage: point.value,
      }));
    } else {
      // Individual mode: spread member values as separate keys
      return data.map((point) => ({
        date: point.date,
        ...point.memberValues,
      }));
    }
  }, [data, viewMode]);

  // Format X-axis based on time range
  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    if (timeRange === "1m" || timeRange === "3m") {
      // MM/DD format
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    } else {
      // Mon YYYY format
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  };

  // Format tooltip label
  const formatTooltipLabel = (label: any) => {
    if (typeof label !== "string") return String(label);
    const d = new Date(label);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No data available for selected time range</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#9ca3af"
          style={{ fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="#9ca3af"
          style={{ fontSize: 11 }}
          label={{ value: "Performance Value", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: 12,
          }}
          labelFormatter={formatTooltipLabel}
        />
        {viewMode === "aggregate" ? (
          <Line
            type="monotone"
            dataKey="teamAverage"
            name="Team Average"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        ) : (
          <>
            <Legend />
            {members
              .filter((member) => visibleMembers.has(member.memberName))
              .map((member) => (
                <Line
                  key={member.memberName}
                  type="monotone"
                  dataKey={member.memberName}
                  name={member.memberName}
                  stroke={memberColors.get(member.memberName)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              ))}
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
