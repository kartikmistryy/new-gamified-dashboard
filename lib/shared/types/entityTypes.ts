/**
 * Branded types for entity IDs to prevent accidental mixing.
 *
 * Branded types provide compile-time safety by making string IDs
 * nominally different types, preventing bugs like:
 * - Passing a teamId where memberId is expected
 * - Mixing up parameter order in function calls
 *
 * @example
 * ```typescript
 * // Before: Easy to mix up
 * function getTeamMember(teamId: string, memberId: string) { ... }
 * getTeamMember(memberId, teamId); // Bug! Wrong order
 *
 * // After: Type-safe
 * function getTeamMember(teamId: TeamId, memberId: MemberId) { ... }
 * getTeamMember(memberId, teamId); // ❌ TypeScript error!
 * ```
 */

/** Brand type helper - adds a nominal type tag */
type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};

/** Member ID (branded string) */
export type MemberId = Brand<string, "MemberId">;

/** Team ID (branded string) */
export type TeamId = Brand<string, "TeamId">;

/** Organization ID (branded string) */
export type OrgId = Brand<string, "OrgId">;

/** Repository ID (branded string) */
export type RepoId = Brand<string, "RepoId">;

/** Skill ID (branded string) */
export type SkillId = Brand<string, "SkillId">;

/** Domain ID (branded string for skill domains) */
export type DomainId = Brand<string, "DomainId">;

/**
 * Branded ID constructors
 * Use these to create branded IDs from plain strings
 */

export function createMemberId(id: string): MemberId {
  return id as MemberId;
}

export function createTeamId(id: string): TeamId {
  return id as TeamId;
}

export function createOrgId(id: string): OrgId {
  return id as OrgId;
}

export function createRepoId(id: string): RepoId {
  return id as RepoId;
}

export function createSkillId(id: string): SkillId {
  return id as SkillId;
}

export function createDomainId(id: string): DomainId {
  return id as DomainId;
}

/**
 * Extract plain string from branded type
 * Use when you need to pass to external APIs or legacy code
 */
export function unwrapId<T extends Brand<string, any>>(id: T): string {
  return id as string;
}

/**
 * Type guard to check if a value is a branded ID
 */
export function isBrandedId(value: unknown): value is Brand<string, any> {
  return typeof value === "string";
}
