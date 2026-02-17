"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatbotFABProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

/**
 * Floating Action Button for the chatbot.
 * Anchored at bottom-right, toggles the chat modal.
 */
export function ChatbotFAB({ onClick, isOpen, className }: ChatbotFABProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      size="icon-lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
        "hover:scale-105 transition-transform duration-200",
        "bg-primary hover:bg-primary/90",
        isOpen && "rotate-90",
        className
      )}
      aria-label={isOpen ? "Close chat" : "Open chat assistant"}
    >
      <MessageCircle className="size-5" />
    </Button>
  );
}
