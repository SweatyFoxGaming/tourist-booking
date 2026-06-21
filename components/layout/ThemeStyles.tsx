import type { SiteTheme } from "@prisma/client";
import { getGoogleFontUrl, themeToCssVariables } from "@/lib/theme";

export function ThemeStyles({ theme }: { theme: SiteTheme }) {
  const css = themeToCssVariables(theme);
  const fontUrl = getGoogleFontUrl(theme.fontFamily);

  return (
    <>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
