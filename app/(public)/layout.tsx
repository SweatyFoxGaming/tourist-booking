import { ThemedHeader, ThemedFooter } from "@/components/layout/ThemedHeader";
import { SupportButton } from "@/components/layout/SupportButton";
import { getSiteTheme } from "@/lib/theme-server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getSiteTheme();

  return (
    <>
      <ThemedHeader theme={theme} />
      <main className="flex-1">{children}</main>
      <ThemedFooter />
      <SupportButton />
    </>
  );
}
