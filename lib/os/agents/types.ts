import type { z } from "zod";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  toolCallId?: string;
  toolName?: string;
};

export type AgentContext = {
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

export type AgentTool<TInput = unknown, TOutput = unknown> = {
  name: string;
  description: string;
  parameters: z.ZodType<TInput>;
  execute: (input: TInput, context: AgentContext) => Promise<TOutput>;
};

export type RegisteredAgentTool = {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (input: unknown, context: AgentContext) => Promise<unknown>;
};

export type AgentDefinition = {
  id: string;
  name: string;
  description: string;
  buildSystemPrompt: (context: AgentContext) => Promise<string>;
  tools?: RegisteredAgentTool[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxToolRounds?: number;
  demoFallback?: (messages: ChatMessage[], context: AgentContext) => Promise<string>;
};

export type AgentRunResult = {
  content: string;
  demo: boolean;
  usedTools: string[];
};

export type LLMToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type LLMMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; tool_calls?: LLMToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string; name: string };

export type LLMCompletionRequest = {
  model: string;
  temperature: number;
  max_tokens: number;
  messages: LLMMessage[];
  tools?: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }[];
};

export type LLMCompletionResponse = {
  content: string | null;
  toolCalls: LLMToolCall[];
};
