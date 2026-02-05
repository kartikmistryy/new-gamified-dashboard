"use client";

import { useState } from "react";
import type {
  SkillgraphTeamRow,
  SkillgraphTableFilter,
  SkillgraphSkillRow,
  SkillgraphSkillFilter,
} from "@/lib/orgDashboard/types";
import { SkillgraphByTeamTable } from "./SkillgraphByTeamTable";
import { SkillgraphBySkillTable } from "./SkillgraphBySkillTable";

type SkillgraphTeamsTableProps = {
  rows: SkillgraphTeamRow[];
  skillRows?: SkillgraphSkillRow[];
  activeFilter?: SkillgraphTableFilter;
  onFilterChange?: (filter: SkillgraphTableFilter) => void;
  visibleTeams?: Record<string, boolean>;
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
  visibleDomains?: Record<string, boolean>;
  onDomainVisibilityChange?: (domainName: string, visible: boolean) => void;
};

export function SkillgraphTeamsTable({
  rows,
  skillRows = [],
  activeFilter = "mostUsage",
  onFilterChange,
  visibleTeams,
  onVisibilityChange,
  visibleDomains,
  onDomainVisibilityChange,
}: SkillgraphTeamsTableProps) {
  const [view, setView] = useState<"team" | "skill">("team");
  const [skillFilter, setSkillFilter] = useState<SkillgraphSkillFilter>("mostUsage");

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setView("team")}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
              view === "team" ? "bg-white shadow text-gray-900" : "text-gray-600"
            }`}
          >
            By Team
          </button>
          <button
            type="button"
            onClick={() => setView("skill")}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
              view === "skill" ? "bg-white shadow text-gray-900" : "text-gray-600"
            }`}
          >
            By Skill
          </button>
        </div>
      </div>

      {view === "team" ? (
        <SkillgraphByTeamTable
          rows={rows}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          visibleTeams={visibleTeams}
          onVisibilityChange={onVisibilityChange}
        />
      ) : (
        <SkillgraphBySkillTable
          rows={skillRows}
          activeFilter={skillFilter}
          onFilterChange={setSkillFilter}
          visibleDomains={visibleDomains}
          onVisibilityChange={onDomainVisibilityChange}
        />
      )}
    </div>
  );
}
