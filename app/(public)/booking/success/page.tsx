import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type SearchParams = { searchParams: Promise<{ bookingId?: string }> };

export default async function BookingSuccessPage({ searchParams }: SearchParams) {
  const { bookingId } = await searchParams;

  let booking = null;
  if (bookingId) {
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        activity: true,
        slot: true,
      },
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)]">
        Booking Confirmed!
      </h1>
      <p className="mt-2 text-gray-500">
        Your payment was successful. A confirmation email is on its way with your
        booking reference.
      </p>

      {booking && (
        <Card className="mt-8 text-left">
          <CardContent className="space-y-3 p-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Activity</span>
              <span className="font-medium">{booking.activity.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">
                {booking.slot.startTime.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium">{booking.guestCount}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-[var(--color-primary)]">
                {formatPrice(Number(booking.totalPrice))}
              </span>
            </div>
            <div className="border-t pt-3">
              <span className="text-gray-500">Reference</span>
              <p className="mt-1 break-all font-mono text-sm">{booking.id}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/booking/lookup">Find My Booking</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/activities">Browse More</Link>
        </Button>
      </div>
    </div>
  );
}
