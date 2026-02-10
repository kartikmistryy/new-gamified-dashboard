"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ContributorMetricsChart, type ContributorMetricDataPoint } from "@/components/dashboard/ContributorMetricsChart";

type ContributorCardData = {
  id: string;
  name: string;
  rank: number;
  score: number;
  chartData: ContributorMetricDataPoint[];
  contributorColor?: string;
  positiveScore?: number;
  penaltyScore?: number;
};

type ContributorCardsCarouselProps = {
  contributors: ContributorCardData[];
  className?: string;
};

/**
 * Get rank badge styling
 */
function getRankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (rank === 2) return "bg-gray-100 text-gray-700 border-gray-200";
  if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

/**
 * Get contributor color based on rank
 */
function getContributorColor(rank: number, customColor?: string): string {
  if (customColor) return customColor;

  // Assign colors based on rank
  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
  ];

  return colors[(rank - 1) % colors.length];
}

/**
 * Contributor Mini Card Component
 */
function ContributorCard({ contributor }: { contributor: ContributorCardData }) {
  const rankBadgeClass = getRankBadgeClass(contributor.rank);
  const contributorColor = getContributorColor(contributor.rank, contributor.contributorColor);

  return (
    <Card className="h-full border border-gray-20 gap-3 rounded-md px-3 pt-3 pb-0">
      <CardHeader className="p-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <UserAvatar userName={contributor.name} className="size-8 shrink-0" />

          {/* Name and Rank */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {contributor.name}
            </h3>
            {/* Users positive and penalty scores */}
            <div className="flex items-center gap-2 mt-1">
              {contributor.positiveScore !== undefined && (
                <span className="text-xs font-semibold text-emerald-600">
                  +{contributor.positiveScore.toLocaleString()}
                </span>
              )}
              {contributor.penaltyScore !== undefined && (
                <span className="text-xs font-semibold text-red-600">
                  -{contributor.penaltyScore.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Badge
              variant="outline"
              className={`text-xs font-medium rounded-full border mt-1 ${rankBadgeClass}`}
            >
              #{contributor.rank}
            </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mini Chart Visualization */}
          <ContributorMetricsChart
            data={contributor.chartData}
            contributorName={contributor.name}
            contributorColor={contributorColor}
            showMiniVersion={true}
            height={160}
          />
      </CardContent>
    </Card>
  );
}

/**
 * Contributor Cards Carousel Component
 *
 * Displays mini contributor cards in a carousel, showing 3 cards at once.
 * Uses shadcn Carousel and Card components.
 */
export function ContributorCardsCarousel({
  contributors,
  className = "",
}: ContributorCardsCarouselProps) {
  // Empty state
  if (contributors.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">No contributors available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full px-4 overflow-visible ${className}`}>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
                <div className="relative w-fit h-fit flex justify-end items-end gap-2 ml-auto">
                  <CarouselPrevious className="left-0 relative"/>
                  <CarouselNext className="right-0 relative" />
                </div>
        <CarouselContent>
          {contributors.map((contributor) => (
            <CarouselItem
              key={contributor.id}
              className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <ContributorCard contributor={contributor} />
            </CarouselItem>
          ))}
        </CarouselContent>

      </Carousel>
    </div>
  );
}
