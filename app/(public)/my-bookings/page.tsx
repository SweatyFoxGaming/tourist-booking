"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ReviewForm } from "@/components/activities/ReviewSection";
import { MapPin, Calendar } from "lucide-react";

type Booking = {
  id: string;
  guestCount: number;
  totalPrice: number;
  status: string;
  activity: {
    title: string;
    slug: string;
    images: string[];
    location: string;
  };
  slot: {
    startTime: string;
    endTime: string;
  };
  review: { id: string } | null;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBookings() {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    loadBookings();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[var(--radius)] bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[var(--color-text)]">My Bookings</h1>
      <p className="mt-2 text-gray-500">Manage your upcoming and past activities</p>

      {bookings.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">You haven&apos;t booked any activities yet.</p>
          <Button className="mt-4" asChild>
            <Link href="/activities">Browse Activities</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0">
                    <Image
                      src={booking.activity.images[0] ?? "/placeholder-activity.jpg"}
                      alt={booking.activity.title}
                      fill
                      className="rounded-l-[var(--radius)] object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/activities/${booking.activity.slug}`}
                          className="text-lg font-semibold hover:text-[var(--color-primary)]"
                        >
                          {booking.activity.title}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.activity.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.slot.startTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "success"
                            : booking.status === "CANCELLED"
                              ? "outline"
                              : "warning"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {booking.guestCount} guest{booking.guestCount !== 1 ? "s" : ""} ·{" "}
                        {formatPrice(booking.totalPrice)}
                      </span>
                      {booking.status === "CONFIRMED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    {booking.status === "CONFIRMED" && !booking.review && (
                      <ReviewForm bookingId={booking.id} onSubmitted={loadBookings} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
