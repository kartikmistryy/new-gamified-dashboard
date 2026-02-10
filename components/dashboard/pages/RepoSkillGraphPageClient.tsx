"use client";

import { useEffect, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSection } from "@/components/dashboard/shared/DashboardSection";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { SkillgraphByTeamTable } from "@/components/dashboard/userDashboard/SkillgraphByTeamTable";
import { SkillgraphBySkillTable } from "@/components/dashboard/userDashboard/SkillgraphBySkillTable";
import {
  getContributorSkillsData,
  getContributorSkillRows,
  computeDomainWeights,
  type ContributorSkillsRow,
} from "@/lib/repoDashboard/skillsMockData";
import {
  getSkillsInsights,
} from "@/lib/repoDashboard/skillsHelpers";
import type { SkillgraphTeamRow } from "@/lib/orgDashboard/types";
import { useRouteParams } from "@/lib/RouteParamsProvider";

function mapContributorRowsToSkillgraphTeams(rows: ContributorSkillsRow[]): SkillgraphTeamRow[] {
  return rows.map((row) => ({
    teamName: row.contributorName,
    teamColor: "",
    totalUsage: row.totalUsage,
    skillCount: row.skillCount,
    top3WidelyKnown: row.top3WidelyKnown,
    top3Proficient: row.top3Proficient,
    domainDistribution: row.domainDistribution,
    details: row.details,
  }));
}

export function RepoSkillGraphPageClient() {
  const { repoId } = useRouteParams();

  // State
  const [skillgraphView, setSkillgraphView] = useState<"contributor" | "skill">("contributor");
  // Data
  const contributorSkills = useMemo(() => getContributorSkillsData(repoId!, 6), [repoId]);
  const skillRows = useMemo(() => getContributorSkillRows(contributorSkills), [contributorSkills]);
  const insights = useMemo(() => getSkillsInsights(contributorSkills), [contributorSkills]);
  const contributorRows = useMemo(
    () => mapContributorRowsToSkillgraphTeams(contributorSkills),
    [contributorSkills]
  );

  const [visibleContributors, setVisibleContributors] = useState<Record<string, boolean>>({});
  const [visibleDomains, setVisibleDomains] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const contributors: Record<string, boolean> = {};
    contributorSkills.forEach((row) => {
      contributors[row.contributorName] = true;
    });
    setVisibleContributors(contributors);
  }, [contributorSkills]);

  useEffect(() => {
    const domains: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      domains[row.skillName] = true;
    });
    setVisibleDomains(domains);
  }, [skillRows]);

  const domainWeights = useMemo(
    () => computeDomainWeights(contributorSkills, visibleContributors),
    [contributorSkills, visibleContributors]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
        <DashboardSection title="Repository Skills Graph" className="py-6">
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
          title={skillgraphView === "contributor" ? "Repository Contributors" : "Skills"}
          className="py-6"
          actionLayout="row"
          action={
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setSkillgraphView("contributor")}
                className={`px-4 py-2 text-xs font-semibold shadow-none rounded-full transition ${
                  skillgraphView === "contributor" ? "bg-white text-gray-900" : "text-gray-600"
                }`}
              >
                By Contributor
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
          {skillgraphView === "contributor" ? (
            <SkillgraphByTeamTable
              rows={contributorRows}
              visibleTeams={visibleContributors}
              onVisibilityChange={(contributorName, visible) =>
                setVisibleContributors((prev) => ({ ...prev, [contributorName]: visible }))
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
