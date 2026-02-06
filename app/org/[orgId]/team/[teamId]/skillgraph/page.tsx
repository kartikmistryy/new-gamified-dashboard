"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { Badge } from "@/components/shared/Badge";
import { TeamAvatar } from "@/components/shared/TeamAvatar";
import {
  getMemberSkillsData,
  getMemberSkillRows,
  computeDomainWeights,
  type MemberSkillsRow,
  type MemberSkillRow,
} from "@/lib/teamDashboard/skillsMockData";
import {
  SKILLS_MEMBER_FILTER_TABS,
  SKILLS_SKILL_FILTER_TABS,
  skillsMemberSortFunction,
  skillsSkillSortFunction,
  getSkillsInsights,
  type SkillsMemberFilter,
  type SkillsSkillFilter,
} from "@/lib/teamDashboard/skillsHelpers";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";

// "By Member" view columns
const MEMBER_VIEW_COLUMNS: BaseTeamsTableColumn<MemberSkillsRow, SkillsMemberFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span
          className={
            displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted
          }
        >
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.memberName} className="size-4" />
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  {
    key: "domains",
    header: "Domains",
    className: "text-right",
    render: (row) => <span className="text-gray-900 font-medium">{row.domainCount}</span>,
  },
  {
    key: "skills",
    header: "Skills",
    className: "text-right",
    render: (row) => <span className="text-gray-900 font-medium">{row.skillCount}</span>,
  },
  {
    key: "totalUsage",
    header: "Total Usage",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{row.totalUsage}</span>,
  },
  {
    key: "avgProficiency",
    header: "Avg Proficiency",
    className: "text-right",
    render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${row.avgProficiency}%` }}
          />
        </div>
        <span className="text-gray-700 font-medium w-10 text-right">{row.avgProficiency}%</span>
      </div>
    ),
  },
];

// "By Skill" view columns
const SKILL_VIEW_COLUMNS: BaseTeamsTableColumn<MemberSkillRow, SkillsSkillFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span
          className={
            displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted
          }
        >
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "skillName",
    header: "Skill Name",
    render: (row) => <span className="font-medium text-gray-900">{row.skillName}</span>,
  },
  {
    key: "domainName",
    header: "Domain",
    render: (row) => <span className="text-gray-700">{row.domainName}</span>,
  },
  {
    key: "totalUsage",
    header: "Total Usage",
    className: "text-right",
    render: (row) => <span className="text-gray-900 font-medium">{row.totalUsage}</span>,
  },
  {
    key: "avgUsage",
    header: "Avg Usage",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{row.avgUsage}</span>,
  },
  {
    key: "skillCompletion",
    header: "Skill Completion",
    className: "text-right",
    render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${row.totalSkillCompletion}%` }}
          />
        </div>
        <span className="text-gray-700 font-medium w-10 text-right">
          {row.totalSkillCompletion}%
        </span>
      </div>
    ),
  },
  {
    key: "contributors",
    header: "Contributors",
    className: "text-right",
    render: (row) => <span className="text-gray-700">{row.contributors}</span>,
  },
];

export default function TeamSkillgraphPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // State
  const [skillgraphView, setSkillgraphView] = useState<"member" | "skill">("member");
  const [memberFilter, setMemberFilter] = useState<SkillsMemberFilter>("mostDomains");
  const [skillFilter, setSkillFilter] = useState<SkillsSkillFilter>("mostUsage");
  // Data
  const memberSkills = useMemo(() => getMemberSkillsData(teamId, 6), [teamId]);
  const skillRows = useMemo(() => getMemberSkillRows(memberSkills), [memberSkills]);
  const insights = useMemo(() => getSkillsInsights(memberSkills), [memberSkills]);

  // Derive visibility state - all visible by default
  const visibleMembers = useMemo(() => {
    const members: Record<string, boolean> = {};
    memberSkills.forEach((row) => {
      members[row.memberName] = true;
    });
    return members;
  }, [memberSkills]);

  const visibleDomains = useMemo(() => {
    const domains: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      domains[row.skillName] = true;
    });
    return domains;
  }, [skillRows]);

  const domainWeights = useMemo(
    () => computeDomainWeights(memberSkills, visibleMembers),
    [memberSkills, visibleMembers]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
        <DashboardSection title="Team Skills Graph" className="py-6">
          <ChartInsights insights={insights} />
        </DashboardSection>

        <DashboardSection title="" className="py-6">
          <div className="flex justify-center">
            <div className="h-[700px] w-[850px] flex items-center justify-center">
              <SkillGraph
                width={700}
                height={700}
                domainWeights={domainWeights}
                skillVisibility={visibleDomains}
              />
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          title={skillgraphView === "member" ? "Team Members" : "Skills"}
          className="py-6"
          actionLayout="row"
          action={
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setSkillgraphView("member")}
                className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                  skillgraphView === "member" ? "bg-white text-gray-900" : "text-gray-600"
                }`}
              >
                By Member
              </button>
              <button
                type="button"
                onClick={() => setSkillgraphView("skill")}
                className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                  skillgraphView === "skill" ? "bg-white text-gray-900" : "text-gray-600"
                }`}
              >
                By Skill
              </button>
            </div>
          }
        >
          {skillgraphView === "member" ? (
            <BaseTeamsTable<MemberSkillsRow, SkillsMemberFilter>
              rows={memberSkills}
              filterTabs={SKILLS_MEMBER_FILTER_TABS}
              activeFilter={memberFilter}
              onFilterChange={setMemberFilter}
              defaultFilter="mostDomains"
              sortFunction={skillsMemberSortFunction}
              columns={MEMBER_VIEW_COLUMNS}
              getRowKey={(row) => row.memberName}
            />
          ) : (
            <BaseTeamsTable<MemberSkillRow, SkillsSkillFilter>
              rows={skillRows}
              filterTabs={SKILLS_SKILL_FILTER_TABS}
              activeFilter={skillFilter}
              onFilterChange={setSkillFilter}
              defaultFilter="mostUsage"
              sortFunction={skillsSkillSortFunction}
              columns={SKILL_VIEW_COLUMNS}
              getRowKey={(row) => `${row.domainName}:${row.skillName}`}
            />
          )}
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
