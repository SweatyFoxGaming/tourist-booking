import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function isAiSupportConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function getSupportKnowledgeBase(): Promise<string> {
  const activities = await prisma.activity.findMany({
    where: { isPublished: true },
    orderBy: { title: "asc" },
    select: {
      title: true,
      slug: true,
      location: true,
      category: true,
      price: true,
      duration: true,
      cancellationHours: true,
      description: true,
    },
    take: 30,
  });

  const activityLines =
    activities.length === 0
      ? "No published activities are listed right now."
      : activities
          .map((activity) => {
            const cancellation =
              activity.cancellationHours === 0
                ? "Non-refundable"
                : `Free cancellation up to ${activity.cancellationHours} hours before start`;
            return [
              `- ${activity.title} (${activity.category})`,
              `  Location: ${activity.location}`,
              `  Price: ${formatPrice(activity.price)} per person`,
              `  Duration: ${activity.duration} minutes`,
              `  Cancellation: ${cancellation}`,
              `  Page: /activities/${activity.slug}`,
              `  Book via the "Book Now" button on the activity page`,
              `  Summary: ${activity.description.slice(0, 180)}…`,
            ].join("\n");
          })
          .join("\n");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "ZAR";

  return [
    "Site: Tourist Booking — book tourist activities online.",
    `Base URL: ${appUrl}`,
    `Currency: ${currency}`,
    "Guest checkout is supported — no account required.",
    "Booking lookup / cancellation: /booking/lookup (guests need booking reference + email).",
    "Contact form: /contact",
    "Support email: support@touristbooking.com",
    "Payments: PayFast (card / local methods depending on merchant setup).",
    "",
    "Published activities:",
    activityLines,
  ].join("\n");
}

function buildSystemPrompt(knowledge: string): string {
  return `You are the friendly AI support assistant for Tourist Booking, a website where customers book tourist activities.

Use ONLY the facts below. Do not invent activities, prices, policies, or URLs.
If you are unsure or the request needs a human (refunds, disputes, payment failures, account issues), say so and direct the customer to /contact or support@touristbooking.com.
Keep replies concise (2–4 short paragraphs max). Use plain language.
When suggesting an activity, mention its name, price, and link path from the knowledge base.

KNOWLEDGE BASE:
${knowledge}`;
}

export async function generateAiSupportReply(
  messages: ChatMessage[]
): Promise<string> {
  const knowledge = await getSupportKnowledgeBase();
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUser) {
    throw new Error("No user message");
  }

  if (!isAiSupportConfigured()) {
    return generateDemoReply(lastUser.content, knowledge);
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: buildSystemPrompt(knowledge) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[ai-support] OpenAI error:", response.status, detail);
    throw new Error("AI provider error");
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty AI response");
  }

  return content;
}

function generateDemoReply(question: string, knowledge: string): string {
  const q = question.toLowerCase();

  if (/hello|hi|hey|help/.test(q) && q.length < 40) {
    return (
      "Hello! I'm the Tourist Booking assistant (demo mode — add OPENAI_API_KEY for full AI).\n\n" +
      "I can help with finding activities, how booking works, cancellations, and contacting our team. What would you like to know?"
    );
  }

  if (/cancel|refund|lookup|find my booking/.test(q)) {
    return (
      "To look up or cancel a booking, go to Booking lookup (/booking/lookup) and enter the email you used at checkout plus your booking reference.\n\n" +
      "Cancellation rules depend on each activity's policy (usually free cancellation up to 24 hours before). If you can't find your booking, email support@touristbooking.com."
    );
  }

  if (/book|how do i|checkout|pay|payment/.test(q)) {
    return (
      "Booking is simple:\n" +
      "1. Browse activities at /activities\n" +
      "2. Open an activity and click Book Now\n" +
      "3. Pick a date/time slot and enter guest details (no account needed)\n" +
      "4. Pay securely via PayFast\n\n" +
      "You'll receive a confirmation by email with your booking reference."
    );
  }

  if (/activit|tour|experience|what do you offer|available/.test(q)) {
    const snippet = knowledge.split("Published activities:")[1]?.trim() ?? "";
    const lines = snippet.split("\n").slice(0, 12).join("\n");
    return (
      "Here are some activities we currently offer:\n\n" +
      (lines || "Browse /activities for the full list.") +
      "\n\nOpen any activity page for full details and to book."
    );
  }

  if (/contact|email|human|speak to|whatsapp/.test(q)) {
    return (
      "You can reach our team via:\n" +
      "- Contact form: /contact\n" +
      "- Email: support@touristbooking.com\n" +
      "- WhatsApp (if enabled on the site)\n\n" +
      "We typically reply within 1–2 business days."
    );
  }

  return (
    "Thanks for your question! I'm running in demo mode without a live AI API key.\n\n" +
    "Try asking about activities, how to book, cancellations, or contacting support. " +
    "For full AI answers, set OPENAI_API_KEY in your environment, or use /contact for a human."
  );
}
