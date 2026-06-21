import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppChatUrl } from "@/lib/whatsapp-public";

export function WhatsAppButton() {
  const chatUrl = getWhatsAppChatUrl("Hi! I'd like to enquire about booking an activity.");

  if (!chatUrl) {
    return null;
  }

  return (
    <Link
      href={chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Link>
  );
}
