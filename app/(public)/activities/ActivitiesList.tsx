"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

type Activity = {
  id: string;
  title: string;
  slug: string;
  location: string;
  duration: number;
  price: number;
  images: unknown;
  category: string;
  avgRating?: number | null;
  reviewCount?: number;
  wholesaler?: { id: string; name: string; slug: string } | null;
};

export default function ActivitiesList() {
  const t = useTranslations("activities");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);

    setLoading(true);
    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [search, category]);

  const categories = [...new Set(activities.map((a) => a.category))];

  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-gray-600">{t("subtitle")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-[var(--radius)] bg-gray-200"
              />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t("noResults")}</p>
        )}
      </div>
    </div>
  );
}
