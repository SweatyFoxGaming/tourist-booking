import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateAiSupportReply,
  isAiSupportConfigured,
  type ChatMessage,
} from "@/lib/ai-support";
import { checkRateLimit, getClientIp, logger } from "@/lib/os";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
  sessionId: z.string().max(64).optional(),
});

export async function GET() {
  return NextResponse.json({
    configured: isAiSupportConfigured(),
    demo: !isAiSupportConfigured(),
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`support-chat:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before sending another message." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const messages = parsed.data.messages as ChatMessage[];
  const last = messages[messages.length - 1];

  if (last.role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from the user" },
      { status: 400 }
    );
  }

  try {
    const reply = await generateAiSupportReply(
      messages,
      parsed.data.sessionId
    );
    return NextResponse.json({
      message: reply,
      demo: !isAiSupportConfigured(),
    });
  } catch (error) {
    logger.error("api.support.chat", "Failed to generate response", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
