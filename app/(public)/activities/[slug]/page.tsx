import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDuration, formatPrice, asStringArray } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Shield } from "lucide-react";
import { ReviewSection } from "@/components/activities/ReviewSection";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const activity = await prisma.activity.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, description: true, location: true },
  });

  if (!activity) return { title: "Activity Not Found" };

  return {
    title: `${activity.title} | Tourist Booking`,
    description: activity.description.slice(0, 160),
    openGraph: {
      title: activity.title,
      description: activity.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function ActivityDetailPage({ params }: Params) {
  const { slug } = await params;

  const activity = await prisma.activity.findFirst({
    where: { slug, isPublished: true },
    include: {
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!activity) notFound();

  const ratings = activity.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

  const images = asStringArray(activity.images);
  const image = images[0] ?? "/placeholder-activity.jpg";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
          <Image
            src={image}
            alt={activity.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          <Badge>{activity.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {activity.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {activity.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(activity.duration)}
            </span>
            {avgRating != null && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                {avgRating.toFixed(1)} ({activity.reviews.length} reviews)
              </span>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">{activity.description}</p>

          <div className="mt-6 flex gap-2 rounded-[var(--radius)] bg-gray-50 p-4 text-sm text-gray-600">
            <Shield className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <p>{activity.cancellationPolicy}</p>
          </div>

          <Card className="mt-8">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]">
                  {formatPrice(Number(activity.price))}
                </p>
                <p className="text-sm text-gray-500">per person · no account needed</p>
              </div>
              <Button size="lg" asChild>
                <Link href={`/book/${activity.id}`}>Book Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewSection
        activityId={activity.id}
        reviews={activity.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          userName: r.user?.name ?? r.guestName ?? "Guest",
        }))}
      />
    </div>
  );
}
