"use client";
"use no memo";

import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "@/components/dashboard/shared/SortableTableHeader";
import { ModuleDetailSheet } from "./ModuleDetailSheet";
import type { ModuleSPOFData } from "@/lib/userDashboard/types";
import {
  filterModules,
  sortModulesByRisk,
  type ModuleFilter,
  MODULE_FILTER_TABS,
} from "@/lib/userDashboard/userSpofHelpers";
import { FilterBadges } from "@/components/dashboard/shared/FilterBadges";
import { createModuleColumns } from "@/lib/userDashboard/moduleTableColumns";

type ModulesTableProps = {
  modules: ModuleSPOFData[];
  currentUserId?: string;
};

/** Modules Table Component - displays sortable, filterable module ownership and SPOF risk */
export function ModulesTable({ modules, currentUserId }: ModulesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleSPOFData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ModuleFilter>("all");

  const displayedModules = useMemo(() => {
    const filtered = filterModules(modules, currentFilter, currentUserId);
    return sortModulesByRisk(filtered);
  }, [modules, currentFilter, currentUserId]);

  const handleRowClick = (module: ModuleSPOFData) => {
    setSelectedModule(module);
    setIsSheetOpen(true);
  };

  const columns = useMemo(() => createModuleColumns(), []);

  const table = useReactTable({
    data: displayedModules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
      <div className="w-full">
        <FilterBadges
          filterTabs={MODULE_FILTER_TABS}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  onClick={() => handleRowClick(row.original)}
                  className="border-none hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as { className?: string })?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ModuleDetailSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} module={selectedModule} />
    </>
  );
}
