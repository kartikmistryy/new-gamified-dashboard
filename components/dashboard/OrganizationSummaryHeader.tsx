"use client";

import { Info } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type OrganizationSummaryHeaderProps = {
  orgTitle: string;
};

export function OrganizationSummaryHeader({
  orgTitle,
}: OrganizationSummaryHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center gap-2 py-4 px-0">
      <CardTitle className="text-3xl">Organization Summary</CardTitle>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full ml-auto">
            <Info className="size-5 text-gray-600" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="font-semibold mb-1.5">
            {orgTitle}&apos;s Organization Summary
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Shows overall score vs industry average (80), with a timespan toggle
            (1 Month, 1 Year, All). The chart plots Overall Score % and Industry
            Average over time. AI recommendations are derived from the gauge and
            chart trend. The table lists teams with Code Quality % and total
            Karma Points (sortable).
          </p>
        </TooltipContent>
      </TooltipRoot>
    </CardHeader>
  );
}
