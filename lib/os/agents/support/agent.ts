import { z } from "zod";
import type { AgentDefinition, AgentTool, ChatMessage, RegisteredAgentTool } from "@/lib/os/agents/types";
import {
  getSupportEmail,
  getSupportKnowledgeBase,
  searchPublishedActivities,
} from "@/lib/os/agents/support/knowledge";
import { formatPrice } from "@/lib/utils";

const searchActivitiesTool: AgentTool<
  { query: string },
  { activities: Array<Record<string, unknown>> }
> = {
  name: "search_activities",
  description:
    "Search published tourist activities by keyword, location, or category.",
  parameters: z.object({
    query: z.string().min(1).describe("Search keywords"),
  }),
  async execute({ query }) {
    const activities = await searchPublishedActivities(query);

    return {
      activities: activities.map((activity) => ({
        title: activity.title,
        category: activity.category,
        location: activity.location,
        price: formatPrice(activity.price),
        durationMinutes: activity.duration,
        cancellationHours: activity.cancellationHours,
        page: `/activities/${activity.slug}`,
      })),
    };
  },
};

const siteInfoTool: AgentTool<Record<string, never>, { info: string }> = {
  name: "get_site_info",
  description:
    "Get general site policies, support contacts, and booking instructions.",
  parameters: z.object({}),
  async execute() {
    const knowledge = await getSupportKnowledgeBase();
    const [header] = knowledge.split("Published activities:");
    return { info: header.trim() };
  },
};

async function buildSystemPrompt(): Promise<string> {
  const knowledge = await getSupportKnowledgeBase();
  const supportEmail = getSupportEmail();

  return `You are the friendly AI support assistant for Tourist Booking, a website where customers book tourist activities.

Use ONLY the facts below and tool results. Do not invent activities, prices, policies, or URLs.
If you are unsure or the request needs a human (refunds, disputes, payment failures, account issues), say so and direct the customer to /contact or ${supportEmail}.
Keep replies concise (2–4 short paragraphs max). Use plain language.
When suggesting an activity, mention its name, price, and link path.
Use search_activities when the customer asks about tours, experiences, or what's available.

KNOWLEDGE BASE:
${knowledge}`;
}

async function demoFallback(messages: ChatMessage[]): Promise<string> {
  const knowledge = await getSupportKnowledgeBase();
  const supportEmail = getSupportEmail();
  const lastUser = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUser) {
    return "How can I help you today?";
  }

  const q = lastUser.content.toLowerCase();

  if (/hello|hi|hey|help/.test(q) && q.length < 40) {
    return (
      "Hello! I'm the Tourist Booking assistant (demo mode — add OPENAI_API_KEY for full AI).\n\n" +
      "I can help with finding activities, how booking works, cancellations, and contacting our team. What would you like to know?"
    );
  }

  if (/cancel|refund|lookup|find my booking/.test(q)) {
    return (
      "To look up or cancel a booking, go to Booking lookup (/booking/lookup) and enter the email you used at checkout plus your booking reference.\n\n" +
      `Cancellation rules depend on each activity's policy (usually free cancellation up to 24 hours before). If you can't find your booking, email ${supportEmail}.`
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
      `- Email: ${supportEmail}\n` +
      "- WhatsApp (if enabled on the site)\n\n" +
      "We typically reply within 1–2 business days."
    );
  }

  return (
    "Thanks for your question! I'm running in demo mode without a live AI API key.\n\n" +
    "Try asking about activities, how to book, cancellations, or contacting support. " +
    `For full AI answers, set OPENAI_API_KEY in your environment, or use /contact for a human.`
  );
}

export const supportAgent: AgentDefinition = {
  id: "support",
  name: "Support Assistant",
  description: "Customer support agent for tourist booking inquiries.",
  buildSystemPrompt: async () => buildSystemPrompt(),
  tools: [searchActivitiesTool, siteInfoTool] as RegisteredAgentTool[],
  temperature: 0.4,
  maxTokens: 600,
  maxToolRounds: 4,
  demoFallback: async (messages) => demoFallback(messages),
};
