"use client"

import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  isFavorited: boolean
  onToggle: () => void
  className?: string
}

export function BookmarkButton({
  isFavorited,
  onToggle,
  className = "ml-auto",
}: BookmarkButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        className,
        "p-0.5 hover:bg-gray-100 rounded transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
      )}
      aria-pressed={isFavorited}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Bookmark className={cn("size-3.5 cursor-pointer text-gray-700", isFavorited && "fill-current text-gray-900")} />
    </button>
  )
}
