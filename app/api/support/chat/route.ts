import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateAiSupportReply,
  isAiSupportConfigured,
  type ChatMessage,
} from "@/lib/ai-support";

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
});

export async function GET() {
  return NextResponse.json({
    configured: isAiSupportConfigured(),
    demo: !isAiSupportConfigured(),
  });
}

export async function POST(request: Request) {
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
    const reply = await generateAiSupportReply(messages);
    return NextResponse.json({
      message: reply,
      demo: !isAiSupportConfigured(),
    });
  } catch (error) {
    console.error("[api/support/chat]", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
