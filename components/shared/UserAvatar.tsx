"use client";

/**
 * User Avatar Component
 *
 * Displays a user avatar using the DiceBear Avataaars style.
 * Generates consistent avatars based on user name as seed.
 */

type UserAvatarProps = {
  /** User name to generate avatar from. */
  userName?: string;
  /** Alternative prop name for user name. */
  name?: string;
  /** Optional custom avatar URL. If provided, uses this instead of generated avatar. */
  src?: string;
  /** Optional Tailwind className for sizing and positioning. */
  className?: string;
  /** Size preset (sm, md, lg) or custom pixel value. */
  size?: "sm" | "md" | "lg" | number;
};

/** DiceBear avatar style for user profiles. */
const DICEBEAR_STYLE = "shapes";

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
export function getUserAvatarUrl(userName: string | undefined, size: number): string {
  const seed = encodeURIComponent((userName || "").trim() || "user");
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
 * <UserAvatar name="Bob Smith" size="md" />
 * <UserAvatar name="Carol Lee" src="https://example.com/avatar.jpg" />
 * ```
 */
export function UserAvatar({
  userName,
  name,
  src,
  className,
  size = 64,
}: UserAvatarProps) {
  const displayName = userName || name || "User";

  // Convert size preset to pixel value
  let pixelSize: number;
  let sizeClass: string;

  if (typeof size === "number") {
    pixelSize = size;
    sizeClass = className || "size-6";
  } else {
    switch (size) {
      case "sm":
        pixelSize = 32;
        sizeClass = className || "size-8";
        break;
      case "md":
        pixelSize = 48;
        sizeClass = className || "size-12";
        break;
      case "lg":
        pixelSize = 64;
        sizeClass = className || "size-16";
        break;
      default:
        pixelSize = 64;
        sizeClass = className || "size-6";
    }
  }

  const avatarUrl = src || getUserAvatarUrl(displayName, pixelSize);

  return (
    <img
      src={avatarUrl}
      alt={`${displayName} avatar`}
      className={`shrink-0 rounded-full ${sizeClass}`}
      loading="lazy"
    />
  );
}
