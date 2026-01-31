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
  MARKET_AVERAGE_GAUGE,
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
    case value >= 0 && value <= 24:
      return "Extreme Fear";
    case value >= 25 && value <= 44:
      return "Fear";
    case value >= 45 && value <= 55:
      return "Neutral";
    case value >= 56 && value <= 75:
      return "Greed";
    case value >= 76 && value <= 100:
      return "Extreme Greed";
    default:
      return "Unknown";
  }
}

export function getGaugeSecondaryLabelText(
  value: number,
  industryAverage: number = MARKET_AVERAGE_GAUGE,
): string {
  const diff = Math.round(value - industryAverage);
  if (diff === 0) return "At market average";
  if (diff > 0) return `${diff} pts above average`;
  return `${Math.abs(diff)} pts below average`;
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
  const diff = gaugeValue - MARKET_AVERAGE_GAUGE;
  const fearGreedTrend =
    chartData.length >= 2
      ? chartData[chartData.length - 1].fearGreed -
        chartData[chartData.length - 2].fearGreed
      : 0;
  const btcPriceTrend =
    chartData.length >= 2
      ? chartData[chartData.length - 1].btcPrice -
        chartData[chartData.length - 2].btcPrice
      : 0;

  const recommendations: AIRecommendation[] = [];

  if (gaugeValue <= 25) {
    recommendations.push({
      sentiment: "Extreme Fear",
      sentimentColor: "text-red-600",
      borderAccent: "border-l-red-500",
      text: "Market sentiment indicates extreme fear. This could present buying opportunities, but exercise caution and consider dollar-cost averaging strategies.",
      cta: "View indicators",
    });
  } else if (gaugeValue >= 76) {
    recommendations.push({
      sentiment: "Extreme Greed",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: "Market sentiment shows extreme greed. Consider taking profits and rebalancing your portfolio. High sentiment often precedes corrections.",
      cta: "Analysis",
    });
  }

  if (fearGreedTrend < -10) {
    recommendations.push({
      sentiment: "Bearish",
      sentimentColor: "text-red-600",
      borderAccent: "border-l-red-500",
      text: "The closing price has crossed below the MA5, suggesting a potential downside risk.",
      cta: "Indicators",
    });
  } else if (fearGreedTrend > 10) {
    recommendations.push({
      sentiment: "Bullish",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: "Fear & Greed Index is rising, indicating improving market sentiment. Monitor volume and support levels for confirmation of the trend.",
      cta: "Analysis",
    });
  }

  if (btcPriceTrend < -5000 && recommendations.length < 3) {
    recommendations.push({
      sentiment: "Price Decline",
      sentimentColor: "text-amber-600",
      borderAccent: "border-l-amber-500",
      text: "BTC price has moved down recently. This may indicate a short-term correction or shift in market dynamics. Review technical indicators.",
      cta: "Technical view",
    });
  } else if (btcPriceTrend > 5000 && recommendations.length < 3) {
    recommendations.push({
      sentiment: "Price Surge",
      sentimentColor: "text-green-600",
      borderAccent: "border-l-green-500",
      text: "BTC price is trending upward. Monitor resistance levels and consider profit-taking strategies if the rally extends.",
      cta: "Price analysis",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      sentiment: "Neutral",
      sentimentColor: "text-gray-900",
      borderAccent: "border-l-gray-400",
      text: "Call options trading volume and open interest are concentrated around the 18 strike price, indicating this level may serve as a key support or resistance. It is important to monitor changes in volatility and consider flexible directional or volatility strategies.",
      cta: "Analysis",
    });
  }

  return recommendations.slice(0, 3);
}
