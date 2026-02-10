import { D3Gauge } from "@/components/dashboard/shared/D3Gauge";
import { ChartInsights } from "@/components/dashboard/shared/ChartInsights";
import type { ChartInsight } from "@/lib/orgDashboard/types";

export type GaugeWithInsightsProps = {
  /** Gauge value (0-100) */
  value: number;
  /** Label text displayed below the gauge */
  label: string;
  /** Color for the label text */
  labelColor: string;
  /** Value display text (e.g., "75/100") */
  valueDisplay: string;
  /** Array of insights to display */
  insights: ChartInsight[];
  /** Optional class name for the container */
  className?: string;
};

/**
 * Reusable component that displays a D3 gauge alongside chart insights.
 * Used across performance and SPOF dashboards.
 */
export function GaugeWithInsights({
  value,
  label,
  labelColor,
  valueDisplay,
  insights,
  className = "",
}: GaugeWithInsightsProps) {
  return (
    <div className={`flex flex-row flex-wrap items-stretch gap-8 ${className}`}>
      <div className="flex shrink-0 min-w-[280px] max-w-[50%]">
        <D3Gauge
          value={value}
          label={label}
          labelColor={labelColor}
          valueDisplay={valueDisplay}
        />
      </div>
      <div className="flex-1 min-w-[280px]">
        <ChartInsights insights={insights} />
      </div>
    </div>
  );
}
