"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Book, Minus } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BookmarkButton } from "./BookmarkButton";
import { cn } from "@/lib/utils";

interface SidebarListItemProps {
  type: "team" | "person" | "repo";
  id: string;
  name: string;
  avatar?: string;
  href: string;
  isActive: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  /** When true, renders only the button content (no li). Use inside SidebarHighlightItem. */
  contentOnly?: boolean;
}

const listItemContent = (props: SidebarListItemProps) => (
  <SidebarMenuButton
    asChild
    isActive={props.isActive}
    className={cn(
      "relative cursor-pointer h-9 rounded-md",
      props.isActive && "bg-gray-100 text-gray-900",
      !props.contentOnly && "hover:bg-gray-50",
      props.contentOnly && "hover:bg-transparent!",
    )}
  >
    <div className="flex items-center w-full relative z-10">
      <Link
        href={props.href}
        className="flex items-center w-full gap-2 relative z-10"
      >
        {props.type === "team" && props.avatar && (
          <Image
            src={props.avatar}
            alt={props.name}
            width={16}
            height={16}
            className="rounded object-cover"
            unoptimized
          />
        )}
        {props.type === "person" && props.avatar && (
          <Image
            src={props.avatar}
            alt={props.name}
            width={20}
            height={20}
            className="rounded-full object-cover"
            unoptimized
          />
        )}
        {props.type === "repo" && <Book className="size-3 text-gray-900" />}
        <span className="text-sm font-medium flex-1 truncate text-gray-900">
          {props.name}
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <BookmarkButton
          isFavorited={props.isFavorited}
          onToggle={props.onToggleFavorite}
          className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
        />
        {props.showBackButton && props.onBack && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onBack!();
            }}
            className="p-0.5 hover:bg-gray-100 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
            title="Go back to organization"
          >
            <Minus className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  </SidebarMenuButton>
);

export function SidebarListItem({
  type,
  id,
  name,
  avatar,
  href,
  isActive,
  isFavorited,
  onToggleFavorite,
  showBackButton = false,
  onBack,
  contentOnly = false,
}: SidebarListItemProps) {
  const content = listItemContent({
    type,
    id,
    name,
    avatar,
    href,
    isActive,
    isFavorited,
    onToggleFavorite,
    showBackButton,
    onBack,
    contentOnly,
  });

  if (contentOnly) {
    return <div className="group/item">{content}</div>;
  }

  return <SidebarMenuItem className="group/item">{content}</SidebarMenuItem>;
}
