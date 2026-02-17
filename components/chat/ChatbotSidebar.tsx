"use client";

import { useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, User, PanelRightClose } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

interface ChatbotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: UIMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

/**
 * Sidebar panel for the chatbot.
 * Slides in from the right with a fixed width.
 */
export function ChatbotSidebar({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatbotSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[420px] max-w-[90vw]",
          "bg-card border-l shadow-2xl",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h3 className="font-semibold">SkillsGraph AI</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelRightClose className="size-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-12">
              <Bot className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-base mb-2">Hi! I can help you with questions about team skills.</p>
              <p className="text-xs text-muted-foreground/70">
                Try asking: &quot;Who knows React?&quot; or &quot;What skills are needed for
                AI projects?&quot;
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <SidebarMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 p-4 border-t bg-muted/20"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

interface SidebarMessageProps {
  message: UIMessage;
}

function SidebarMessage({ message }: SidebarMessageProps) {
  const isUser = message.role === "user";

  const textContent = message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 size-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="size-4" />
        ) : (
          <Bot className="size-4" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{textContent}</div>
        ) : (
          <Markdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {textContent}
          </Markdown>
        )}
      </div>
    </div>
  );
}
