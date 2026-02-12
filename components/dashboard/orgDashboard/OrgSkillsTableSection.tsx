"use client";

import { useMemo, useState } from "react";
import {
  type OrgSkillTableTab,
  type OrgSkillSortMode,
  buildSkillBasedData,
  buildRoleBasedData,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";
import { Badge } from "@/components/shared/Badge";
import { SkillBasedTable } from "./SkillBasedTable";
import { RoleBasedTable } from "./RoleBasedTable";

// =============================================================================
// Filter Tabs (same pattern as other dashboard tables)
// =============================================================================

type OrgSkillCombinedFilter =
  | "skill:mostProficient"
  | "skill:mostUnlocked"
  | "role:mostProficient"
  | "role:mostUnlocked";

const SKILL_FILTER_TABS: { key: OrgSkillCombinedFilter; label: string }[] = [
  { key: "skill:mostProficient", label: "Most Proficient" },
  { key: "skill:mostUnlocked", label: "Most Unlocked" },
];

const ROLE_FILTER_TABS: { key: OrgSkillCombinedFilter; label: string }[] = [
  { key: "role:mostProficient", label: "Most Proficient" },
  { key: "role:mostUnlocked", label: "Most Unlocked" },
];

function parseFilter(filter: OrgSkillCombinedFilter): {
  tab: OrgSkillTableTab;
  sort: OrgSkillSortMode;
} {
  const [tab, sort] = filter.split(":") as [OrgSkillTableTab, OrgSkillSortMode];
  return { tab, sort };
}

// =============================================================================
// OrgSkillsTableSection
// =============================================================================

export function OrgSkillsTableSection() {
  const [activeFilter, setActiveFilter] =
    useState<OrgSkillCombinedFilter>("skill:mostProficient");
  const [showAll, setShowAll] = useState(true);

  const { tab, sort } = parseFilter(activeFilter);

  const handleTabSwitch = (newTab: OrgSkillTableTab) => {
    setActiveFilter(`${newTab}:${sort}`);
  };

  const skillData = useMemo(() => buildSkillBasedData(sort), [sort]);
  const roleData = useMemo(() => buildRoleBasedData(sort), [sort]);

  const filterTabs = tab === "skill" ? SKILL_FILTER_TABS : ROLE_FILTER_TABS;

  return (
    <div className="flex flex-col gap-0">
      {/* View mode tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          <Badge
            onClick={() => handleTabSwitch("skill")}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
              tab === "skill"
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Skill-Based
          </Badge>
          <Badge
            onClick={() => handleTabSwitch("role")}
            className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
              tab === "role"
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Role-Based
          </Badge>
        </div>
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

      {/* Sort filter badges (same pattern as other dashboard tables) */}
      <FilterBadges
        filterTabs={filterTabs}
        currentFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* People legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400" /> Basic
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-500" /> Intermediate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-purple-500" /> Advanced
        </span>
      </div>

      {/* Table */}
      {tab === "skill" ? (
        <SkillBasedTable data={skillData} showAll={showAll} />
      ) : (
        <RoleBasedTable data={roleData} showAll={showAll} />
      )}
    </div>
  );
}
