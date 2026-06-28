import {
  isLlmConfigured,
  requireAgent,
  runAgent,
  type ChatMessage,
} from "@/lib/os";

export type { ChatMessage };

export function isAiSupportConfigured(): boolean {
  return isLlmConfigured();
}

export async function generateAiSupportReply(
  messages: ChatMessage[],
  sessionId?: string
): Promise<string> {
  const agent = requireAgent("support");
  const conversation = messages.filter(
    (message) => message.role === "user" || message.role === "assistant"
  );

  const result = await runAgent(agent, conversation, { sessionId });
  return result.content;
}

export { getSupportKnowledgeBase } from "@/lib/os/agents/support/knowledge";
