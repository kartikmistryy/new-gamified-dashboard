/**
 * User Dashboard Mock Data
 *
 * Main entry point (barrel export) for all user dashboard mock data generation.
 * Generates realistic mock data for user performance metrics and overview cards.
 * This will be replaced with API calls in future implementation.
 *
 * Architecture:
 * This file serves as a barrel export for the user dashboard mock data system.
 * The implementation is split across focused modules:
 *
 * - userPerformanceMockData.ts - Performance data and chart insights
 * - userOverviewMockData.ts - Overview metric cards generation
 * - userSpofMockData.ts - SPOF module data and risk analysis
 *
 * This modular structure keeps each file under 200 lines while maintaining
 * a single import point for consumers.
 */

// ============================================================================
// Performance Data Generation
// ============================================================================

export {
  generateUserPerformanceData,
  getUserChartInsights,
} from "./userPerformanceMockData";

// ============================================================================
// Overview Metric Cards
// ============================================================================

export {
  getUserMetricCards,
} from "./userOverviewMockData";

// ============================================================================
// SPOF Module Data
// ============================================================================

export {
  getUserModuleSPOFData,
} from "./userSpofMockData";
