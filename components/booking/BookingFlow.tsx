"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
};

type Activity = {
  id: string;
  title: string;
  price: number;
  duration: number;
  cancellationPolicy?: string;
};

export default function BookingPage({
  activityId,
}: {
  activityId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/activities/${activityId}`)
      .then((r) => r.json())
      .then((data) => {
        setActivity({
          id: data.id,
          title: data.title,
          price: Number(data.price),
          duration: data.duration,
          cancellationPolicy: data.cancellationPolicy,
        });
        setSlots(data.slots ?? []);
      });
  }, [activityId]);

  const availableDates = slots.map((s) => new Date(s.startTime));
  const daySlots = selectedDate
    ? slots.filter((s) => isSameDay(new Date(s.startTime), selectedDate))
    : [];

  const maxGuests = selectedSlot
    ? selectedSlot.capacity - selectedSlot.bookedCount
    : 1;

  const total = activity ? activity.price * guestCount : 0;

  async function handleCheckout() {
    if (!selectedSlot || !activity) return;
    setLoading(true);
    setError("");

    const bookingPayload: Record<string, unknown> = {
      activityId: activity.id,
      slotId: selectedSlot.id,
      guestCount,
    };

    if (!isLoggedIn) {
      bookingPayload.guestName = guestName.trim();
      bookingPayload.guestEmail = guestEmail.trim();
    }

    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload),
    });

    if (!bookingRes.ok) {
      const data = await bookingRes.json();
      setError(data.error ?? "Failed to create booking");
      setLoading(false);
      return;
    }

    const booking = await bookingRes.json();

    const checkoutRes = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
    });

    const checkoutData = await checkoutRes.json();

    if (checkoutData.url) {
      router.push(checkoutData.url);
    } else {
      setError("Failed to start checkout");
      setLoading(false);
    }
  }

  if (!activity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-[var(--radius)] bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[var(--color-text)]">Book: {activity.title}</h1>
      <p className="mt-2 text-gray-500">
        Select a date, time, and number of guests — no account required
      </p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose a Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              disabled={(date) =>
                !availableDates.some((d) => isSameDay(d, date)) ||
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>2. Choose a Time</CardTitle>
            </CardHeader>
            <CardContent>
              {daySlots.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {daySlots.map((slot) => {
                    const available = slot.capacity - slot.bookedCount;
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        disabled={available <= 0}
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center gap-2 rounded-[var(--radius)] border p-3 text-left transition-colors ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "hover:border-gray-400"
                        } ${available <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(slot.startTime), "h:mm a")} –{" "}
                            {format(new Date(slot.endTime), "h:mm a")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {available} spot{available !== 1 ? "s" : ""} left
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No slots available on this date.</p>
              )}
            </CardContent>
          </Card>
        )}

        {selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle>3. Guests & Checkout</CardTitle>
            </CardHeader>
            <CardHeader>
              <CardTitle>3. {isLoggedIn ? "Guests & Checkout" : "Your Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLoggedIn && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        placeholder="Jane Traveler"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    We&apos;ll send your booking confirmation to this email. No account needed.
                  </p>
                </>
              )}

              {isLoggedIn && (
                <p className="text-sm text-gray-500">
                  Booking as {session.user.name ?? session.user.email}
                </p>
              )}

              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={maxGuests}
                    value={guestCount}
                    onChange={(e) =>
                      setGuestCount(Math.min(maxGuests, Math.max(1, parseInt(e.target.value, 10) || 1)))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">max {maxGuests}</span>
                </div>
              </div>

              <div className="rounded-[var(--radius)] bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span>{formatPrice(activity.price)} × {guestCount} guest{guestCount !== 1 ? "s" : ""}</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              {activity.cancellationPolicy && (
                <p className="text-sm text-gray-500">{activity.cancellationPolicy}</p>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={
                  loading ||
                  (!isLoggedIn && (!guestName.trim() || !guestEmail.trim()))
                }
              >
                {loading ? "Processing..." : `Proceed to Payment — ${formatPrice(total)}`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
