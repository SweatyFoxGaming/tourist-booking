import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Tourist Booking",
  description:
    "Learn about Tourist Booking — our mission to connect travelers with unforgettable local experiences.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text)]">About Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            We connect curious travelers with handpicked local experiences — making it
            easy to discover, book, and enjoy the world&apos;s best activities.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Our Story</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Tourist Booking was founded with a simple idea: travel should be about
          meaningful moments, not complicated planning. We partner with local guides
          and experience providers to offer a curated selection of activities — from
          outdoor adventures and cultural tours to food and wine experiences.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Whether you&apos;re planning a weekend getaway or adding something special to a
          longer trip, our platform lets you browse, compare, and book in just a few
          clicks. No account required — just pick what you love and go.
        </p>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[var(--color-text)]">
            What We Stand For
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6">
              <Heart className="h-8 w-8 text-[var(--color-primary)]" />
              <h3 className="mt-4 font-semibold">Passion for Travel</h3>
              <p className="mt-2 text-sm text-gray-500">
                We believe the best trips are built on unique experiences, not
                checklists. Every activity on our platform is chosen with care.
              </p>
            </div>
            <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6">
              <Globe className="h-8 w-8 text-[var(--color-primary)]" />
              <h3 className="mt-4 font-semibold">Local Expertise</h3>
              <p className="mt-2 text-sm text-gray-500">
                Our partners are locals who know their regions inside out — sharing
                stories, hidden gems, and authentic culture along the way.
              </p>
            </div>
            <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6">
              <Users className="h-8 w-8 text-[var(--color-primary)]" />
              <h3 className="mt-4 font-semibold">Guest-First Booking</h3>
              <p className="mt-2 text-sm text-gray-500">
                Book as a guest with just your name and email. Create an account only
                if you want to track bookings and leave reviews.
              </p>
            </div>
            <div className="rounded-[var(--radius)] border border-gray-200 bg-white p-6">
              <Award className="h-8 w-8 text-[var(--color-primary)]" />
              <h3 className="mt-4 font-semibold">Quality & Safety</h3>
              <p className="mt-2 text-sm text-gray-500">
                We review every listing for accuracy, safety standards, and customer
                satisfaction. Your experience matters to us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Start your next adventure
        </h2>
        <p className="mt-3 text-gray-600">
          Explore our activities and find something unforgettable.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/activities">Browse Activities</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
