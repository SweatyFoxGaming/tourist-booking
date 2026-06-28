import { logger } from "@/lib/os/logger";
import type {
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMToolCall,
} from "@/lib/os/agents/types";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getLlmConfig() {
  return {
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    baseUrl:
      process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
  };
}

export async function completeChat(
  request: LLMCompletionRequest
): Promise<LLMCompletionResponse> {
  const { baseUrl, apiKey } = getLlmConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.text();
    logger.error("os.llm", "Provider error", {
      status: response.status,
      detail: detail.slice(0, 500),
    });
    throw new Error("LLM provider error");
  }

  const data = (await response.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: {
          id: string;
          type: "function";
          function: { name: string; arguments: string };
        }[];
      };
    }[];
  };

  const message = data.choices?.[0]?.message;
  const toolCalls: LLMToolCall[] =
    message?.tool_calls?.map((call) => ({
      id: call.id,
      name: call.function.name,
      arguments: call.function.arguments,
    })) ?? [];

  return {
    content: message?.content?.trim() || null,
    toolCalls,
  };
}
