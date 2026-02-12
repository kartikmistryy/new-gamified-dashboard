"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  type OrgSkillTableTab,
  type OrgSkillSortMode,
  buildSkillBasedData,
  buildRoleBasedData,
} from "@/lib/dashboard/entities/roadmap/orgSkillTableData";
import { SkillBasedTable } from "./SkillBasedTable";
import { RoleBasedTable } from "./RoleBasedTable";
import { Button } from "@/components/ui/button";

// =============================================================================
// Constants
// =============================================================================

const TABS: { key: OrgSkillTableTab; label: string }[] = [
  { key: "skill", label: "Skill-Based" },
  { key: "role", label: "Role-Based" },
];

const SORT_OPTIONS: { key: OrgSkillSortMode; label: string }[] = [
  { key: "mostProficient", label: "Most Proficient" },
  { key: "mostUnlocked", label: "Most Unlocked" },
];

// =============================================================================
// OrgSkillsTableSection — Tab switching, sort/filter, renders table
// =============================================================================

export function OrgSkillsTableSection() {
  const [activeTab, setActiveTab] = useState<OrgSkillTableTab>("skill");
  const [sortMode, setSortMode] = useState<OrgSkillSortMode>("mostProficient");
  const [showAll, setShowAll] = useState(true);

  const skillData = useMemo(() => buildSkillBasedData(sortMode), [sortMode]);
  const roleData = useMemo(() => buildRoleBasedData(sortMode), [sortMode]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tab buttons */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right controls: Sort + Filter toggle */}
        <div className="flex items-center gap-3">
          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-4 text-gray-400" aria-hidden />
            <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortMode(opt.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    sortMode === opt.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unlocked filter toggle */}
          <Button
            variant={showAll ? "outline" : "default"}
            size="sm"
            className="text-xs"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show All" : "Unlocked Only"}
          </Button>
        </div>
      </div>

      {/* People legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400" /> Basic
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-500" /> Proficient
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" /> Advanced
        </span>
      </div>

      {/* Table */}
      {activeTab === "skill" ? (
        <SkillBasedTable data={skillData} showAll={showAll} />
      ) : (
        <RoleBasedTable data={roleData} showAll={showAll} />
      )}
    </div>
  );
}
