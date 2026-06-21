export function getWhatsAppBusinessNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!raw || raw.includes("placeholder")) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  return digits || null;
}

export function getWhatsAppChatUrl(message?: string): string | null {
  const number = getWhatsAppBusinessNumber();
  if (!number) {
    return null;
  }

  const base = `https://wa.me/${number}`;
  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}
