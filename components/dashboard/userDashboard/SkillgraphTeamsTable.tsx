"use client";

import { useState } from "react";
import type {
  SkillgraphTeamRow,
  SkillgraphSkillRow,
} from "@/lib/orgDashboard/types";
import { SkillgraphByTeamTable } from "./SkillgraphByTeamTable";
import { SkillgraphBySkillTable } from "./SkillgraphBySkillTable";

type SkillgraphTeamsTableProps = {
  rows: SkillgraphTeamRow[];
  skillRows?: SkillgraphSkillRow[];
  visibleTeams?: Record<string, boolean>;
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
  visibleDomains?: Record<string, boolean>;
  onDomainVisibilityChange?: (domainName: string, visible: boolean) => void;
  view?: "team" | "skill";
  onViewChange?: (view: "team" | "skill") => void;
};

export function SkillgraphTeamsTable({
  rows,
  skillRows = [],
  visibleTeams,
  onVisibilityChange,
  visibleDomains,
  onDomainVisibilityChange,
  view: externalView,
  onViewChange,
}: SkillgraphTeamsTableProps) {
  const [internalView, setInternalView] = useState<"team" | "skill">("team");
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  return (
    <div className="w-full">
      {view === "team" ? (
        <SkillgraphByTeamTable
          rows={rows}
          visibleTeams={visibleTeams}
          onVisibilityChange={onVisibilityChange}
        />
      ) : (
        <SkillgraphBySkillTable
          rows={skillRows}
          visibleDomains={visibleDomains}
          onVisibilityChange={onDomainVisibilityChange}
        />
      )}
    </div>
  );
}
