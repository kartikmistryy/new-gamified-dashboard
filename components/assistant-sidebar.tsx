"use client";

import { useState, type FC } from "react";
import {
  BotIcon,
  Maximize2Icon,
  Minimize2Icon,
  XIcon,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Thread } from "@/components/thread";
import { TooltipIconButton } from "@/components/tooltip-icon-button";

type ViewMode = "modal" | "sidebar";

interface AssistantSidebarProps {
  enableModeToggle?: boolean;
  defaultMode?: ViewMode;
}

export const AssistantSidebar: FC<AssistantSidebarProps> = ({
  enableModeToggle = false,
  defaultMode = "modal",
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>(defaultMode);

  const toggleMode = () =>
    setMode((m) => (m === "sidebar" ? "modal" : "sidebar"));

  const modeToggleButton = enableModeToggle ? (
    <TooltipIconButton
      variant="ghost"
      tooltip={mode === "sidebar" ? "Minimize to popover" : "Expand to side panel"}
      side="bottom"
      onClick={toggleMode}
      className="size-7"
    >
      {mode === "sidebar" ? (
        <Minimize2Icon className="size-4" />
      ) : (
        <Maximize2Icon className="size-4" />
      )}
    </TooltipIconButton>
  ) : null;

  const closeButton = (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  );

  const header = (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <span className="text-base font-semibold">Skills Graph Assistant</span>
      <div className="flex items-center gap-1">
        {modeToggleButton}
        {closeButton}
      </div>
    </div>
  );

  return (
    <>
      {/* FAB trigger — visible when chat is closed */}
      {!open && (
        <div className="fixed right-4 bottom-4 z-50">
          <TooltipIconButton
            variant="default"
            tooltip="Open Assistant"
            side="left"
            onClick={() => setOpen(true)}
            className="size-11 rounded-full shadow transition-transform hover:scale-110 active:scale-90"
          >
            <BotIcon className="size-6" />
            <span className="sr-only">Open Assistant</span>
          </TooltipIconButton>
        </div>
      )}

      {/* Sidebar mode: Sheet drawer */}
      {mode === "sidebar" && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="aui-root sm:max-w-md w-full p-0 gap-0 flex flex-col"
          >
            {header}
            <div className="flex-1 min-h-0">
              <Thread />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Popover mode: floating panel */}
      {mode === "modal" && open && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="aui-root fixed right-4 bottom-4 z-50 flex h-[500px] w-[400px] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-95 duration-200">
            {header}
            <div className="flex-1 min-h-0">
              <Thread />
            </div>
          </div>
        </>
      )}
    </>
  );
};
