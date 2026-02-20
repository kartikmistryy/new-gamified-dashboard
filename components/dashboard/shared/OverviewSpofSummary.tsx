"use client";

import { Layers, Users } from "lucide-react";
import { RepoHealthBar, type RepoHealthSegment } from "@/components/dashboard/shared/RepoHealthBar";
import type { SpofRiskLevel } from "@/lib/dashboard/entities/team/data/orgSpofDataLoader";
import { STATUS_COLORS } from "@/lib/dashboard/shared/utils/colors";

const RISK_LEVEL_COLORS: Record<SpofRiskLevel, string> = {
  Severe: STATUS_COLORS.critical.text,
  High: "text-[#e87b35]",
  Medium: STATUS_COLORS.attention.text,
  Low: STATUS_COLORS.healthy.text,
};

const RISK_LEVELS: SpofRiskLevel[] = ["Severe", "High", "Medium", "Low"];

type Props = {
  riskLevel: SpofRiskLevel;
  atRiskPercent: number;
  spofModuleCount: number;
  uniqueSpofOwnerCount: number;
  healthSegments: RepoHealthSegment[];
};

export function OverviewSpofSummary({
  riskLevel,
  atRiskPercent,
  spofModuleCount,
  uniqueSpofOwnerCount,
  healthSegments,
}: Props) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      {/* Risk Indicator */}
      <div>
        <p className="text-xs text-gray-500 mb-2">SPOF Risk is:</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-3xl font-bold ${RISK_LEVEL_COLORS[riskLevel]}`}>
            {riskLevel}
          </span>
          <span className="text-xs text-gray-500">({atRiskPercent}% at-risk)</span>
        </div>

        {/* Spectrum bar */}
        <div className="flex h-3 w-full rounded-full overflow-hidden mb-1.5">
          <div className={`h-full ${STATUS_COLORS.critical.fill}`} style={{ width: "25%" }} />
          <div className="h-full bg-[#e87b35]" style={{ width: "25%" }} />
          <div className={`h-full ${STATUS_COLORS.attention.fill}`} style={{ width: "25%" }} />
          <div className={`h-full ${STATUS_COLORS.healthy.fill}`} style={{ width: "25%" }} />
        </div>
        <div className="flex justify-between text-[10px]">
          {RISK_LEVELS.map((level) => (
            <span
              key={level}
              className={level === riskLevel ? "font-bold text-gray-700" : "text-gray-400"}
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
            <p className="text-lg font-bold text-gray-900">{spofModuleCount}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Users className="size-4 text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-500">Unique SPOF Owner</p>
            <p className="text-lg font-bold text-gray-900">{uniqueSpofOwnerCount}</p>
          </div>
        </div>
      </div>

      {/* Health bar */}
      <RepoHealthBar segments={healthSegments} />
    </div>
  );
}
