import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import type { Header } from "@tanstack/react-table";
import { TableHead } from "@/components/ui/table";

type SortableTableHeaderProps<TData> = {
  header: Header<TData, unknown>;
};

export function SortableTableHeader<TData>({ header }: SortableTableHeaderProps<TData>) {
  const meta = header.column.columnDef.meta as { className?: string } | undefined;
  const className = `text-foreground font-medium ${meta?.className ?? ""}`;

  if (header.isPlaceholder) {
    return <TableHead key={header.id} className={className} />;
  }

  if (!header.column.getCanSort()) {
    return (
      <TableHead key={header.id} className={className}>
        {flexRender(header.column.columnDef.header, header.getContext())}
      </TableHead>
    );
  }

  return (
    <TableHead key={header.id} className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-left"
        onClick={header.column.getToggleSortingHandler()}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {header.column.getIsSorted() === "asc" ? (
          <ArrowUp className="size-3.5 text-muted-foreground" aria-hidden />
        ) : header.column.getIsSorted() === "desc" ? (
          <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground opacity-60" aria-hidden />
        )}
      </button>
    </TableHead>
  );
}
