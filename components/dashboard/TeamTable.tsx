"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { CryptoRow, CryptoSortColumn } from "@/lib/orgDashboard/types";

function getCryptoIconUrl(symbol: string): string {
  const symbolLower = symbol.toLowerCase();
  // Using GitHub-hosted cryptocurrency icons from spothq
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbolLower}.png`;
}

type TeamTableProps = {
  rows: CryptoRow[];
};

export function TeamTable({ rows }: TeamTableProps) {
  const [cryptoSort, setCryptoSort] = React.useState<{
    column: CryptoSortColumn;
    direction: "asc" | "desc";
  }>({ column: null, direction: "asc" });

  const sortedRows = React.useMemo(() => {
    const { column, direction } = cryptoSort;
    if (!column) return [...rows];
    return [...rows].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      if (column === "price") {
        aVal = a.price;
        bVal = b.price;
      } else {
        // marketCap - convert "1.66T" to number for sorting
        aVal = parseFloat(a.marketCap.replace(/[BMKT]/g, (m) => {
          if (m === "B") return "000000000";
          if (m === "M") return "000000";
          if (m === "K") return "000";
          if (m === "T") return "000000000000";
          return "";
        }));
        bVal = parseFloat(b.marketCap.replace(/[BMKT]/g, (m) => {
          if (m === "B") return "000000000";
          if (m === "M") return "000000";
          if (m === "K") return "000";
          if (m === "T") return "000000000000";
          return "";
        }));
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === "asc" ? cmp : -cmp;
    });
  }, [rows, cryptoSort]);

  const handleSort = React.useCallback(
    (column: Exclude<CryptoSortColumn, null>) => {
      setCryptoSort((prev) => {
        if (prev.column === column) {
          return {
            column,
            direction: prev.direction === "asc" ? "desc" : "asc",
          };
        }
        return { column, direction: "asc" as const };
      });
    },
    [],
  );

  return (
    <div className="rounded-sm border border-gray-200 overflow-hidden bg-white -mt-8">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-gray-200 hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium w-12">#</TableHead>
            <TableHead className="text-gray-500 font-medium">Symbol</TableHead>
            <TableHead className="text-gray-500 font-medium text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-end gap-1 font-medium text-gray-500 hover:text-gray-900 hover:bg-transparent -mr-2"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {cryptoSort.column === "price" ? (
                  cryptoSort.direction === "asc" ? (
                    <ArrowUp className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowDown className="size-3.5" aria-hidden />
                  )
                ) : (
                  <ArrowUpDown className="size-3.5" aria-hidden />
                )}
              </Button>
            </TableHead>
            <TableHead className="text-gray-500 font-medium text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-end gap-1 font-medium text-gray-500 hover:text-gray-900 hover:bg-transparent -mr-2"
                onClick={() => handleSort("marketCap")}
              >
                Market Cap{" "}
                {cryptoSort.column === "marketCap" ? (
                  cryptoSort.direction === "asc" ? (
                    <ArrowUp className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowDown className="size-3.5" aria-hidden />
                  )
                ) : (
                  <ArrowUpDown className="size-3.5" aria-hidden />
                )}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow
              key={row.symbol}
              className="border-gray-100 hover:bg-gray-50/80"
            >
              <TableCell className="font-semibold text-gray-900">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0">
                    <Image
                      src={getCryptoIconUrl(row.symbol)}
                      alt={`${row.name} icon`}
                      className="rounded-full object-cover border border-gray-200"
                      width={40}
                      height={40}
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.symbol}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-red-600">
                {row.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {row.marketCap}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
