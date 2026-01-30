import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CHART_DATA_1_MONTH,
  CHART_DATA_1_YEAR,
  CHART_DATA_ALL,
  INDUSTRY_AVERAGE_GAUGE,
} from "./constants";
import type { AIRecommendation, ChartDataPoint } from "./types";

export function formatOrgTitle(orgId: string): string {
  return orgId.charAt(0).toUpperCase() + orgId.slice(1);
}

export function getGaugeColor(value: number): string {
  if (value <= 25) return "#EE6666";
  if (value <= 50) return "#FD994D";
  if (value <= 75) return "#FAC858";
  return "#91CC75";
}

export function getGaugeSecondaryLabel(value: number): string {
  switch (true) {
    case value >= 0 && value <= 15:
      return "Critical";
    case value >= 16 && value <= 35:
      return "At Risk";
    case value >= 36 && value <= 50:
      return "Major Concern";
    case value >= 51 && value <= 65:
      return "Moderate";
    case value >= 66 && value <= 80:
      return "Healthy";
    case value >= 81 && value <= 92:
      return "Good";
    case value >= 93 && value <= 100:
      return "Excellent";
    default:
      return "Unknown";
  }
}

export function getGaugeSecondaryLabelText(
  value: number,
  industryAverage: number = INDUSTRY_AVERAGE_GAUGE,
): string {
  const diff = Math.round(value - industryAverage);
  if (diff === 0) return "At industry average";
  if (diff > 0) return `${diff} pts more`;
  return `${Math.abs(diff)} pts less`;
}

export function getGaugeSecondaryLabelIcon(value: number): LucideIcon {
  if (value >= 80) return TrendingUp;
  if (value >= 66) return ArrowUp;
  if (value >= 36) return ArrowDown;
  return TrendingDown;
}

export function getChartDataByTimeRange(timeRange: string): ChartDataPoint[] {
  switch (timeRange) {
    case "1-month":
      return CHART_DATA_1_MONTH;
    case "1-year":
      return CHART_DATA_1_YEAR;
    case "all":
      return CHART_DATA_ALL;
    default:
      return CHART_DATA_1_MONTH;
  }
}

export function getAIRecommendations(
  gaugeValue: number,
  chartData: ChartDataPoint[],
): AIRecommendation[] {
  const diff = gaugeValue - INDUSTRY_AVERAGE_GAUGE;
  const scoreTrend =
    chartData.length >= 2
      ? chartData[chartData.length - 1].fearGreed -
        chartData[chartData.length - 2].fearGreed
      : 0;
  const industryTrend =
    chartData.length >= 2
      ? chartData[chartData.length - 1].btcPrice -
        chartData[chartData.length - 2].btcPrice
      : 0;

  const recommendations: AIRecommendation[] = [];

  if (diff < -20) {
    recommendations.push({
      sentiment: "Below average",
      sentimentColor: "text-red-600",
      borderAccent: "border-l-red-500",
      text: `Overall score is ${Math.abs(Math.round(diff))} pts below industry average. Consider reviewing key drivers and focusing on areas that typically move the needle.`,
      cta: "View benchmarks",
    });
  } else if (diff > 15) {
    recommendations.push({
      sentiment: "Above average",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: `Overall score is ${Math.round(diff)} pts above industry average. Maintain current practices and look for opportunities to extend the lead.`,
      cta: "Compare peers",
    });
  }

  if (scoreTrend < -5) {
    recommendations.push({
      sentiment: "Declining score",
      sentimentColor: "text-amber-600",
      borderAccent: "border-l-amber-500",
      text: "Overall score % has declined over the latest period. Monitor contributing factors and consider proactive adjustments before the next cycle.",
      cta: "Indicators",
    });
  } else if (scoreTrend > 5) {
    recommendations.push({
      sentiment: "Improving score",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: "Overall score % is trending up. Recent changes appear to be having a positive impact; consider doubling down on what's working.",
      cta: "Analysis",
    });
  }

  if (industryTrend < 0 && recommendations.length < 3) {
    recommendations.push({
      sentiment: "Industry pressure",
      sentimentColor: "text-gray-600",
      borderAccent: "border-l-gray-400",
      text: "Industry average has moved down recently. Use this as context when interpreting your score and prioritising next actions.",
      cta: "Industry view",
    });
  } else if (industryTrend > 0 && recommendations.length < 3) {
    recommendations.push({
      sentiment: "Industry tailwind",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: "Industry average is rising. Your relative position versus peers may shift; keep an eye on both absolute and relative performance.",
      cta: "Benchmarks",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      sentiment: "Stable",
      sentimentColor: "text-gray-600",
      borderAccent: "border-l-gray-400",
      text: "Score and industry average are stable. Good time to review goals and set targets for the next period.",
      cta: "Set goals",
    });
  }

  return recommendations.slice(0, 3);
}
