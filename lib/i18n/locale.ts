export const LOCALE_HEADER = "x-site-locale";

export const locales = [
  "en",
  "af",
  "fr",
  "de",
  "es",
  "pt",
  "nl",
  "zh",
  "ja",
  "ar",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      const base = tag.split("-")[0]?.toLowerCase() ?? "";
      return {
        tag: base,
        q: qValue ? Number.parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferences) {
    if (isLocale(tag)) {
      return tag;
    }
  }

  return defaultLocale;
}

export function localeToBcp47(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en",
    af: "af",
    fr: "fr",
    de: "de",
    es: "es",
    pt: "pt",
    nl: "nl",
    zh: "zh-CN",
    ja: "ja",
    ar: "ar",
  };

  return map[locale] ?? "en";
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}
