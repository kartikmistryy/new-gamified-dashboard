"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { SkillgraphByTeamTable } from "@/components/dashboard/SkillgraphByTeamTable";
import { SkillgraphBySkillTable } from "@/components/dashboard/SkillgraphBySkillTable";
import {
  getMemberSkillsData,
  getMemberSkillRows,
  computeDomainWeights,
  type MemberSkillsRow,
} from "@/lib/teamDashboard/skillsMockData";
import {
  getSkillsInsights,
} from "@/lib/teamDashboard/skillsHelpers";
import type { SkillgraphTeamRow } from "@/lib/orgDashboard/types";

function mapMemberRowsToSkillgraphTeams(rows: MemberSkillsRow[]): SkillgraphTeamRow[] {
  return rows.map((row) => ({
    teamName: row.memberName,
    teamColor: "",
    totalUsage: row.totalUsage,
    skillCount: row.skillCount,
    top3WidelyKnown: row.top3WidelyKnown,
    top3Proficient: row.top3Proficient,
    domainDistribution: row.domainDistribution,
    details: row.details,
  }));
}

export default function TeamSkillgraphPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // State
  const [skillgraphView, setSkillgraphView] = useState<"member" | "skill">("member");
  // Data
  const memberSkills = useMemo(() => getMemberSkillsData(teamId, 6), [teamId]);
  const skillRows = useMemo(() => getMemberSkillRows(memberSkills), [memberSkills]);
  const insights = useMemo(() => getSkillsInsights(memberSkills), [memberSkills]);
  const memberRows = useMemo(
    () => mapMemberRowsToSkillgraphTeams(memberSkills),
    [memberSkills]
  );

  const [visibleMembers, setVisibleMembers] = useState<Record<string, boolean>>({});
  const [visibleDomains, setVisibleDomains] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const members: Record<string, boolean> = {};
    memberSkills.forEach((row) => {
      members[row.memberName] = true;
    });
    setVisibleMembers(members);
  }, [memberSkills]);

  useEffect(() => {
    const domains: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      domains[row.skillName] = true;
    });
    setVisibleDomains(domains);
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
            <SkillgraphByTeamTable
              rows={memberRows}
              visibleTeams={visibleMembers}
              onVisibilityChange={(memberName, visible) =>
                setVisibleMembers((prev) => ({ ...prev, [memberName]: visible }))
              }
            />
          ) : (
            <SkillgraphBySkillTable
              rows={skillRows}
              visibleDomains={visibleDomains}
              onVisibilityChange={(skillName, visible) =>
                setVisibleDomains((prev) => ({ ...prev, [skillName]: visible }))
              }
              detailHeaderLabel="Person"
            />
          )}
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
