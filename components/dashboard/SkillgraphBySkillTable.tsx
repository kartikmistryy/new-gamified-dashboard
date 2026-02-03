"use client";

import { useMemo, useCallback, useState } from "react";
import type { SkillgraphSkillRow, SkillgraphSkillFilter } from "@/lib/orgDashboard/types";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import { DomainDistributionBar } from "./DomainDistributionBar";
import { VisibilityToggleButton } from "./VisibilityToggleButton";
import { getColorForDomain } from "@/components/skillmap/skillGraphUtils";

const FILTER_TABS: { key: SkillgraphSkillFilter; label: string }[] = [
  { key: "mostCommon", label: "Most Common" },
  { key: "leastCommon", label: "Least Common" },
  { key: "mostProficient", label: "Most Proficient" },
  { key: "leastProficient", label: "Least Proficient" },
];

function sortFunction(rows: SkillgraphSkillRow[], filter: SkillgraphSkillFilter): SkillgraphSkillRow[] {
  const copy = [...rows];
  if (filter === "mostCommon") return copy.sort((a, b) => b.skillCount - a.skillCount);
  if (filter === "leastCommon") return copy.sort((a, b) => a.skillCount - b.skillCount);
  if (filter === "mostProficient") return copy.sort((a, b) => b.domainCount - a.domainCount);
  if (filter === "leastProficient") return copy.sort((a, b) => a.domainCount - b.domainCount);
  return copy;
}

type SkillgraphBySkillTableProps = {
  rows: SkillgraphSkillRow[];
  activeFilter?: SkillgraphSkillFilter;
  onFilterChange?: (filter: SkillgraphSkillFilter) => void;
  visibleDomains?: Record<string, boolean>;
  onVisibilityChange?: (domainName: string, visible: boolean) => void;
};

export function SkillgraphBySkillTable({
  rows,
  activeFilter = "mostCommon",
  onFilterChange,
  visibleDomains: externalVisibleDomains,
  onVisibilityChange,
}: SkillgraphBySkillTableProps) {
  const [internalVisible, setInternalVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach((r) => { init[r.domainName] = true; });
    return init;
  });

  const visibleDomains = externalVisibleDomains ?? internalVisible;

  const toggleVisibility = useCallback((domainName: string) => {
    if (onVisibilityChange) {
      onVisibilityChange(domainName, visibleDomains[domainName] === false);
    } else {
      setInternalVisible((prev) => ({ ...prev, [domainName]: !prev[domainName] }));
    }
  }, [visibleDomains, onVisibilityChange]);

  const columns = useMemo<BaseTeamsTableColumn<SkillgraphSkillRow, SkillgraphSkillFilter>[]>(() => [
    {
      key: "view",
      header: "",
      className: "w-14",
      render: (row) => (
        <VisibilityToggleButton
          isVisible={visibleDomains[row.domainName] !== false}
          onToggle={() => toggleVisibility(row.domainName)}
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
      key: "domainName",
      header: "Domain",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-4 rounded shrink-0" style={{ backgroundColor: getColorForDomain(row.domainName) }} aria-hidden />
          <p className="font-medium text-gray-900">{row.domainName}</p>
        </div>
      ),
    },
    {
      key: "skillCount",
      header: "Skill",
      className: "text-left",
      render: (row) => <span className="text-gray-900">{row.skillCount}</span>,
    },
    {
      key: "domainCount",
      header: "Domain",
      className: "text-left",
      render: (row) => <span className="text-gray-900">{row.domainCount}</span>,
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
  ], [visibleDomains, toggleVisibility]);

  return (
    <BaseTeamsTable<SkillgraphSkillRow, SkillgraphSkillFilter>
      rows={rows}
      filterTabs={FILTER_TABS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      defaultFilter="mostCommon"
      sortFunction={sortFunction}
      columns={columns}
      getRowKey={(row) => row.domainName}
    />
  );
}
