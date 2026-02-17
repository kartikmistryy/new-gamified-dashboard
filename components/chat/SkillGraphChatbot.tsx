"use client";

import { useState, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatbotFAB } from "./ChatbotFAB";
import { ChatbotModal } from "./ChatbotModal";
import type { SkillGraphTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { SkillGraphRawData } from "@/components/skillmap/skillGraphDataLoader";
import { buildChatbotContext, buildSystemPrompt } from "@/lib/chat/buildChatbotContext";

interface SkillGraphChatbotProps {
  tableData: SkillGraphTableData;
  rawData: SkillGraphRawData;
}

/**
 * Main chatbot component for the Skills Graph page.
 * Combines FAB trigger with modal chat interface.
 */
export function SkillGraphChatbot({ tableData, rawData }: SkillGraphChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // Build optimized context once on mount
  const chatbotContext = useMemo(
    () => buildChatbotContext(tableData, rawData),
    [tableData, rawData]
  );

  // Build system prompt with context
  const systemPrompt = useMemo(
    () => buildSystemPrompt(chatbotContext),
    [chatbotContext]
  );

  // Create transport with custom body that includes systemPrompt
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/skillgraph",
        body: () => ({
          systemPrompt,
        }),
      }),
    [systemPrompt]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const text = input.trim();
      setInput("");
      await sendMessage({ text });
    },
    [input, isLoading, sendMessage]
  );

  return (
    <>
      <ChatbotFAB onClick={toggleOpen} isOpen={isOpen} />
      <ChatbotModal
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
