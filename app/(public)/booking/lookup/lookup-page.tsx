"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Search, Calendar } from "lucide-react";

type BookingResult = {
  id: string;
  status: string;
  guestCount: number;
  totalPrice: number;
  activity: {
    title: string;
    slug: string;
    cancellationPolicy: string;
    cancellationHours: number;
  };
  slot: { startTime: string; endTime: string };
  hasReview: boolean;
  reviewToken: string | null;
  canCancel: boolean;
  cancelReason?: string;
};

export default function BookingLookupClient() {
  const [email, setEmail] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/bookings/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), bookingId: bookingId.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Booking not found");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(true);
    setError("");

    const res = await fetch("/api/bookings/lookup", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), bookingId: bookingId.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not cancel booking");
      setCancelling(false);
      return;
    }

    setResult((prev) => (prev ? { ...prev, status: "CANCELLED", canCancel: false } : null));
    setCancelling(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Search className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
        <h1 className="mt-4 text-3xl font-bold text-[var(--color-text)]">Find Your Booking</h1>
        <p className="mt-2 text-gray-500">
          Enter the email and booking reference from your confirmation email.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Look up booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bookingId">Booking reference</Label>
              <Input
                id="bookingId"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
                placeholder="e.g. clx..."
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching..." : "Find Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/activities/${result.activity.slug}`}
                  className="text-lg font-semibold hover:text-[var(--color-primary)]"
                >
                  {result.activity.title}
                </Link>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(result.slot.startTime).toLocaleString()}
                </p>
              </div>
              <Badge
                variant={
                  result.status === "CONFIRMED"
                    ? "success"
                    : result.status === "CANCELLED"
                      ? "outline"
                      : "warning"
                }
              >
                {result.status}
              </Badge>
            </div>

            <div className="rounded-[var(--radius)] bg-gray-50 p-4 text-sm">
              <p className="font-medium">Cancellation policy</p>
              <p className="mt-1 text-gray-600">{result.activity.cancellationPolicy}</p>
            </div>

            <div className="flex justify-between border-t pt-4 text-sm">
              <span className="text-gray-500">
                {result.guestCount} guest{result.guestCount !== 1 ? "s" : ""}
              </span>
              <span className="font-bold">{formatPrice(result.totalPrice)}</span>
            </div>

            <p className="text-xs text-gray-400">Reference: {result.id}</p>

            <div className="flex flex-wrap gap-3">
              {result.canCancel && (
                <Button variant="outline" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
              {result.status === "CONFIRMED" &&
                !result.hasReview &&
                result.reviewToken && (
                  <Button variant="outline" asChild>
                    <Link href={`/review/${result.reviewToken}`}>Leave a Review</Link>
                  </Button>
                )}
            </div>

            {!result.canCancel && result.cancelReason && result.status === "CONFIRMED" && (
              <p className="text-sm text-gray-500">{result.cancelReason}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
