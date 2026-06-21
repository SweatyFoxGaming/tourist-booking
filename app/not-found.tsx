import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tHome = await getTranslations("home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-[var(--color-primary)]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
      <p className="mt-2 max-w-md text-gray-500">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/">{t("goHome")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/activities">{tHome("browseActivities")}</Link>
        </Button>
      </div>
    </div>
  );
}
