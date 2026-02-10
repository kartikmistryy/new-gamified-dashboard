/** Custom hook for Performance Chart data processing pipeline */

import { useMemo } from "react";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import { getStartDateForRange } from "@/lib/orgDashboard/performanceChartHelpers";
import type {
  PerformanceChartProps,
  NormalizedPerformanceDataPoint,
} from "./types";
import {
  isStaticEventStrategy,
  isDynamicEventStrategy,
  isStaticAnnotationStrategy,
  isDynamicAnnotationStrategy,
} from "./types";
import { transformDataSource, filterByEntityVisibility } from "./transformers";

export function usePerformanceChartData(
  dataSource: PerformanceChartProps["dataSource"],
  eventStrategy: PerformanceChartProps["eventStrategy"],
  annotationStrategy: PerformanceChartProps["annotationStrategy"],
  timeRange: PerformanceChartProps["timeRange"],
  entityVisibility: PerformanceChartProps["entityVisibility"]
) {
  const normalizedData = useMemo<NormalizedPerformanceDataPoint[]>(
    () => transformDataSource(dataSource),
    [dataSource]
  );

  const timeFilteredData = useMemo(() => {
    if (timeRange === "max" || normalizedData.length === 0) {
      return normalizedData;
    }

    const endDate = new Date(normalizedData[normalizedData.length - 1].date);
    const startDate = getStartDateForRange(timeRange, endDate);

    return normalizedData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }, [normalizedData, timeRange]);

  const filteredData = useMemo(
    () => filterByEntityVisibility(timeFilteredData, entityVisibility?.visibleEntities),
    [timeFilteredData, entityVisibility?.visibleEntities]
  );

  const events = useMemo<ChartEvent[]>(() => {
    if (isStaticEventStrategy(eventStrategy)) {
      return eventStrategy.events;
    }
    if (isDynamicEventStrategy(eventStrategy)) {
      return eventStrategy.generator(filteredData);
    }
    return [];
  }, [eventStrategy, filteredData]);

  const annotations = useMemo<ChartAnnotation[]>(() => {
    if (isStaticAnnotationStrategy(annotationStrategy)) {
      return annotationStrategy.annotations;
    }
    if (isDynamicAnnotationStrategy(annotationStrategy)) {
      return annotationStrategy.generator(filteredData);
    }
    return [];
  }, [annotationStrategy, filteredData]);

  const filteredEvents = useMemo(() => {
    if (timeRange === "max" || filteredData.length === 0) {
      return events;
    }

    const startDate = new Date(filteredData[0].date);
    const endDate = new Date(filteredData[filteredData.length - 1].date);

    return events.filter((event) => {
      const date = new Date(event.date);
      return date >= startDate && date <= endDate;
    });
  }, [events, timeRange, filteredData]);

  const filteredAnnotations = useMemo(() => {
    if (timeRange === "max" || filteredData.length === 0) {
      return annotations;
    }

    const startDate = new Date(filteredData[0].date);
    const endDate = new Date(filteredData[filteredData.length - 1].date);

    return annotations.filter((annotation) => {
      const date = new Date(annotation.date);
      return date >= startDate && date <= endDate;
    });
  }, [annotations, timeRange, filteredData]);

  return {
    filteredData,
    filteredEvents,
    filteredAnnotations,
  };
}
