"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OutlierRow } from "@/lib/orgDashboard/types";

type NeedAttentionCardProps = {
  count: number;
  title: string;
  subtitle: string;
  outliers: OutlierRow[];
  deltaPositive: boolean;
  reasons: React.ReactNode;
};

export function NeedAttentionCard({
  count,
  title,
  subtitle,
  outliers,
  deltaPositive,
  reasons,
}: NeedAttentionCardProps) {
  const deltaClassName = deltaPositive
    ? "text-xs font-medium text-green-600"
    : "text-xs font-medium text-red-600";

  return (
    <Card className="overflow-hidden border border-red-100 shadow-sm gap-0 bg-red-50/50 py-4">
      <div className="px-4 flex items-center justify-between">
        <span className="font-semibold text-xs py-1 px-2 bg-red-100 border border-red-100 rounded-full text-red-900">
          Need attention
        </span>
        <div className="text-xs font-medium text-gray-400 text-end">
          Count <span className="text-red-900 font-bold text-2xl block">{count}</span>
        </div>
      </div>
      <CardHeader className="pb-6 px-4 pt-2">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 px-4 pb-4">
        <div className="rounded-md border border-gray-200">
          <p
            id="outlier-list-label"
            className="text-xs px-2 py-1 font-semibold text-gray-700 sticky top-0 bg-white  z-10 rounded-t-md"
          >
            Outlier list
          </p>
          <ul
            className="max-h-56 overflow-y-auto   bg-white divide-y divide-gray-100 rounded-b-md"
            aria-labelledby="outlier-list-label"
          >
            {outliers.map((o, i) => (
              <li
                key={`${o.name}-${i}`}
                className="flex justify-between items-center py-0 px-3 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-900">{o.name}</p>
                  <p className="text-xs text-gray-600">{o.role}</p>
                </div>
                <div className="text-right flex flex-col gap-2 py-1 justify-end">
                  <span className="flex flex-row gap-2">
                    <p className="text-xs font-semibold text-gray-900">KP {o.kp}</p>
                    <p className="text-xs text-gray-600">Own {o.own}</p>
                  </span>
                  <span className={deltaClassName}>Δ {o.delta}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-2">
          <p className="text-sm font-bold text-gray-900">Possible reasons</p>
          {reasons}
        </div>
      </CardContent>
    </Card>
  );
}
