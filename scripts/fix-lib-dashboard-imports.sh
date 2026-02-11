#!/bin/bash

# Script to update imports after lib/dashboard reorganization
# Phase 3 Task 2: Organize lib/dashboard into entity-based subfolders

set -e

cd "$(dirname "$0")/.."

echo "Updating lib/dashboard imports..."

# Update shared/ imports
echo "1. Updating shared utilities imports..."

# TimeRangeContext
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/TimeRangeContext"|from "@/lib/dashboard/shared/TimeRangeContext"|g' {} +

# MultiTimeRangeContext
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/MultiTimeRangeContext"|from "@/lib/dashboard/shared/MultiTimeRangeContext"|g' {} +

# TimeRangeFilter
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/TimeRangeFilter"|from "@/lib/dashboard/shared/TimeRangeFilter"|g' {} +

# chartConstants
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/chartConstants"|from "@/lib/dashboard/shared/chartConstants"|g' {} +

# trendHelpers
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/trendHelpers"|from "@/lib/dashboard/shared/trendHelpers"|g' {} +

# performanceChart (keep as-is, already in shared/)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/performanceChart/|from "@/lib/dashboard/shared/performanceChart/|g' {} +

# performanceChartConfig
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/performanceChartConfig"|from "@/lib/dashboard/shared/performanceChartConfig"|g' {} +

# performanceChartShapes
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/performanceChartShapes"|from "@/lib/dashboard/shared/performanceChartShapes"|g' {} +

# collaborationNetworkScales
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/collaborationNetworkScales"|from "@/lib/dashboard/shared/collaborationNetworkScales"|g' {} +

# collaborationNetworkTooltips
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/collaborationNetworkTooltips"|from "@/lib/dashboard/shared/collaborationNetworkTooltips"|g' {} +

# sankeyContributionPlotly
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/sankeyContributionPlotly"|from "@/lib/dashboard/repoDashboard/sankeyContributionPlotly"|g' {} +

echo "2. Updating user dashboard imports..."

# skillgraphColumns
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/skillgraphColumns"|from "@/lib/dashboard/userDashboard/skillgraphColumns"|g' {} +

# skillgraphTableUtils
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/skillgraphTableUtils"|from "@/lib/dashboard/userDashboard/skillgraphTableUtils"|g' {} +

# skillgraphTeamColumns
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/skillgraphTeamColumns"|from "@/lib/dashboard/userDashboard/skillgraphTeamColumns"|g' {} +

# skillgraphTeamTableUtils
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/skillgraphTeamTableUtils"|from "@/lib/dashboard/userDashboard/skillgraphTeamTableUtils"|g' {} +

# useUserSkillTable
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/useUserSkillTable"|from "@/lib/dashboard/userDashboard/useUserSkillTable"|g' {} +

# userSkillGraphUtils
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/userSkillGraphUtils"|from "@/lib/dashboard/userDashboard/userSkillGraphUtils"|g' {} +

echo "3. Updating repo dashboard imports..."

# contributorCarousel
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/contributorCarousel"|from "@/lib/dashboard/repoDashboard/contributorCarousel"|g' {} +

# contributorBarChartUtils
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/contributorBarChartUtils"|from "@/lib/dashboard/repoDashboard/contributorBarChartUtils"|g' {} +

# contributorMetricsPlotly
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/contributorMetricsPlotly"|from "@/lib/dashboard/repoDashboard/contributorMetricsPlotly"|g' {} +

# carouselNavigationUtils
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/carouselNavigationUtils"|from "@/lib/dashboard/repoDashboard/carouselNavigationUtils"|g' {} +

# useCarouselNavigation
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/useCarouselNavigation"|from "@/lib/dashboard/repoDashboard/useCarouselNavigation"|g' {} +

# useCarouselAutoPlay
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec sed -i '' 's|from "@/lib/dashboard/useCarouselAutoPlay"|from "@/lib/dashboard/repoDashboard/useCarouselAutoPlay"|g' {} +

echo "Import updates complete!"
