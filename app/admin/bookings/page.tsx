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
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      <p className="text-slate-300">View and manage all customer bookings</p>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-slate-800" />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-300">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Activity</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Guests</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-800/80 last:border-0">
                  <td className="p-4">
                    <div className="text-white">
                      {booking.user?.name ?? booking.guestName ?? "—"}
                    </div>
                    <div className="text-slate-400">
                      {booking.user?.email ?? booking.guestEmail ?? "—"}
                    </div>
                  </td>
                  <td className="p-4 text-slate-200">{booking.activity.title}</td>
                  <td className="p-4 text-slate-200">
                    {format(new Date(booking.slot.startTime), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="p-4 text-slate-200">{booking.guestCount}</td>
                  <td className="p-4 text-emerald-300">{formatPrice(booking.totalPrice)}</td>
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
            <p className="p-8 text-center text-slate-400">No bookings yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
