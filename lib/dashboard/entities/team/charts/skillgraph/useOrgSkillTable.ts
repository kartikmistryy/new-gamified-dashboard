/** Custom hook for Org Skill Graph table state and logic */

import { useMemo, useState } from "react";
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

const HIDDEN_COLUMNS = new Set(["view"]);

export function useOrgSkillTable(skillRows: SkillgraphSkillRow[]) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "totalUsage", desc: true }]);

  const opacityScale = useMemo(
    () => createOpacityScale(skillRows.map((row) => row.totalUsage)),
    [skillRows]
  );

  const columns = useMemo(() => {
    const allColumns = createSkillgraphSkillColumns({
      toggleVisibility: () => {},
      visibleDomains: {},
      opacityScale,
    });
    return allColumns.filter((col) => !HIDDEN_COLUMNS.has(col.id ?? ""));
  }, [opacityScale]);

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

  return { table };
}
