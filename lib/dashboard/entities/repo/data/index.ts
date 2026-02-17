/**
 * Repo SPOF Data Loaders
 * Centralized exports for loading and transforming repo SPOF data
 */

// Main data loader
export {
  getRepoSpofData,
  isRepoAvailable,
  getAvailableRepos,
  clearRepoSpofCache,
  type GitAnalysisSummary,
  type FileScore,
  type ModuleBusFactorData,
  type BusFactorResults,
  type ModuleStats,
  type GitAnalysisData,
  type RepoSpofModuleStatus,
  type RepoSpofTotals,
  type RepoSpofData,
  type AvailableRepo,
} from "./repoSpofDataLoader";

// Project map loader (capabilities)
export {
  getProjectMapData,
  getModuleCapabilities,
  getModuleDescription,
  getProjectMapModuleNames,
  clearProjectMapCache,
  type ProjectMapFile,
  type ProjectMapFunction,
  type ProjectMapModule,
  type ProjectMapData,
} from "./repoProjectMapLoader";

// Sankey chart data builder
export {
  buildRepoSankeyData,
  buildContributorColorMap,
  type SankeyNode,
  type SankeyLink,
  type SankeyFlowData,
} from "./repoSankeyDataBuilder";

// Collaboration network data builder
export {
  buildCollaborationNetwork,
  getViridisColor,
  getCollaborationModuleOptions,
  type CollaborationNode,
  type CollaborationEdge,
  type CollaborationNetworkData,
} from "./repoCollaborationNetworkBuilder";
