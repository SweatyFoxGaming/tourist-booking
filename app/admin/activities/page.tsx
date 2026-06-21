"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Calendar } from "lucide-react";

type Activity = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  isPublished: boolean;
  wholesaler?: { name: string } | null;
  _count?: { bookings: number; slots: number };
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities?admin=true")
      .then((r) => r.json())
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, isPublished: boolean) {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    await fetch(`/api/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activity, isPublished: !isPublished }),
    });

    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPublished: !isPublished } : a))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activities</h1>
          <p className="text-slate-300">Manage tourist activities and availability</p>
        </div>
        <Button asChild>
          <Link href="/admin/activities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-slate-800" />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-300">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Partner</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Slots</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-slate-800/80 last:border-0">
                  <td className="p-4 font-medium text-white">{activity.title}</td>
                  <td className="p-4 text-slate-200">{activity.category}</td>
                  <td className="p-4 text-slate-300">
                    {activity.wholesaler?.name ?? "—"}
                  </td>
                  <td className="p-4 text-slate-200">{formatPrice(activity.price)}</td>
                  <td className="p-4 text-slate-200">{activity._count?.slots ?? 0}</td>
                  <td className="p-4">
                    <button onClick={() => togglePublish(activity.id, activity.isPublished)}>
                      <Badge variant={activity.isPublished ? "success" : "outline"}>
                        {activity.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/activities/${activity.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/activities/${activity.id}/slots`}>
                          <Calendar className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
