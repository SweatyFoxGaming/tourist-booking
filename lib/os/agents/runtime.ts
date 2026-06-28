import { z } from "zod";
import { eventBus } from "@/lib/os/events";
import { completeChat, isLlmConfigured } from "@/lib/os/agents/llm";
import { logger } from "@/lib/os/logger";
import type {
  AgentContext,
  AgentDefinition,
  AgentRunResult,
  AgentTool,
  ChatMessage,
  LLMMessage,
  RegisteredAgentTool,
} from "@/lib/os/agents/types";

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodFieldToJsonSchema(value);
      if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  return { type: "object", properties: {} };
}

function zodFieldToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodString) {
    return { type: "string", ...(schema.description ? { description: schema.description } : {}) };
  }
  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  if (schema instanceof z.ZodOptional) {
    return zodFieldToJsonSchema(schema.unwrap() as z.ZodType);
  }
  if (schema instanceof z.ZodDefault) {
    return zodFieldToJsonSchema(schema.removeDefault() as z.ZodType);
  }
  return { type: "string" };
}

function toConversationMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role === "user" || message.role === "assistant");
}

function buildToolMap(tools: RegisteredAgentTool[] = []) {
  return new Map(tools.map((tool) => [tool.name, tool]));
}

export async function runAgent(
  agent: AgentDefinition,
  messages: ChatMessage[],
  context: AgentContext = {}
): Promise<AgentRunResult> {
  const startedAt = Date.now();
  const conversation = toConversationMessages(messages);
  const usedTools: string[] = [];

  await eventBus.emit("agent.invoked", {
    agentId: agent.id,
    sessionId: context.sessionId,
    messageCount: conversation.length,
  });

  try {
    if (!isLlmConfigured()) {
      if (!agent.demoFallback) {
        throw new Error(`Agent ${agent.id} has no demo fallback`);
      }

      const content = await agent.demoFallback(conversation, context);
      const result = { content, demo: true, usedTools };

      await eventBus.emit("agent.completed", {
        agentId: agent.id,
        sessionId: context.sessionId,
        durationMs: Date.now() - startedAt,
        usedTools,
      });

      return result;
    }

    const systemPrompt = await agent.buildSystemPrompt(context);
    const llmMessages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversation.map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      })),
    ];

    const toolMap = buildToolMap(agent.tools);
    const maxRounds = agent.maxToolRounds ?? 4;
    const model = agent.model ?? process.env.OPENAI_MODEL?.trim() ?? "gpt-4o-mini";

    for (let round = 0; round < maxRounds; round += 1) {
      const completion = await completeChat({
        model,
        temperature: agent.temperature ?? 0.4,
        max_tokens: agent.maxTokens ?? 600,
        messages: llmMessages,
        tools:
          agent.tools && agent.tools.length > 0
            ? agent.tools.map((tool) => ({
                type: "function" as const,
                function: {
                  name: tool.name,
                  description: tool.description,
                  parameters: zodToJsonSchema(tool.parameters),
                },
              }))
            : undefined,
      });

      if (completion.toolCalls.length === 0) {
        if (!completion.content) {
          throw new Error("Empty LLM response");
        }

        const result = {
          content: completion.content,
          demo: false,
          usedTools,
        };

        await eventBus.emit("agent.completed", {
          agentId: agent.id,
          sessionId: context.sessionId,
          durationMs: Date.now() - startedAt,
          usedTools,
        });

        return result;
      }

      llmMessages.push({
        role: "assistant",
        content: completion.content ?? "",
        tool_calls: completion.toolCalls,
      });

      for (const call of completion.toolCalls) {
        const tool = toolMap.get(call.name);
        if (!tool) {
          llmMessages.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.name,
            content: JSON.stringify({ error: `Unknown tool: ${call.name}` }),
          });
          continue;
        }

        let parsedInput: unknown;
        try {
          parsedInput = JSON.parse(call.arguments || "{}");
        } catch {
          parsedInput = {};
        }

        const validated = tool.parameters.safeParse(parsedInput);
        if (!validated.success) {
          llmMessages.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.name,
            content: JSON.stringify({
              error: "Invalid tool arguments",
              details: validated.error.flatten(),
            }),
          });
          continue;
        }

        usedTools.push(tool.name);
        logger.debug("os.agents", "Executing tool", {
          agentId: agent.id,
          tool: tool.name,
        });

        const output = await tool.execute(validated.data, context);
        llmMessages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.name,
          content: JSON.stringify(output),
        });
      }
    }

    throw new Error("Agent exceeded maximum tool rounds");
  } catch (error) {
    await eventBus.emit("agent.failed", {
      agentId: agent.id,
      sessionId: context.sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
