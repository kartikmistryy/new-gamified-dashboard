import { PERFORMANCE_ZONES, PERFORMANCE_BASELINES } from "@/lib/dashboard/entities/team/charts/performanceChart/orgPerformanceChartData";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

export function PerformanceChartLegend() {
  return (
    <div
      className="mt-4 w-full max-w-2xl shrink-0 gap-x-4 gap-y-2 text-xs mx-auto"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        minWidth: "20rem",
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.excellent.color }} />
        <span className="truncate text-gray-600">{PERFORMANCE_ZONES.excellent.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.aboveAvg.color }} />
        <span className="truncate text-gray-600">{PERFORMANCE_ZONES.aboveAvg.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.belowAvg.color }} />
        <span className="truncate text-gray-600">{PERFORMANCE_ZONES.belowAvg.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.concerning.color }} />
        <span className="truncate text-gray-600">{PERFORMANCE_ZONES.concerning.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <svg width="20" height="2" className="shrink-0 overflow-visible">
          <line x1="0" y1="1" x2="20" y2="1" stroke={PERFORMANCE_BASELINES.p60.color} strokeWidth="2" strokeDasharray="4 2" />
        </svg>
        <span className="truncate text-gray-600">{PERFORMANCE_BASELINES.p60.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <svg width="20" height="2" className="shrink-0 overflow-visible">
          <line x1="0" y1="1" x2="20" y2="1" stroke={PERFORMANCE_BASELINES.p40.color} strokeWidth="2" strokeDasharray="4 2" />
        </svg>
        <span className="truncate text-gray-600">{PERFORMANCE_BASELINES.p40.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <svg width="24" height="8" className="shrink-0 overflow-visible">
          <line x1="0" y1="4" x2="16" y2="4" stroke={DASHBOARD_COLORS.blueChart} strokeWidth="2" />
          <circle cx="20" cy="4" r="3" fill={DASHBOARD_COLORS.blueChart} />
        </svg>
        <span className="truncate text-gray-600">Normalized Median</span>
      </div>
    </div>
  );
}
