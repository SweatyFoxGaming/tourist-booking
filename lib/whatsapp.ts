import { getAppUrl } from "@/lib/booking";

const API_VERSION = "v21.0";

export function isWhatsAppConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
  return (
    !!token &&
    !!phoneId &&
    !token.includes("placeholder") &&
    !phoneId.includes("placeholder")
  );
}

export function getWhatsAppBusinessNumber(): string | null {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!number || number.includes("placeholder")) {
    return null;
  }
  return number.replace(/\D/g, "");
}

export function getWhatsAppChatUrl(message?: string): string | null {
  const digits = getWhatsAppBusinessNumber();
  if (!digits) {
    return null;
  }

  const base = `https://wa.me/${digits}`;
  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function normalizeWhatsAppPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `27${digits.slice(1)}`;
  }

  return digits;
}

async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
  if (!isWhatsAppConfigured()) {
    console.log("[whatsapp] Skipped — not configured", { to, body });
    return false;
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;

  const response = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: true, body },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[whatsapp] Send failed:", error);
    return false;
  }

  return true;
}

export async function sendBookingConfirmationWhatsApp({
  phone,
  customerName,
  activityTitle,
  slotStart,
  guestCount,
  totalPrice,
  bookingId,
}: {
  phone?: string | null;
  customerName: string;
  activityTitle: string;
  slotStart: Date;
  guestCount: number;
  totalPrice: string;
  bookingId: string;
}) {
  if (!phone) {
    return false;
  }

  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) {
    return false;
  }

  const formattedDate = slotStart.toLocaleString("en-ZA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const lookupUrl = `${getAppUrl()}/booking/lookup`;
  const message = [
    `Hi ${customerName}! Your booking is confirmed.`,
    "",
    `*${activityTitle}*`,
    `When: ${formattedDate}`,
    `Guests: ${guestCount}`,
    `Total: ${totalPrice}`,
    `Ref: ${bookingId}`,
    "",
    `View or cancel: ${lookupUrl}`,
  ].join("\n");

  return sendWhatsAppText(normalized, message);
}

export async function sendAdminBookingAlertWhatsApp({
  customerName,
  activityTitle,
  totalPrice,
  bookingId,
  guestCount,
}: {
  customerName: string;
  activityTitle: string;
  totalPrice: string;
  bookingId: string;
  guestCount: number;
}) {
  const adminPhone = process.env.WHATSAPP_ADMIN_NUMBER?.trim();
  if (!adminPhone) {
    return false;
  }

  const normalized = normalizeWhatsAppPhone(adminPhone);
  if (!normalized) {
    return false;
  }

  const message = [
    "New booking confirmed",
    "",
    `Customer: ${customerName}`,
    `Activity: ${activityTitle}`,
    `Guests: ${guestCount}`,
    `Total: ${totalPrice}`,
    `Ref: ${bookingId}`,
  ].join("\n");

  return sendWhatsAppText(normalized, message);
}

export async function sendContactViaWhatsApp({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminPhone = process.env.WHATSAPP_ADMIN_NUMBER?.trim();
  if (!adminPhone) {
    console.log("[whatsapp] Contact form (admin number not set):", {
      name,
      email,
      subject,
      message,
    });
    return false;
  }

  const normalized = normalizeWhatsAppPhone(adminPhone);
  if (!normalized) {
    return false;
  }

  const body = [
    "New contact form message",
    "",
    `From: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  return sendWhatsAppText(normalized, body);
}
