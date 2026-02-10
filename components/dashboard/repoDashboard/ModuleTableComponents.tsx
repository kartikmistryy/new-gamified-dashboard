/** Modules Table Sub-Components */

import { UserAvatar } from "@/components/shared/UserAvatar";

type OwnerCellProps = {
  name: string;
  percent: number;
  color: string;
};

/** Owner Cell Component with Progress Bar */
export function OwnerCell({ name, percent, color }: OwnerCellProps) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar userName={name} className="size-8 shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-sm text-gray-900 font-medium truncate">{name}</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium min-w-[35px] text-right">{percent}%</span>
        </div>
      </div>
    </div>
  );
}
