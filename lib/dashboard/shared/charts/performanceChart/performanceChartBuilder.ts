/** Performance Chart Builder - Fluent API for chart configuration */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import type { ChartEvent, ChartAnnotation } from "@/lib/dashboard/entities/team/types";
import type {
  PerformanceChartConfig,
  PerformanceDataSource,
  EntityVisibilityConfig,
  NormalizedPerformanceDataPoint,
} from "./types";

/** Builder class for constructing chart configurations with a fluent API */
export class PerformanceChartConfigBuilder {
  private config: Partial<PerformanceChartConfig> = {};

  setDataSource(dataSource: PerformanceDataSource): this {
    this.config.dataSource = dataSource;
    return this;
  }

  withStaticEvents(events: ChartEvent[]): this {
    this.config.eventStrategy = { mode: "static", events };
    return this;
  }

  withDynamicEvents(generator: (data: NormalizedPerformanceDataPoint[]) => ChartEvent[]): this {
    this.config.eventStrategy = { mode: "dynamic", generator };
    return this;
  }

  withoutEvents(): this {
    this.config.eventStrategy = { mode: "none" };
    return this;
  }

  withStaticAnnotations(annotations: ChartAnnotation[]): this {
    this.config.annotationStrategy = { mode: "static", annotations };
    return this;
  }

  withDynamicAnnotations(generator: (data: NormalizedPerformanceDataPoint[]) => ChartAnnotation[]): this {
    this.config.annotationStrategy = { mode: "dynamic", generator };
    return this;
  }

  withoutAnnotations(): this {
    this.config.annotationStrategy = { mode: "none" };
    return this;
  }

  setTimeRange(timeRange: TimeRangeKey): this {
    this.config.timeRange = timeRange;
    return this;
  }

  setEntityVisibility(visibility: EntityVisibilityConfig): this {
    this.config.entityVisibility = visibility;
    return this;
  }

  setAriaLabel(ariaLabel: string): this {
    this.config.ariaLabel = ariaLabel;
    return this;
  }

  setClassName(className: string): this {
    this.config.className = className;
    return this;
  }

  build(): PerformanceChartConfig {
    if (!this.config.dataSource) {
      throw new Error("PerformanceChartConfigBuilder: dataSource is required");
    }

    return {
      dataSource: this.config.dataSource,
      eventStrategy: this.config.eventStrategy ?? { mode: "none" },
      annotationStrategy: this.config.annotationStrategy ?? { mode: "none" },
      timeRange: this.config.timeRange ?? "max",
      entityVisibility: this.config.entityVisibility,
      ariaLabel: this.config.ariaLabel ?? "Performance chart over time",
      className: this.config.className ?? "",
    };
  }
}
