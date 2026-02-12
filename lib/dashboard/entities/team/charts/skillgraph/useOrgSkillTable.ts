/** Custom hook for Org Skill Graph table state and logic */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { SkillgraphSkillRow } from "@/lib/dashboard/entities/team/types";
import { createSkillgraphSkillColumns } from "@/lib/dashboard/entities/user/charts/skillgraph/skillgraphColumns";
import { createOpacityScale } from "@/lib/dashboard/entities/user/charts/skillgraph/skillgraphTableUtils";

export function useOrgSkillTable(skillRows: SkillgraphSkillRow[]) {
  const [visibleSkills, setVisibleSkills] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: "totalUsage", desc: true }]);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    skillRows.forEach((row) => {
      init[row.skillName] = true;
    });
    setVisibleSkills(init);
  }, [skillRows]);

  const domainWeights = useMemo(() => {
    const totals: Record<string, number> = {};
    skillRows.forEach((row) => {
      if (visibleSkills[row.skillName] !== false) {
        totals[row.domainName] = (totals[row.domainName] ?? 0) + row.totalUsage;
      }
    });
    const anyHidden = Object.values(visibleSkills).some((value) => value === false);
    return anyHidden ? totals : undefined;
  }, [visibleSkills, skillRows]);

  const toggleVisibility = useCallback((skillName: string) => {
    setVisibleSkills((prev) => ({ ...prev, [skillName]: !prev[skillName] }));
  }, []);

  const opacityScale = useMemo(
    () => createOpacityScale(skillRows.map((row) => row.totalUsage)),
    [skillRows]
  );

  const columns = useMemo(
    () =>
      createSkillgraphSkillColumns({
        toggleVisibility,
        visibleDomains: visibleSkills,
        opacityScale,
      }),
    [toggleVisibility, visibleSkills, opacityScale]
  );

  const table = useReactTable({
    data: skillRows,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return { table, visibleSkills, domainWeights };
}
