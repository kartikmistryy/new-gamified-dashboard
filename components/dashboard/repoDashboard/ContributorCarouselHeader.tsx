/**
 * ContributorCarouselHeader Component
 *
 * Displays contributor identity and key performance metrics in the carousel.
 *
 * Features:
 * - Avatar display with fallback generation
 * - Contributor name and rank
 * - Key metrics grid (commits, additions, deletions, score)
 * - Trend indicator (up/down/flat)
 * - Responsive layout
 * - Accessible metric labels
 *
 * Type Safety:
 * - Accepts ContributorWithMetrics for full type safety
 * - Uses DEFAULT_METRIC_FORMATTERS for consistent formatting
 * - Type-safe trend color mapping
 */

"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import type { ContributorCarouselHeaderProps } from "@/lib/dashboard/repoDashboard/contributorCarousel";
import { DEFAULT_METRIC_FORMATTERS } from "@/lib/dashboard/repoDashboard/contributorCarousel";

/**
 * Trend icon mapping for type-safe trend indicators
 */
const TREND_CONFIG = {
  up: {
    Icon: ArrowUpIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Improving",
  },
  down: {
    Icon: ArrowDownIcon,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Declining",
  },
  flat: {
    Icon: MinusIcon,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    label: "Stable",
  },
} as const;

/**
 * ContributorCarouselHeader Component
 *
 * Renders the header section of a carousel slide with contributor
 * identity, avatar, rank, and key performance metrics.
 *
 * @example
 * ```tsx
 * <ContributorCarouselHeader
 *   contributor={{
 *     id: "123",
 *     name: "Alice Johnson",
 *     avatar: "alice.jpg",
 *     rank: 1,
 *     commits: 245,
 *     additions: 12500,
 *     deletions: 3200,
 *     score: 87,
 *     trend: "up"
 *   }}
 * />
 * ```
 */
export function ContributorCarouselHeader({
  contributor,
  className = "",
}: ContributorCarouselHeaderProps) {
  const { name, avatar, rank, commits, additions, deletions, score, trend = "flat" } = contributor;

  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.Icon;

  return (
    <div
      className={`flex flex-col gap-4 p-6 bg-white border-b border-gray-200 ${className}`}
      role="group"
      aria-label={`${name} performance summary`}
    >
      {/* Contributor Identity Row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <UserAvatar name={name} src={avatar} size="lg" className="size-16" />

        {/* Name, Rank, and Trend */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900 truncate">{name}</h3>
            {/* Rank Badge */}
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              aria-label={`Rank ${rank}`}
            >
              {DEFAULT_METRIC_FORMATTERS.rank(rank)}
            </span>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${trendConfig.bgColor}`}
              aria-label={`Performance trend: ${trendConfig.label}`}
            >
              <TrendIcon className={`size-4 ${trendConfig.color}`} aria-hidden="true" />
              <span className={`text-xs font-medium ${trendConfig.color}`}>
                {trendConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Commits Metric */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Commits
          </span>
          <span className="text-2xl font-bold text-gray-900 mt-1" aria-label={`${commits} commits`}>
            {DEFAULT_METRIC_FORMATTERS.commits(commits)}
          </span>
        </div>

        {/* Additions Metric */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Additions
          </span>
          <span
            className="text-2xl font-bold text-green-600 mt-1"
            aria-label={`${additions} lines added`}
          >
            {DEFAULT_METRIC_FORMATTERS.additions(additions)}
          </span>
        </div>

        {/* Deletions Metric */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Deletions
          </span>
          <span
            className="text-2xl font-bold text-red-600 mt-1"
            aria-label={`${deletions} lines deleted`}
          >
            {DEFAULT_METRIC_FORMATTERS.deletions(deletions)}
          </span>
        </div>

        {/* Score Metric */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Score</span>
          <span
            className="text-2xl font-bold text-blue-600 mt-1"
            aria-label={`Performance score ${score}`}
          >
            {DEFAULT_METRIC_FORMATTERS.score(score)}
          </span>
        </div>
      </div>
    </div>
  );
}
