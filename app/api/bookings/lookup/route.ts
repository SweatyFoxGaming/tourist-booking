import { NextResponse } from "next/server";
import { z } from "zod";
import { canCancelBooking } from "@/lib/booking";
import { cancelBookingWithCapacity } from "@/lib/booking-capacity";
import { findBookingByEmailAndId } from "@/lib/booking-server";
import { enforceRateLimit } from "@/lib/os/http";
import { eventBus } from "@/lib/os";

const lookupSchema = z.object({
  email: z.string().email(),
  bookingId: z.string().min(1),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "booking-lookup", {
    limit: 15,
    windowMs: 60_000,
  });
  if (limited instanceof NextResponse) {
    return limited;
  }

  const body = await request.json();
  const parsed = lookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or booking reference" }, { status: 400 });
  }

  const booking = await findBookingByEmailAndId(
    parsed.data.email,
    parsed.data.bookingId.trim()
  );

  if (!booking) {
    return NextResponse.json(
      { error: "No booking found with that email and reference" },
      { status: 404 }
    );
  }

  const cancellation = canCancelBooking({
    cancellationHours: booking.activity.cancellationHours,
    slotStart: booking.slot.startTime,
    status: booking.status,
  });

  return NextResponse.json({
    id: booking.id,
    status: booking.status,
    guestCount: booking.guestCount,
    totalPrice: booking.totalPrice,
    activity: booking.activity,
    slot: booking.slot,
    hasReview: !!booking.review,
    reviewToken: booking.reviewToken,
    canCancel: cancellation.allowed,
    cancelReason: cancellation.reason,
  });
}

export async function DELETE(request: Request) {
  const limited = enforceRateLimit(request, "booking-cancel", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited instanceof NextResponse) {
    return limited;
  }

  const body = await request.json();
  const parsed = lookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or booking reference" }, { status: 400 });
  }

  const booking = await findBookingByEmailAndId(
    parsed.data.email,
    parsed.data.bookingId.trim()
  );

  if (!booking) {
    return NextResponse.json(
      { error: "No booking found with that email and reference" },
      { status: 404 }
    );
  }

  const cancellation = canCancelBooking({
    cancellationHours: booking.activity.cancellationHours,
    slotStart: booking.slot.startTime,
    status: booking.status,
  });

  if (!cancellation.allowed) {
    return NextResponse.json({ error: cancellation.reason }, { status: 400 });
  }

  const cancelled = await cancelBookingWithCapacity(booking.id);

  if (cancelled) {
    await eventBus.emit("booking.cancelled", {
      bookingId: cancelled.id,
      activityId: cancelled.activityId,
      slotId: cancelled.slotId,
      guestCount: cancelled.guestCount,
      reason: "guest_lookup_cancel",
    });
  }

  return NextResponse.json({ success: true, status: "CANCELLED" });
}
