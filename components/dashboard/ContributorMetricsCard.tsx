"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { ContributorMetricsChart } from "./ContributorMetricsChart";

type MetricType = "commits" | "additions" | "deletions";

type TimeSeriesDataPoint = {
  week: string;
  value: number;
};

type ContributorMetricsCardProps = {
  contributorName: string;
  contributorAvatar?: string;
  rank: number;
  commits: number;
  additions: number;
  deletions: number;
  data: TimeSeriesDataPoint[];
  metricType: MetricType;
};

export function ContributorMetricsCard({
  contributorName,
  contributorAvatar,
  rank,
  commits,
  additions,
  deletions,
  data,
  metricType,
}: ContributorMetricsCardProps) {
  return (
    <div className="w-full rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <UserAvatar name={contributorName} src={contributorAvatar} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{contributorName}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="whitespace-nowrap">{commits.toLocaleString()} commits</span>
              <span className="text-emerald-600 whitespace-nowrap">{additions.toLocaleString()} ++</span>
              <span className="text-red-600 whitespace-nowrap">{deletions.toLocaleString()} --</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">#{rank}</span>
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[140px]">
        <ContributorMetricsChart
          data={data}
          metricType={metricType}
          title=""
          showMiniVersion
        />
      </div>
    </div>
  );
}
