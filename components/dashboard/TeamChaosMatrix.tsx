"use client";

import { useId } from "react";
import type { ChaosPoint, ChaosTimeRangeKey } from "@/lib/orgDashboard/chaosMatrixData";
import { CATEGORY_COLORS } from "@/lib/orgDashboard/chaosMatrixData";
import { ChaosMatrix } from "@/components/dashboard/ChaosMatrix";
import { getTeamAvatarUrl } from "@/components/shared/TeamAvatar";

const AVATAR_SIZE = 22;
const AVATAR_STROKE = 2.5;

type TeamChaosMatrixProps = {
  data?: ChaosPoint[];
  range?: ChaosTimeRangeKey;
  visibleTeams?: Record<string, boolean>;
  teamNames?: string[];
};

export function TeamChaosMatrix({ data, range, visibleTeams, teamNames }: TeamChaosMatrixProps) {
  const clipId = useId().replace(/:/g, "");

  return (
    <ChaosMatrix
      data={data}
      range={range}
      visibleTeams={visibleTeams}
      teamNames={teamNames}
      tooltipTeamLabel="Person"
      renderPoint={(point, index, handlers) => {
        const href = getTeamAvatarUrl(point.name, 64);
        const half = AVATAR_SIZE / 2;
        const clipPathId = `team-chaos-avatar-${clipId}-${index}`;
        const stackCount = point.stackCount ?? 1;
        const stackIndex = point.stackIndex ?? 0;
        const hasStack = stackCount > 1;
        const angle = (stackIndex / Math.max(stackCount, 1)) * Math.PI * 2;
        const radius = hasStack ? 10 : 0;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const x = point.cx + dx;
        const y = point.cy + dy;
        // Get border color based on category
        const borderColor = CATEGORY_COLORS[point.category];
        return (
          <g {...handlers}>
            <defs>
              <clipPath id={clipPathId}>
                <circle cx={x} cy={y} r={half} />
              </clipPath>
            </defs>
            <image
              href={href}
              x={x - half}
              y={y - half}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              clipPath={`url(#${clipPathId})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle
              cx={x}
              cy={y}
              r={half}
              fill="none"
              stroke={borderColor}
              strokeWidth={AVATAR_STROKE}
            />
          </g>
        );
      }}
    />
  );
}
