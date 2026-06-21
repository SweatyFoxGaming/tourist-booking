"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Calendar, Mail, Phone, Globe } from "lucide-react";

type WholesalerDetail = {
  id: string;
  name: string;
  slug: string;
  contactName: string | null;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  notes: string | null;
  commissionRate: number | null;
  isActive: boolean;
  activities: {
    id: string;
    title: string;
    slug: string;
    price: number;
    isPublished: boolean;
    _count: { slots: number; bookings: number };
  }[];
};

export default function WholesalerDetailPage() {
  const params = useParams<{ id: string }>();
  const [wholesaler, setWholesaler] = useState<WholesalerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wholesalers/${params.id}`)
      .then((r) => r.json())
      .then(setWholesaler)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-800" />;
  }

  if (!wholesaler?.id) {
    return <p className="text-slate-300">Wholesaler not found.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{wholesaler.name}</h1>
            <Badge variant={wholesaler.isActive ? "success" : "outline"}>
              {wholesaler.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-300">/{wholesaler.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/wholesalers/${wholesaler.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit partner
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/wholesalers/${wholesaler.id}/activities/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add partner activity
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-1">
          <h2 className="font-semibold text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {wholesaler.contactName && <li>{wholesaler.contactName}</li>}
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              {wholesaler.contactEmail}
            </li>
            {wholesaler.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                {wholesaler.contactPhone}
              </li>
            )}
            {wholesaler.website && (
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                <a
                  href={wholesaler.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {wholesaler.website}
                </a>
              </li>
            )}
            {wholesaler.commissionRate != null && (
              <li className="pt-2 text-slate-300">
                Commission: {wholesaler.commissionRate}%
              </li>
            )}
          </ul>
          {wholesaler.notes && (
            <p className="mt-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
              {wholesaler.notes}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
          <h2 className="font-semibold text-white">Partner activities</h2>
          {wholesaler.activities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">
              No activities linked yet. Add one to publish it on your site under this
              partner.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-300">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Slots</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesaler.activities.map((activity) => (
                    <tr key={activity.id} className="border-b border-slate-800/80 last:border-0">
                      <td className="py-3 pr-4 text-white">{activity.title}</td>
                      <td className="py-3 pr-4 text-slate-200">
                        {formatPrice(Number(activity.price))}
                      </td>
                      <td className="py-3 pr-4 text-slate-200">
                        {activity._count.slots}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={activity.isPublished ? "success" : "outline"}>
                          {activity.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3">
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
        </section>
      </div>
    </div>
  );
}
