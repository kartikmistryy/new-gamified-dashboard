"use client";

type TeamAvatarProps = {
  teamName: string;
  className?: string;
  size?: number;
};

const DICEBEAR_STYLE = "shapes";

export function getTeamAvatarUrl(teamName: string, size: number) {
  const seed = encodeURIComponent(teamName.trim() || "team");
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${seed}&size=${size}`;
}

export function TeamAvatar({
  teamName,
  className = "size-4",
  size = 64,
}: TeamAvatarProps) {
  return (
    <img
      src={getTeamAvatarUrl(teamName, size)}
      alt={`${teamName} avatar`}
      className={`shrink-0 rounded-sm ${className}`}
      loading="lazy"
    />
  );
}
