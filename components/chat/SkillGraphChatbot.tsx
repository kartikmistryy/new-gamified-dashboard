"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantModal } from "@/components/assistant-modal";
import { AssistantSidebar } from "@/components/assistant-sidebar";
import type { SkillGraphTableData } from "@/components/skillmap/skillGraphTableTransform";
import type { SkillGraphRawData } from "@/components/skillmap/skillGraphDataLoader";
import { buildChatbotContext, buildSystemPrompt } from "@/lib/chat/buildChatbotContext";

export type ChatbotLayout = "modal" | "sidebar" | "both";

interface SkillGraphChatbotProps {
  tableData: SkillGraphTableData;
  rawData: SkillGraphRawData;
  layout?: ChatbotLayout;
}

export function SkillGraphChatbot({ tableData, rawData, layout = "modal" }: SkillGraphChatbotProps) {
  const chatbotContext = useMemo(() => buildChatbotContext(tableData, rawData), [tableData, rawData]);
  const systemPrompt = useMemo(() => buildSystemPrompt(chatbotContext), [chatbotContext]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/skillgraph",
        body: () => ({ systemPrompt }),
      }),
    [systemPrompt],
  );

  const chat = useChat({ transport });
  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {layout === "modal" && <AssistantModal />}
      {layout === "sidebar" && <AssistantSidebar />}
      {layout === "both" && <AssistantSidebar enableModeToggle />}
    </AssistantRuntimeProvider>
  );
}
