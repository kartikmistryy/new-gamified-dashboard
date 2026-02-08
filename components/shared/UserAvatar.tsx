"use client";

/**
 * User Avatar Component
 *
 * Displays a user avatar using the DiceBear Avataaars style.
 * Generates consistent avatars based on user name as seed.
 */

type UserAvatarProps = {
  /** User name to generate avatar from. */
  userName: string;
  /** Optional Tailwind className for sizing and positioning. */
  className?: string;
  /** Size in pixels for the generated SVG (default: 64). */
  size?: number;
};

/** DiceBear avatar style for user profiles. */
const DICEBEAR_STYLE = "avataaars";

/**
 * Generates a consistent avatar URL for a given user name.
 *
 * Uses DiceBear Avataaars API to create deterministic avatars based on the user name seed.
 * Same name will always generate the same avatar.
 *
 * @param userName - User name to use as seed
 * @param size - Size in pixels for the SVG
 * @returns Avatar URL
 */
export function getUserAvatarUrl(userName: string, size: number): string {
  const seed = encodeURIComponent(userName.trim() || "user");
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${seed}&size=${size}`;
}

/**
 * User Avatar Component
 *
 * Renders a circular user avatar with lazy loading.
 * Avatars are generated consistently from the user name.
 *
 * @example
 * ```tsx
 * <UserAvatar userName="Alice Johnson" className="size-8" />
 * ```
 */
export function UserAvatar({
  userName,
  className = "size-6",
  size = 64,
}: UserAvatarProps) {
  return (
    <img
      src={getUserAvatarUrl(userName, size)}
      alt={`${userName} avatar`}
      className={`shrink-0 rounded-full ${className}`}
      loading="lazy"
    />
  );
}
