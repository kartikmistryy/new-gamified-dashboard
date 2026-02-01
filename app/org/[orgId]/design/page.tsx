"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { formatOrgTitle } from "@/lib/orgDashboard/utils";
import { CRYPTO_ROWS } from "@/lib/orgDashboard/constants";
import {
  SUMMARY_CARD_CONFIGS,
  UPPER_LEFT_OUTLIERS,
  LOWER_RIGHT_OUTLIERS,
} from "@/lib/orgDashboard/designMockData";
import { OrganizationSummaryHeader } from "@/components/dashboard/OrganizationSummaryHeader";
import { KarmaPointsScatterChart } from "@/components/dashboard/KarmaPointsScatterChart";
import { NeedAttentionCard } from "@/components/dashboard/NeedAttentionCard";
import { TeamTable } from "@/components/dashboard/TeamTable";
import {
  Star,
  AlertTriangle,
  Briefcase,
  Building2,
  TrendingUp,
  Bomb,
} from "lucide-react";
import type { SummaryCardKey } from "@/lib/orgDashboard/types";

const SUMMARY_ICONS: Record<SummaryCardKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  star: Star,
  "key-player": AlertTriangle,
  bottleneck: Briefcase,
  stable: Building2,
  risky: TrendingUp,
  "time-bomb": Bomb,
};

export default function OrgDesignPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) ?? "org";
  const orgTitle = formatOrgTitle(orgId);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 bg-white text-gray-900 min-h-screen">
        <Card className="bg-white pt-0 pb-0 w-full border-none shadow-none">
          <OrganizationSummaryHeader
            title={`Organization X Design`}
            tooltip={{
              title: `${orgTitle} Org Design`,
              description:
                "Summary of org segments (Star, Key Player, Bottleneck, Stable, Risky, Time Bomb), KarmaPoints vs Ownership scatter, outlier attention cards, and asset table.",
            }}
          />
          <CardContent className="space-y-8 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUMMARY_CARD_CONFIGS.map((item) => {
                const Icon = SUMMARY_ICONS[item.key];
                return (
                  <Card
                    key={item.key}
                    className={`${item.bg} border-0 shadow-sm overflow-hidden`}
                  >
                    <CardContent className="px-4 flex flex-col items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md bg-white/60 ${item.iconColor}`}>
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{item.title}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900 ml-2">
                        {item.count} ({item.pct}%)
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="w-full">
              <KarmaPointsScatterChart timeRange="all" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NeedAttentionCard
                count={16}
                title="Upper-left outliers (Low KP / High Ownership)"
                subtitle="Unusually high ownership with low output."
                outliers={UPPER_LEFT_OUTLIERS}
                deltaPositive={true}
                reasons={
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>
                      Knowledge is concentrated in critical modules, and time may be consumed by{" "}
                      <span className="font-semibold text-gray-700">reviews / support / on-call</span>.
                    </li>
                    <li>
                      High ownership with low output can indicate{" "}
                      <span className="font-semibold text-gray-700">high-risk areas</span> where changes are costly, gated, or have long lead times.
                    </li>
                  </ul>
                }
              />
              <NeedAttentionCard
                count={2}
                title="Lower-right outliers (High KP / Low Ownership)"
                subtitle="Unusually high output with low ownership/impact."
                outliers={LOWER_RIGHT_OUTLIERS}
                deltaPositive={false}
                reasons={
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>
                      High output may be concentrated in peripheral /{" "}
                      <span className="font-semibold text-gray-700">non-critical</span> work (bulk updates, cleanup, migrations), so ownership doesn&apos;t rise accordingly.
                    </li>
                    <li>
                      It can also signal{" "}
                      <span className="font-semibold text-gray-700">high churn / low-quality output</span> (lots of activity, limited durable impact).
                    </li>
                  </ul>
                }
              />
            </div>

            <Card className="bg-white py-10 px-6 w-full border-none shadow-none">
              <TeamTable rows={CRYPTO_ROWS} />
            </Card>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
