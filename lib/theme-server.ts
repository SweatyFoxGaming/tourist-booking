import { prisma } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/theme";
import type { SiteTheme } from "@prisma/client";

export async function getSiteTheme(): Promise<SiteTheme> {
  try {
    const theme = await prisma.siteTheme.findUnique({
      where: { id: "default" },
    });
    return theme ?? (DEFAULT_THEME as SiteTheme);
  } catch {
    return DEFAULT_THEME as SiteTheme;
  }
}
