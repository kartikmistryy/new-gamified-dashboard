/** Custom hook for User Skill Graph table state and logic */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel, getExpandedRowModel, getSortedRowModel, type SortingState } from "@tanstack/react-table";
import type { SkillgraphSkillRow } from "@/lib/orgDashboard/types";
import { createSkillgraphSkillColumns } from "./skillgraphColumns";
import { createOpacityScale } from "./skillgraphTableUtils";

export function useUserSkillTable(skillRows: SkillgraphSkillRow[]) {
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

  const columns = useMemo(() => {
    const allColumns = createSkillgraphSkillColumns({
      toggleVisibility,
      visibleDomains: visibleSkills,
      opacityScale,
    });
    return allColumns.filter((col) => {
      if (col.id === "contributors") return false;
      if ("accessorKey" in col && col.accessorKey === "contributors") return false;
      return true;
    });
  }, [toggleVisibility, visibleSkills, opacityScale]);

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
