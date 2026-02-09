"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { ContributorMetricsChart, type ContributorMetricDataPoint } from "./ContributorMetricsChart";

type ContributorMetricsCardProps = {
  contributorName: string;
  contributorAvatar?: string;
  contributorColor?: string;
  rank: number;
  commits: number;
  additions: number;
  deletions: number;
  data: ContributorMetricDataPoint[];
};

export function ContributorMetricsCard({
  contributorName,
  contributorAvatar,
  contributorColor,
  rank,
  commits,
  additions,
  deletions,
  data,
}: ContributorMetricsCardProps) {
  return (
    <div className="w-full h-full max-w-full overflow-hidden rounded-lg bg-white border border-gray-200 p-4 shadow-none">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <UserAvatar name={contributorName} src={contributorAvatar} size="sm" />
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
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[160px]">
        <ContributorMetricsChart
          data={data}
          contributorName={contributorName}
          contributorColor={contributorColor}
          showMiniVersion
        />
      </div>
    </div>
  );
}
