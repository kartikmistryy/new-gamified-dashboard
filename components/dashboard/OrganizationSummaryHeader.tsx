"use client";

import { Info } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type OrganizationSummaryHeaderProps = {
  /** Main heading text (e.g. "Acme Corp Organization Summary" or "Acme Corp Performance") */
  title: string;
  /** Optional tooltip; when provided, shows the info icon with this content */
  tooltip?: {
    title: string;
    description: string;
  };
};

export function OrganizationSummaryHeader({
  title,
  tooltip,
}: OrganizationSummaryHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center gap-2 py-4 px-0">
      <CardTitle className="text-3xl">{title}</CardTitle>
      {tooltip && (
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ml-auto">
              <Info className="size-5 text-gray-600" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="font-semibold mb-1.5">{tooltip.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tooltip.description}
            </p>
          </TooltipContent>
        </TooltipRoot>
      )}
    </CardHeader>
  );
}
