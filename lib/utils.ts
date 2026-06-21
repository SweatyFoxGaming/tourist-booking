import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { localeToBcp47, type Locale } from "@/lib/i18n/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatPrice(amount: number | string, locale: Locale = "en"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "ZAR";

  return new Intl.NumberFormat(localeToBcp47(locale), {
    style: "currency",
    currency,
  }).format(value);
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function formatDuration(
  minutes: number,
  labels?: { min: string; hoursMinutes: string; hours: string }
): string {
  const minLabel = labels?.min ?? "{count} min";
  const hoursMinutesLabel = labels?.hoursMinutes ?? "{hours}h {minutes}m";
  const hoursLabel = labels?.hours ?? "{hours}h";

  if (minutes < 60) {
    return minLabel.replace("{count}", String(minutes));
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0
    ? hoursMinutesLabel.replace("{hours}", String(hours)).replace("{minutes}", String(mins))
    : hoursLabel.replace("{hours}", String(hours));
}
