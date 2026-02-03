"use client";

import { useMemo, useCallback, useState } from "react";
import type { SkillgraphTeamRow, SkillgraphTableFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { DomainDistributionBar } from "./DomainDistributionBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";

const FILTER_TABS: { key: SkillgraphTableFilter; label: string }[] = [
  { key: "mostDomains", label: "Most Domains" },
  { key: "leastDomains", label: "Least Domains" },
  { key: "mostSkills", label: "Most Skills" },
  { key: "leastSkills", label: "Least Skills" },
];

function sortFunction(rows: SkillgraphTeamRow[], filter: SkillgraphTableFilter): SkillgraphTeamRow[] {
  const copy = [...rows];
  if (filter === "mostDomains") return copy.sort((a, b) => b.domainCount - a.domainCount);
  if (filter === "leastDomains") return copy.sort((a, b) => a.domainCount - b.domainCount);
  if (filter === "mostSkills") return copy.sort((a, b) => b.skillCount - a.skillCount);
  if (filter === "leastSkills") return copy.sort((a, b) => a.skillCount - b.skillCount);
  return copy;
}

type SkillgraphByTeamTableProps = {
  rows: SkillgraphTeamRow[];
  activeFilter?: SkillgraphTableFilter;
  onFilterChange?: (filter: SkillgraphTableFilter) => void;
  visibleTeams?: Record<string, boolean>;
  onVisibilityChange?: (teamName: string, visible: boolean) => void;
};

export function SkillgraphByTeamTable({
  rows,
  activeFilter = "mostDomains",
  onFilterChange,
  visibleTeams: externalVisibleTeams,
  onVisibilityChange,
}: SkillgraphByTeamTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r) => { init[r.teamName] = true; });
    return init;
  });

  const visibleTeams = externalVisibleTeams ?? internalVisible;

  const toggleVisibility = useCallback((teamName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(teamName, visibleTeams[teamName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [teamName]: !prev[teamName] }));
    }
  }, [visibleTeams, onVisibilityChange]);

  const columns = useMemo<BaseTeamsTableColumn<SkillgraphTeamRow, SkillgraphTableFilter>[]>(() => [
    {
      key: "view",
      header: "",
      className: "w-14",
      render: (row) => (
        <VisibilityToggleButton
          isVisible={visibleTeams[row.teamName] !== false}
          onToggle={() => toggleVisibility(row.teamName)}
        />
      ),
    },
    {
      key: "rank",
      header: "Rank",
      className: "w-14",
      render: (_, index) => {
        const rank = index + 1;
        return (
          <span className={rank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
            {rank}
          </span>
        );
      },
    },
    {
      key: "team",
      header: "Team",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`size-4 rounded shrink-0 ${row.teamColor}`} aria-hidden />
          <p className="font-medium text-gray-900">{row.teamName}</p>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      className: "text-left",
      render: (row) => <span className="text-gray-900">{row.domainCount}</span>,
    },
    {
      key: "skill",
      header: "Skill",
      className: "text-left",
      render: (row) => <span className="text-gray-900">{row.skillCount}</span>,
    },
    {
      key: "distribution",
      header: "Domain Distribution",
      className: "text-right min-w-[260px]",
      render: (row) =>
        row.domainDistribution ? (
          <DomainDistributionBar segments={row.domainDistribution} getColor={getColorForDomain} />
        ) : null,
    },
  ], [visibleTeams, toggleVisibility]);

  return (
    <BaseTeamsTable<SkillgraphTeamRow, SkillgraphTableFilter>
      rows={rows}
      filterTabs={FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostDomains"
      sortFunction={sortFunction}
      columns={columns}
      getRowKey={(row) => row.teamName}
    />
  );
}
