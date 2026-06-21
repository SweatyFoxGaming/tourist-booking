import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteTheme } from "@/lib/theme-server";
import { ThemeStyles } from "@/components/layout/ThemeStyles";
import { Providers } from "@/components/Providers";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18nProps } from "@/lib/i18n/server";
import { isRtlLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getSiteTheme();
  const { locale, messages } = await getI18nProps();

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={`${inter.variable} h-full`}
    >
      <head>
        <ThemeStyles theme={theme} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
