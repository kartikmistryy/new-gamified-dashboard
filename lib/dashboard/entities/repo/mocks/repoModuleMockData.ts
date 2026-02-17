/**
 * Repo Module Mock Data Generation
 *
 * Generates mock module data for a specific repository
 */

import type {
  ModuleSPOFData,
  ModuleOwner,
  ModuleCapability,
  ModuleStatus,
  CapabilityContributor,
} from "../../user/types";
import { getScoreRange } from "../../user/utils/userSpofHelpers";

/** Get module status from spofScore (for mock data - approximates busFactor) */
function getModuleStatusFromScore(spofScore: number): ModuleStatus {
  if (spofScore >= 70) return "At Risk";
  if (spofScore >= 40) return "Needs Attention";
  return "Healthy";
}

/** Mock user names for module owners */
const MOCK_USERS = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "Diana Prince",
  "Eve Adams",
  "Frank Castle",
  "Grace Hopper",
  "Henry Ford",
  "Iris West",
  "Jack Ryan",
];

/** Generates mock module owner */
function generateMockOwner(index: number, ownershipPercent: number): ModuleOwner {
  const userName = MOCK_USERS[index % MOCK_USERS.length];
  return {
    id: `user-${index}`,
    name: userName,
    ownershipPercent,
  };
}

/** Generates mock capabilities for a module */
function generateMockCapabilities(
  moduleName: string,
  spofScore: number
): ModuleCapability[] {
  const capabilityTemplates = [
    { name: "Core Engine", description: "Central processing logic that drives the module's primary operations and orchestrates internal workflows.", importance: 100, busFactor: 7, backupCount: 1 },
    { name: "API Handler", description: "Request routing and response handling layer that exposes module functionality to external consumers.", importance: 95, busFactor: 5, backupCount: 1 },
    { name: "Data Processor", description: "Transforms, validates, and normalizes incoming data before persistence or downstream consumption.", importance: 80, busFactor: 4, backupCount: 1 },
    { name: "Authentication Service", description: "Manages identity verification, session tokens, and permission checks for secure access.", importance: 85, busFactor: 3, backupCount: 2 },
    { name: "Configuration Manager", description: "Handles runtime settings, feature flags, and environment-specific configuration loading.", importance: 75, busFactor: 3, backupCount: 1 },
  ];

  const numCapabilities = spofScore > 70 ? 4 : spofScore > 40 ? 3 : 2;
  const capabilities: ModuleCapability[] = [];

  for (let i = 0; i < numCapabilities; i++) {
    const template = capabilityTemplates[i % capabilityTemplates.length];
    const capabilityName = `${template.name}`;
    const numContributors = Math.min(3, template.busFactor);
    const contributors: CapabilityContributor[] = [];
    const topOwnerPercent = Math.floor(100 - (template.busFactor * 5));
    let remainingOwnership = 100;

    for (let j = 0; j < numContributors; j++) {
      const contributorName = MOCK_USERS[(i + j) % MOCK_USERS.length];
      let ownership: number;

      if (j === 0) {
        ownership = topOwnerPercent;
      } else if (j === numContributors - 1) {
        ownership = remainingOwnership;
      } else {
        ownership = Math.floor(remainingOwnership / (numContributors - j));
      }

      contributors.push({
        name: contributorName,
        ownershipPercent: Math.min(ownership, remainingOwnership),
      });

      remainingOwnership -= ownership;
    }

    const capabilitySpofScore = i === 0 && spofScore > 70 ? spofScore / 10 : undefined;

    capabilities.push({
      id: `cap-${moduleName}-${i}`,
      name: capabilityName,
      description: template.description,
      importance: template.importance - (i * 5),
      busFactor: template.busFactor,
      backupCount: template.backupCount,
      topOwnerPercent,
      fileCount: Math.floor(10 + (template.importance / 10) * Math.random() * 20),
      contributors,
      spofScore: capabilitySpofScore,
    });
  }

  return capabilities;
}

/** Generates module description */
function generateModuleDescription(moduleName: string): string {
  const descriptions: Record<string, string> = {
    "Deployment Module": "The core deployment engine that manages deployment flows, multi-stage pipelines, and automated rollback procedures.",
    "Payment Module": "Handles all payment processing workflows including transaction validation, payment gateway integration, and refund management.",
    "Cache Module": "Distributed caching layer that manages data retrieval optimization, cache invalidation strategies, and performance tuning.",
    "Database Module": "Core database abstraction layer managing connection pooling, query optimization, and transaction management.",
    "Auth Module": "Authentication and authorization engine handling user sessions, token management, and access control.",
    "Search Module": "Full-text search engine powering all search functionality with real-time indexing and query optimization.",
  };

  return descriptions[moduleName] ||
    `Core module responsible for ${moduleName.toLowerCase().replace(" module", "")} functionality and business logic processing.`;
}

/** Determines team load based on SPOF score */
function getTeamLoad(spofScore: number): "Low Pressure" | "Medium Pressure" | "High Pressure" {
  if (spofScore >= 80) return "High Pressure";
  if (spofScore >= 60) return "Medium Pressure";
  return "Low Pressure";
}

/** Generates mock module SPOF data for a specific repository */
export function getRepoModuleSPOFData(repoId: string): ModuleSPOFData[] {
  const modules: Array<Omit<ModuleSPOFData, "id" | "scoreRange" | "status" | "primaryOwner" | "backupOwners" | "repoName">> = [
    // High risk modules
    { name: "Deployment Module", spofScore: 85, size: 220 },
    { name: "Payment Module", spofScore: 88, size: 220 },
    { name: "Cache Module", spofScore: 82, size: 150 },
    { name: "Database Module", spofScore: 79, size: 150 },
    { name: "Auth Module", spofScore: 84, size: 200 },
    // Medium risk modules
    { name: "Migration Module", spofScore: 65, size: 180 },
    { name: "Testing Module", spofScore: 62, size: 120 },
    { name: "Email Module", spofScore: 68, size: 120 },
    { name: "Monitoring Module", spofScore: 64, size: 160 },
    { name: "Analytics Module", spofScore: 63, size: 140 },
    // Low risk modules
    { name: "Backup Module", spofScore: 28, size: 140 },
    { name: "API Module", spofScore: 25, size: 140 },
  ];

  return modules.map((module, index) => {
    const primaryOwnership = Math.floor(50 + (module.spofScore / 100) * 40);
    const remainingOwnership = 100 - primaryOwnership;

    const primaryOwner = generateMockOwner(index, primaryOwnership);

    // Generate 1-3 backup owners based on risk: high-risk → fewer backups
    const backupCount = module.spofScore > 70 ? 1 : module.spofScore > 40 ? 2 : 3;
    const backupOwners: ModuleOwner[] = Array.from({ length: backupCount }, (_, i) => {
      const weight = 1 / (i + 1);
      const totalWeight = Array.from({ length: backupCount }, (__, j) => 1 / (j + 1)).reduce((s, w) => s + w, 0);
      return generateMockOwner(index + 1 + i, Math.round((weight / totalWeight) * remainingOwnership));
    });

    const capabilities = generateMockCapabilities(module.name, module.spofScore);

    const uniqueContributors = new Set<string>();
    capabilities.forEach(cap => {
      cap.contributors.forEach(contrib => uniqueContributors.add(contrib.name));
    });

    return {
      id: `module-${repoId}-${index}`,
      repoName: repoId,
      ...module,
      scoreRange: getScoreRange(module.spofScore),
      status: getModuleStatusFromScore(module.spofScore),
      primaryOwner,
      backupOwners,
      description: generateModuleDescription(module.name),
      activeContributors: uniqueContributors.size,
      teamLoad: getTeamLoad(module.spofScore),
      capabilities,
    };
  });
}
