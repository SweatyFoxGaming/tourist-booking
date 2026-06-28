export { bootstrapOS } from "@/lib/os/bootstrap";
export { logger } from "@/lib/os/logger";
export { checkRateLimit, getClientIp } from "@/lib/os/rate-limit";
export { enforceRateLimit } from "@/lib/os/http";
export { jobQueue } from "@/lib/os/queue";
export {
  uploadFile,
  getStorageProvider,
  isRemoteStorageConfigured,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/os/storage";
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
