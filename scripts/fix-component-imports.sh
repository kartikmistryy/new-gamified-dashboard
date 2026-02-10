#!/bin/bash

# Script to fix component imports after Phase 3 reorganization
# This updates all imports from flat structure to entity-based subfolders

set -e

echo "🔧 Fixing component imports after Phase 3 reorganization..."

# Define the base path
BASE="/Users/kartikmistry/Desktop Folders/new-gamified-dashboard"

cd "$BASE"

# Shared components - update imports to add /shared/
SHARED_COMPONENTS=(
  "BaseTeamsTable"
  "ChartInsights"
  "ComparativePerformanceChart"
  "ComparativePerformanceChartLegend"
  "ComparativePerformanceChartSVG"
  "D3Gauge"
  "DashboardSection"
  "DomainDistributionBar"
  "FilterBadges"
  "GaugeSection"
  "GaugeWithInsights"
  "GlobalTimeRangeFilter"
  "OverviewSummaryCard"
  "PerformanceChart"
  "PerformanceChartLegend"
  "PerformanceChartSVG"
  "RepoHealthBar"
  "SPOFTreemap"
  "SankeyContributionChart"
  "SegmentBar"
  "SortableTableHeader"
  "TimeRangeDropdown"
  "TimeRangeFilter"
  "VisibilityToggleButton"
)

# Org dashboard components
ORG_COMPONENTS=(
  "ChaosMatrixChart"
  "DesignTeamsTable"
  "OwnershipScatter"
  "PerformanceTeamsTable"
  "TeamTable"
)

# Team dashboard components
TEAM_COMPONENTS=(
  "CollaborationNetworkGraph"
  "CollaborationNetworkLegend"
  "ContributionFlowSVG"
  "MemberPerformanceChart"
  "MemberTable"
  "SpofDistributionChart"
  "SpofTeamsTable"
  "SpofTeamsTableComponents"
)

# Repo dashboard components
REPO_COMPONENTS=(
  "CarouselStates"
  "ContributorBarChartComponents"
  "ContributorCardsCarousel"
  "ContributorCarouselHeader"
  "ContributorCarouselNavigation"
  "ContributorCarouselSlide"
  "ContributorMetricsCard"
  "ContributorMetricsChart"
  "ContributorPerformanceBarChart"
  "ContributorPerformanceCarousel"
  "ContributorPerformanceChartAdapter"
  "ContributorTable"
  "ModuleDetailSheet"
  "ModulesTable"
  "ModuleTableComponents"
)

# User dashboard components
USER_COMPONENTS=(
  "SkillgraphBySkillTable"
  "SkillgraphByTeamTable"
  "SkillgraphDetailTable"
  "SkillgraphProgressBar"
  "SkillgraphTeamDetailTable"
  "SkillgraphTeamsTable"
)

echo "📝 Updating shared component imports..."
for component in "${SHARED_COMPONENTS[@]}"; do
  # Update absolute imports
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./scripts/*" \
    -exec sed -i '' "s|@/components/dashboard/${component}'|@/components/dashboard/shared/${component}'|g" {} +

  # Update relative imports from within dashboard
  find components/dashboard -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "components/dashboard/shared/*" \
    -exec sed -i '' "s|from '\\./${component}'|from '../shared/${component}'|g" {} +

  find components/dashboard -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "components/dashboard/shared/*" \
    -exec sed -i '' "s|from \"\\./${component}\"|from \"../shared/${component}\"|g" {} +
done

echo "📝 Updating org dashboard component imports..."
for component in "${ORG_COMPONENTS[@]}"; do
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./scripts/*" \
    -exec sed -i '' "s|@/components/dashboard/${component}'|@/components/dashboard/orgDashboard/${component}'|g" {} +

  # Update relative imports
  find components/dashboard -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "components/dashboard/orgDashboard/*" \
    -exec sed -i '' "s|from '\\./${component}'|from './orgDashboard/${component}'|g" {} +

  find components/dashboard -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "components/dashboard/orgDashboard/*" \
    -exec sed -i '' "s|from \"\\./${component}\"|from \"./orgDashboard/${component}\"|g" {} +
done

echo "📝 Updating team dashboard component imports..."
for component in "${TEAM_COMPONENTS[@]}"; do
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./scripts/*" \
    -exec sed -i '' "s|@/components/dashboard/${component}'|@/components/dashboard/teamDashboard/${component}'|g" {} +
done

echo "📝 Updating repo dashboard component imports..."
for component in "${REPO_COMPONENTS[@]}"; do
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./scripts/*" \
    -exec sed -i '' "s|@/components/dashboard/${component}'|@/components/dashboard/repoDashboard/${component}'|g" {} +
done

echo "📝 Updating user dashboard component imports..."
for component in "${USER_COMPONENTS[@]}"; do
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./scripts/*" \
    -exec sed -i '' "s|@/components/dashboard/${component}'|@/components/dashboard/userDashboard/${component}'|g" {} +
done

echo "✅ Import updates complete!"
echo ""
echo "🔍 Running TypeScript check..."
npx tsc --noEmit 2>&1 | head -20 || true

echo ""
echo "✨ Done! Review the changes and run full type check."
