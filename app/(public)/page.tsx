import type { Metadata } from "next";
import Link from "next/link";
import { getSiteTheme } from "@/lib/theme-server";
import { Button } from "@/components/ui/button";
import { Compass, Shield, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Home | Tourist Booking",
  description:
    "Book unique tourist activities and experiences worldwide. No account required.",
};

export default async function HomePage() {
  const theme = await getSiteTheme();

  const heroContent = {
    hero_centered: (
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/5 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-6xl">
            Discover Extraordinary
            <span className="block text-[var(--color-primary)]">Tourist Experiences</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Book unique activities curated by local experts. From sunset kayak adventures
            to wine country tours — your next unforgettable moment starts here.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/activities">
                Browse Activities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </section>
    ),
    hero_split: (
      <section className="grid min-h-[500px] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
          <h1 className="text-4xl font-bold text-[var(--color-text)] lg:text-5xl">
            Your Adventure Awaits
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Handpicked tourist activities with instant booking — no sign-in required.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/activities">Explore Activities</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
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
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Welcome to Tourist Booking
          </h1>
          <p className="mt-2 text-gray-600">
            Curated experiences with flexible scheduling and guest checkout.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/activities">View Activities</Link>
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
            <h2 className="mt-4 text-lg font-semibold">Curated Experiences</h2>
            <p className="mt-2 text-sm text-gray-500">
              Every activity is vetted for quality, safety, and authentic local insight.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Shield className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h2 className="mt-4 text-lg font-semibold">Secure Booking</h2>
            <p className="mt-2 text-sm text-gray-500">
              Pay safely online and receive instant email confirmation for every booking.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Sparkles className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h2 className="mt-4 text-lg font-semibold">Book in Minutes</h2>
            <p className="mt-2 text-sm text-gray-500">
              Pick a date, choose your slot, enter your details — no account needed.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Ready to explore?
          </h2>
          <p className="mt-3 text-gray-600">
            Browse our full collection of adventures, tours, and local experiences.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/activities">See All Activities</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
