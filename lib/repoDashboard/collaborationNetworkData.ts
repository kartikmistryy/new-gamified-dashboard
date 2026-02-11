/**
 * Repository Dashboard Collaboration Network Data
 * Uses shared collaboration generator with repo context
 */

import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
import {
  generateCollaborationData,
  type CollaborationModule,
  type CollaborationEdge,
} from "@/lib/shared/collaborationNetworkGenerator";

/**
 * Generate repository collaboration network data for contributors.
 * Shows collaboration patterns between contributors in a repository.
 * Uses shared generator with repo context.
 */
export function getRepoCollaborationData(
  repoId: string,
  contributorNames: string[],
  timeRange: TimeRangeKey = "max"
): CollaborationModule | undefined {
  return generateCollaborationData(repoId, contributorNames, "repo", timeRange);
}

// Re-export types for backward compatibility
export type { CollaborationModule, CollaborationEdge };
