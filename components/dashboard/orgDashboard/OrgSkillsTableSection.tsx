"use client";

import { useMemo, useState } from "react";
import type { SkillsRoadmapProgressData, RoleRoadmapProgressData } from "@/lib/dashboard/entities/roadmap/types";
import type { OrgSkillTableTab, OrgSkillSortMode } from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { getTotalPeople } from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { Badge } from "@/components/shared/Badge";
import { SkillBasedTable } from "./SkillBasedTable";
import { RoleBasedTable } from "./RoleBasedTable";

// =============================================================================
// Sort helper (works on both data types)
// =============================================================================

const SORT_TABS: { key: OrgSkillSortMode; label: string }[] = [
  { key: "mostUnlocked", label: "Most Unlocked" },
  { key: "mostProficient", label: "Most Proficient" },
];

function sortByMode<
  T extends {
    progressPercent: number;
    developerCounts: { basic: number; intermediate: number; advanced: number };
  },
>(data: T[], sortMode: OrgSkillSortMode): T[] {
  return [...data].sort((a, b) => {
    if (sortMode === "mostProficient") return b.progressPercent - a.progressPercent;
    return getTotalPeople(b.developerCounts) - getTotalPeople(a.developerCounts);
  });
}

// =============================================================================
// OrgSkillsTableSection
// =============================================================================

type OrgSkillsTableSectionProps = {
  tab: OrgSkillTableTab;
  skillData: SkillsRoadmapProgressData[];
  roleData: RoleRoadmapProgressData[];
};

export function OrgSkillsTableSection({ tab, skillData, roleData }: OrgSkillsTableSectionProps) {
  const [sort, setSort] = useState<OrgSkillSortMode>("mostUnlocked");
  const [showAll, setShowAll] = useState(true);

  const sortedSkillData = useMemo(() => {
    const filtered = showAll ? skillData : skillData.filter((s) => getTotalPeople(s.developerCounts) > 0);
    return sortByMode(filtered, sort);
  }, [skillData, sort, showAll]);

  const sortedRoleData = useMemo(() => {
    const filtered = showAll ? roleData : roleData.filter((r) => getTotalPeople(r.developerCounts) > 0);
    return sortByMode(filtered, sort);
  }, [roleData, sort, showAll]);

  return (
    <div className="flex flex-col gap-0">
      {/* Sort filters + separator + Show All */}
      <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
        {SORT_TABS.map((t) => (
          <Badge
            key={t.key}
            onClick={() => setSort(t.key)}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
              sort === t.key
                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </Badge>
        ))}
        <span className="text-gray-300">|</span>
        <Badge
          onClick={() => setShowAll((prev) => !prev)}
          className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
            !showAll
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {showAll ? "Show All" : "Unlocked Only"}
        </Badge>
      </div>

      {/* Table */}
      {tab === "skill" ? (
        <SkillBasedTable data={sortedSkillData} showAll={showAll} />
      ) : (
        <RoleBasedTable data={sortedRoleData} showAll={showAll} />
      )}
    </div>
  );
}
