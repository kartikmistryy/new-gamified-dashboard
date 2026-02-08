"use client";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { SkillGraph } from "@/components/skillmap/SkillGraph";
import { useMemo, useState, useEffect, useCallback } from "react";
import { roadmapData } from "@/components/skillmap/data/data";
import type { SkillgraphSkillRow } from "@/lib/orgDashboard/types";
import { useRouteParams } from "@/lib/RouteParamsProvider";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { createSkillgraphSkillColumns } from "@/lib/dashboard/skillgraphColumns";
import { createOpacityScale } from "@/lib/dashboard/skillgraphTableUtils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "@/components/dashboard/SortableTableHeader";

/**
 * Build user-specific skill rows from roadmap data
 *
 * Generates realistic skill proficiency data for an individual user based on their userId.
 * Users typically specialize in 4 domains (e.g., Frontend, Mobile, Product Design, DevOps).
 * Uses a deterministic algorithm to create variation between users while maintaining realistic distributions.
 *
 * @param userId - The user ID to generate personalized skill data for
 * @returns Array of skill rows with usage, completion, and proficiency data
 */
const buildUserSkillRowsFromRoadmap = (userId: string): SkillgraphSkillRow[] => {
  // Use userId hash to create deterministic but varied data per user
  const userHash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const userSeed = userHash % 1000;

  // Define possible domain specializations (users will have 4 of these)
  // These must match the exact names from roadmapData
  const allDomains = [
    "Frontend",
    "Backend",
    "DevOps",
    "AI & ML",
    "Mobile",
    "Cloud",
    "Testing",
    "Product & Design",
    "Data Engineering",
    "Security",
    "Leadership",
  ];

  // Select 4 domains for this user based on their hash
  const userDomains: string[] = [];
  for (let i = 0; i < 4; i++) {
    const domainIndex = (userSeed + i * 17) % allDomains.length;
    const selectedDomain = allDomains[domainIndex];
    if (!userDomains.includes(selectedDomain)) {
      userDomains.push(selectedDomain);
    }
  }

  // Ensure we have exactly 4 domains
  while (userDomains.length < 4) {
    for (const domain of allDomains) {
      if (!userDomains.includes(domain) && userDomains.length < 4) {
        userDomains.push(domain);
      }
    }
  }

  // Filter roadmap data to only include user's 4 domains
  const userRoadmaps = roadmapData.filter((roadmap) =>
    userDomains.includes(roadmap.name)
  );

  return userRoadmaps.flatMap((roadmap, domainIndex) =>
    roadmap.technologies.map((tech, techIndex) => {
      // Base skill value from roadmap data
      const base = Math.max(1, tech.value || 0);

      // Personalize usage based on user - some users are stronger in certain domains
      const domainAffinity = ((userSeed + domainIndex * 137) % 100) / 100;
      const skillModifier = ((userSeed + techIndex * 47) % 80 + 20) / 100; // 0.2 to 1.0
      const personalizedBase = Math.round(base * domainAffinity * skillModifier);

      // Individual user metrics (not team-based)
      const totalUsage = Math.max(5, Math.round(personalizedBase * 0.8));
      const avgUsage = totalUsage; // For individual user, total = avg

      // Completion varies by skill and user proficiency
      // More experienced users (higher seed) have higher completion rates
      const experienceLevel = (userSeed % 40) / 40; // 0-1 scale
      const skillComplexity = (domainIndex * 7 + techIndex * 5) % 40;
      const baseCompletion = 30 + experienceLevel * 50; // 30-80 base
      const totalSkillCompletion = Math.min(95, Math.round(baseCompletion + (40 - skillComplexity)));

      // Contributors is always 1 for individual user (self)
      const contributors = 1;

      return {
        skillName: tech.name,
        domainName: roadmap.name,
        totalUsage,
        avgUsage,
        totalSkillCompletion,
        contributors,
      };
    })
  );
};

/**
 * User Skills Graph Page Client Component
 *
 * Displays an individual user's technical skill proficiency through:
 * - Interactive SkillGraph visualization showing skill distribution by domain
 * - Detailed skills table with usage metrics and completion progress
 * - Toggle visibility controls to focus on specific skills
 *
 * Follows the established org/team dashboard patterns with user-specific data.
 */
export function UserSkillGraphPageClient() {
  const { userId } = useRouteParams();

  // Generate user-specific skill data
  const skillRows = useMemo(() => {
    if (!userId) return [];
    return buildUserSkillRowsFromRoadmap(userId);
  }, [userId]);

  // Track which skills are visible in the graph
  const [visibleSkills, setVisibleSkills] = useState<Record<string, boolean>>({});

  // Initialize visibleSkills when skillRows changes
  useEffect(() => {
    const init: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      init[row.skillName] = true;
    });
    setVisibleSkills(init);
  }, [skillRows]);

  // Calculate domain weights for the SkillGraph based on visible skills
  const domainWeights = useMemo(() => {
    const totals: Record<string, number> = {};

    skillRows.forEach((row) => {
      // Only include skills that are visible
      if (visibleSkills[row.skillName] !== false) {
        totals[row.domainName] = (totals[row.domainName] ?? 0) + row.totalUsage;
      }
    });

    // Return undefined if no filters applied (shows all)
    const anyHidden = Object.values(visibleSkills).some((value) => value === false);
    return anyHidden ? totals : undefined;
  }, [visibleSkills, skillRows]);

  // Toggle visibility callback
  const toggleVisibility = useCallback((skillName: string) => {
    setVisibleSkills((prev) => ({ ...prev, [skillName]: !prev[skillName] }));
  }, []);

  // Opacity scale for visual feedback
  const opacityScale = useMemo(
    () => createOpacityScale(skillRows.map((row) => row.totalUsage)),
    [skillRows]
  );

  // Create columns without expander
  const columns = useMemo(() => {
    const allColumns = createSkillgraphSkillColumns({
      toggleVisibility,
      visibleDomains: visibleSkills,
      opacityScale,
    });
    // Filter out the expander column (first column with id "expander")
    return allColumns.filter((col) => col.id !== "expander");
  }, [toggleVisibility, visibleSkills, opacityScale]);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalUsage", desc: true },
  ]);

  // Create table instance
  const table = useReactTable({
    data: skillRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (!userId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 px-6 pb-12 bg-white text-gray-900 min-h-screen">
      {/* Skills Graph Visualization */}
      <DashboardSection title="Skills Distribution" className="py-6">
        <div className="flex justify-center">
          <div className="h-[700px] w-[850px] flex items-center justify-center">
            <SkillGraph
              width={700}
              height={700}
              domainWeights={domainWeights}
              skillVisibility={visibleSkills}
            />
          </div>
        </div>
      </DashboardSection>

      {/* Skills Table */}
      <DashboardSection title="Skills" className="py-6">
        <div className="w-full">
          <div className="rounded-sm border-none overflow-hidden bg-white">
            <Table>
              <TableHeader className="border-0">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <SortableTableHeader key={header.id} header={header} />
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-[#E5E5E5] hover:bg-gray-50/80"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`align-middle ${
                            (cell.column.columnDef.meta as { className?: string })?.className ?? ""
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}
