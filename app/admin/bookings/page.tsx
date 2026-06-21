"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type Booking = {
  id: string;
  guestCount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  guestName?: string | null;
  guestEmail?: string | null;
  user?: { name: string | null; email: string } | null;
  activity: { title: string; slug: string };
  slot: { startTime: string; endTime: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBookings() {
    fetch("/api/bookings?admin=true")
      .then((r) => r.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadBookings();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings</h1>
      <p className="text-gray-500">View and manage all customer bookings</p>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-[var(--radius)] bg-gray-200" />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[var(--radius)] border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="p-4">Customer</th>
                <th className="p-4">Activity</th>
                <th className="p-4">Date</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div>{booking.user?.name ?? booking.guestName ?? "—"}</div>
                    <div className="text-gray-400">
                      {booking.user?.email ?? booking.guestEmail ?? "—"}
                    </div>
                  </td>
                  <td className="p-4">{booking.activity.title}</td>
                  <td className="p-4">
                    {format(new Date(booking.slot.startTime), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="p-4">{booking.guestCount}</td>
                  <td className="p-4">{formatPrice(booking.totalPrice)}</td>
                  <td className="p-4">
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
                  </td>
                  <td className="p-4">
                    {booking.status !== "CANCELLED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(booking.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <p className="p-8 text-center text-gray-500">No bookings yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
