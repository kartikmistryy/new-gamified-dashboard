"use client";

import { Layers, Users } from "lucide-react";
import { RepoHealthBar } from "@/components/dashboard/shared/RepoHealthBar";
import {
  type SpofRiskLevel,
  ORG_SPOF_RISK_LEVEL,
  ORG_SPOF_TOTALS,
  ORG_HEALTH_SEGMENTS,
} from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";

const RISK_LEVEL_COLORS: Record<SpofRiskLevel, string> = {
  Severe: "text-red-600",
  High: "text-orange-500",
  Medium: "text-amber-500",
  Low: "text-green-600",
};

const RISK_LEVELS: SpofRiskLevel[] = ["Severe", "High", "Medium", "Low"];

export function OverviewSpofSummary() {
  const { healthy, needsAttention, critical } = ORG_SPOF_TOTALS.healthDistribution;
  const total = healthy + needsAttention + critical;
  const atRiskPercent = Math.round(((needsAttention + critical) / total) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Risk Indicator */}
      <div>
        <p className="text-xs text-gray-500 mb-2">SPOF Risk is:</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-3xl font-bold ${RISK_LEVEL_COLORS[ORG_SPOF_RISK_LEVEL]}`}>
            {ORG_SPOF_RISK_LEVEL}
          </span>
          <span className="text-xs text-gray-500">({atRiskPercent}% at-risk)</span>
        </div>

        {/* Spectrum bar */}
        <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-red-500" style={{ width: "25%" }} />
          <div className="h-full bg-orange-400" style={{ width: "25%" }} />
          <div className="h-full bg-amber-400" style={{ width: "25%" }} />
          <div className="h-full bg-green-500" style={{ width: "25%" }} />
        </div>
        <div className="flex justify-between text-[10px]">
          {RISK_LEVELS.map((level) => (
            <span
              key={level}
              className={level === ORG_SPOF_RISK_LEVEL ? "font-bold text-gray-700" : "text-gray-400"}
            >
              {level}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-500">SPOF by Module</p>
            <p className="text-lg font-bold text-gray-900">{ORG_SPOF_TOTALS.spofModuleCount}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Users className="size-4 text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-500">Unique SPOF Owner</p>
            <p className="text-lg font-bold text-gray-900">{ORG_SPOF_TOTALS.uniqueSpofOwnerCount}</p>
          </div>
        </div>
      </div>

      {/* Health bar */}
      <RepoHealthBar segments={ORG_HEALTH_SEGMENTS} />
    </div>
  );
}
