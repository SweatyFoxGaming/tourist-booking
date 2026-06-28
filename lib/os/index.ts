export { bootstrapOS } from "@/lib/os/bootstrap";
export { logger } from "@/lib/os/logger";
export { checkRateLimit, getClientIp } from "@/lib/os/rate-limit";
export * from "@/lib/os/events";
export { runAgent } from "@/lib/os/agents/runtime";
export { getAgent, listAgents, registerAgent, requireAgent } from "@/lib/os/agents/registry";
export { isLlmConfigured } from "@/lib/os/agents/llm";
export type {
  AgentContext,
  AgentDefinition,
  AgentRunResult,
  AgentTool,
  ChatMessage,
} from "@/lib/os/agents/types";

import "@/lib/os/bootstrap";
