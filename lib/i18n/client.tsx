"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import en from "@/messages/en.json";

type Messages = typeof en;

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages as Messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export { useTranslations, useLocale } from "next-intl";
