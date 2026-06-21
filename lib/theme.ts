import type { SiteTheme } from "@prisma/client";

export type ThemeConfig = SiteTheme;

export const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Poppins",
  "Montserrat",
  "Lora",
  "Roboto",
] as const;

export const DEFAULT_THEME: Omit<ThemeConfig, "updatedAt"> = {
  id: "default",
  primaryColor: "#2563eb",
  secondaryColor: "#1e40af",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#171717",
  fontFamily: "Inter",
  logoUrl: null,
  faviconUrl: null,
  layoutVariant: "hero_centered",
  borderRadius: "rounded",
  headerStyle: "solid",
};

const BORDER_RADIUS_MAP = {
  sharp: "0px",
  rounded: "0.5rem",
  pill: "9999px",
} as const;

export function themeToCssVariables(theme: ThemeConfig): string {
  const radius = BORDER_RADIUS_MAP[theme.borderRadius];
  const fontStack =
    theme.fontFamily === "Inter"
      ? "'Inter', system-ui, sans-serif"
      : `'${theme.fontFamily}', system-ui, sans-serif`;

  return `:root {
  --color-primary: ${theme.primaryColor};
  --color-secondary: ${theme.secondaryColor};
  --color-accent: ${theme.accentColor};
  --color-background: ${theme.backgroundColor};
  --color-text: ${theme.textColor};
  --font-family: ${fontStack};
  --radius: ${radius};
}`;
}

export function getGoogleFontUrl(fontFamily: string): string | null {
  if (fontFamily === "Inter") return null;
  const encoded = fontFamily.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
}
