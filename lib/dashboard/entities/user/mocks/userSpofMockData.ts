/**
 * User SPOF Mock Data Generation
 */

import type {
  ModuleSPOFData,
  ModuleOwner,
  ModuleCapability,
  ModuleStatus,
  CapabilityContributor,
} from "../types";
import { getScoreRange } from "../utils/userSpofHelpers";

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
  spofScore: number,
  userName: string
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
      const isCurrentUser = i === 0 && j === 0;
      const contributorName = isCurrentUser ? userName : MOCK_USERS[(i + j) % MOCK_USERS.length];
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
    "Deployment Module": "The core deployment engine that manages deployment flows, multi-stage pipelines, and automated rollback procedures. It is the central intelligence responsible for orchestrating releases and ensuring zero-downtime deployments.",
    "Payment Module": "Handles all payment processing workflows including transaction validation, payment gateway integration, and refund management. Critical for revenue operations.",
    "Cache Module": "Distributed caching layer that manages data retrieval optimization, cache invalidation strategies, and performance tuning across the platform.",
    "Database Module": "Core database abstraction layer managing connection pooling, query optimization, and transaction management for all data operations.",
    "Auth Module": "Authentication and authorization engine handling user sessions, token management, and access control across all services.",
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

/** Generates mock module SPOF data for treemap and modules table */
export function getUserModuleSPOFData(userId: string, userName: string = "Alice"): ModuleSPOFData[] {
  const repos = [
    "frontend-dashboard",
    "backend-api-gateway",
    "mobile-ios-app",
    "core-platform-services",
    "payment-processing-service"
  ];

  const modules: Array<Omit<ModuleSPOFData, "id" | "scoreRange" | "status" | "primaryOwner" | "backupOwners" | "repoName">> = [
    // High risk modules (red) - SPOF score 71-100
    { name: "Deployment Module", spofScore: 85, size: 220 },
    { name: "Payment Module", spofScore: 88, size: 220 },
    { name: "Cache Module", spofScore: 82, size: 150 },
    { name: "Database Module", spofScore: 79, size: 150 },
    { name: "Logging Module", spofScore: 77, size: 150 },
    { name: "Reporting Module", spofScore: 81, size: 150 },
    { name: "Storage Module", spofScore: 86, size: 200 },
    { name: "Auth Module", spofScore: 84, size: 200 },
    { name: "Search Module", spofScore: 78, size: 180 },
    { name: "Frontend Module", spofScore: 80, size: 180 },
    { name: "User Module", spofScore: 83, size: 180 },
    { name: "Security Module", spofScore: 87, size: 180 },
    // Medium risk modules (yellow/orange) - SPOF score 31-70
    { name: "Migration Module", spofScore: 65, size: 180 },
    { name: "Documentation Module", spofScore: 58, size: 120 },
    { name: "Testing Module", spofScore: 62, size: 120 },
    { name: "Email Module", spofScore: 68, size: 120 },
    { name: "Monitoring Module", spofScore: 64, size: 160 },
    { name: "Dashboard Module", spofScore: 61, size: 160 },
    { name: "Backend Module", spofScore: 67, size: 160 },
    { name: "Notification Module", spofScore: 59, size: 140 },
    { name: "Analytics Module", spofScore: 63, size: 140 },
    // Low risk modules (green) - SPOF score 0-30
    { name: "Backup Module", spofScore: 28, size: 140 },
    { name: "API Module", spofScore: 25, size: 140 },
    { name: "Configuration Module", spofScore: 22, size: 140 },
  ];

  return modules.map((module, index) => {
    const primaryOwnership = Math.floor(50 + (module.spofScore / 100) * 40);
    const backupOwnership = 100 - primaryOwnership;
    const isUserPrimaryOwner = module.spofScore > 60 ? index % 2 === 0 : index % 3 === 0;

    const currentUserOwner: ModuleOwner = {
      id: userId,
      name: userName,
      ownershipPercent: isUserPrimaryOwner ? primaryOwnership : backupOwnership,
    };

    const otherOwner: ModuleOwner = generateMockOwner(
      index,
      isUserPrimaryOwner ? backupOwnership : primaryOwnership
    );

    const capabilities = generateMockCapabilities(module.name, module.spofScore, userName);

    const uniqueContributors = new Set<string>();
    capabilities.forEach(cap => {
      cap.contributors.forEach(contrib => uniqueContributors.add(contrib.name));
    });

    return {
      id: `module-${userId}-${index}`,
      repoName: repos[index % repos.length],
      ...module,
      scoreRange: getScoreRange(module.spofScore),
      status: getModuleStatusFromScore(module.spofScore),
      primaryOwner: isUserPrimaryOwner ? currentUserOwner : otherOwner,
      backupOwners: [isUserPrimaryOwner ? otherOwner : currentUserOwner],
      description: generateModuleDescription(module.name),
      activeContributors: uniqueContributors.size,
      teamLoad: getTeamLoad(module.spofScore),
      capabilities,
    };
  });
}
