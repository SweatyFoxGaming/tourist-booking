"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, asStringArray } from "@/lib/utils";
import { MapPin, Clock, Star, Handshake } from "lucide-react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locale";

type ActivityCardProps = {
  activity: {
    id: string;
    title: string;
    slug: string;
    location: string;
    duration: number;
    price: { toString(): string } | number;
    images: unknown;
    category: string;
    avgRating?: number | null;
    reviewCount?: number;
    wholesaler?: { id: string; name: string; slug: string } | null;
  };
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const t = useTranslations("activities");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const images = asStringArray(activity.images);
  const image = images[0] ?? "/placeholder-activity.jpg";
  const price = formatPrice(Number(activity.price), locale);
  const durationText =
    activity.duration < 60
      ? tCommon("min", { count: activity.duration })
      : (() => {
          const hours = Math.floor(activity.duration / 60);
          const mins = activity.duration % 60;
          return mins > 0
            ? tCommon("hoursMinutes", { hours, minutes: mins })
            : tCommon("hours", { hours });
        })();

  return (
    <Link href={`/activities/${activity.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={activity.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge className="absolute left-3 top-3">{activity.category}</Badge>
          {activity.wholesaler && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-3 flex items-center gap-1"
            >
              <Handshake className="h-3 w-3" />
              {activity.wholesaler.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
            {activity.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {activity.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {durationText}
            </span>
          </div>
          {activity.avgRating != null && activity.reviewCount != null && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              {activity.avgRating.toFixed(1)} ({t("reviews", { count: activity.reviewCount })})
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-[var(--color-primary)]">{price}</span>
            <span className="text-sm text-gray-500">{t("perPerson")}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
