import type { Metadata } from "next";
import Link from "next/link";
import { getSiteTheme } from "@/lib/theme-server";
import { Button } from "@/components/ui/button";
import { Compass, Shield, Sparkles, ArrowRight } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function HomePage() {
  const theme = await getSiteTheme();
  const t = await getTranslations("home");

  const heroContent = {
    hero_centered: (
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/5 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-6xl">
            {t("heroCenteredTitle")}
            <span className="block text-[var(--color-primary)]">{t("heroCenteredHighlight")}</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">{t("heroCenteredSubtitle")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/activities">
                {t("browseActivities")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">{t("aboutUs")}</Link>
            </Button>
          </div>
        </div>
      </section>
    ),
    hero_split: (
      <section className="grid min-h-[500px] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
          <h1 className="text-4xl font-bold text-[var(--color-text)] lg:text-5xl">
            {t("heroSplitTitle")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t("heroSplitSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/activities">{t("exploreActivities")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">{t("learnMore")}</Link>
            </Button>
          </div>
        </div>
        <div
          className="hidden lg:block"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          }}
        />
      </section>
    ),
    minimal: (
      <section className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{t("heroMinimalTitle")}</h1>
          <p className="mt-2 text-gray-600">{t("heroMinimalSubtitle")}</p>
          <Button className="mt-6" asChild>
            <Link href="/activities">{t("viewActivities")}</Link>
          </Button>
        </div>
      </section>
    ),
  };

  return (
    <div>
      {heroContent[theme.layoutVariant]}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Compass className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h2 className="mt-4 text-lg font-semibold">{t("featureCuratedTitle")}</h2>
            <p className="mt-2 text-sm text-gray-500">{t("featureCuratedBody")}</p>
          </div>
          <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Shield className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h2 className="mt-4 text-lg font-semibold">{t("featureSecureTitle")}</h2>
            <p className="mt-2 text-sm text-gray-500">{t("featureSecureBody")}</p>
          </div>
          <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Sparkles className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h2 className="mt-4 text-lg font-semibold">{t("featureFastTitle")}</h2>
            <p className="mt-2 text-sm text-gray-500">{t("featureFastBody")}</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">{t("ctaTitle")}</h2>
          <p className="mt-3 text-gray-600">{t("ctaBody")}</p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/activities">{t("seeAllActivities")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
