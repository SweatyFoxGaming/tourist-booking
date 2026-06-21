import { createTranslator } from "next-intl";
import { headers } from "next/headers";
import en from "@/messages/en.json";
import {
  defaultLocale,
  isLocale,
  LOCALE_HEADER,
  negotiateLocale,
  type Locale,
} from "@/lib/i18n/locale";

type Messages = typeof en;

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("@/messages/en.json"),
  af: () => import("@/messages/af.json"),
  fr: () => import("@/messages/fr.json"),
  de: () => import("@/messages/de.json"),
  es: () => import("@/messages/es.json"),
  pt: () => import("@/messages/pt.json"),
  nl: () => import("@/messages/nl.json"),
  zh: () => import("@/messages/zh.json"),
  ja: () => import("@/messages/ja.json"),
  ar: () => import("@/messages/ar.json"),
};

let enMessages: Messages | null = null;

async function getEnglishMessages(): Promise<Messages> {
  if (!enMessages) {
    enMessages = (await messageLoaders.en()).default as Messages;
  }
  return enMessages;
}

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];

    if (
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const fromMiddleware = headerStore.get(LOCALE_HEADER);

  if (fromMiddleware && isLocale(fromMiddleware)) {
    return fromMiddleware;
  }

  return negotiateLocale(headerStore.get("accept-language"));
}

export async function getMessages(locale: Locale): Promise<Messages> {
  const english = await getEnglishMessages();

  if (locale === defaultLocale) {
    return english;
  }

  const loader = messageLoaders[locale] ?? messageLoaders[defaultLocale];
  const localized = (await loader()).default;
  return deepMerge(english, localized) as Messages;
}

export async function getTranslations<T extends keyof Messages>(namespace?: T) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return createTranslator({ locale, messages, namespace });
}

export async function getI18nProps() {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return { locale, messages: messages as Record<string, unknown> };
}
