import { NextResponse } from "next/server";
import { z } from "zod";
import { canCancelBooking } from "@/lib/booking";
import { findBookingByEmailAndId } from "@/lib/booking-server";
import { prisma } from "@/lib/db";

const lookupSchema = z.object({
  email: z.string().email(),
  bookingId: z.string().min(1),
});

export async function POST(request: Request) {
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

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    }),
    prisma.activitySlot.update({
      where: { id: booking.slotId },
      data: { bookedCount: { decrement: booking.guestCount } },
    }),
  ]);

  return NextResponse.json({ success: true, status: "CANCELLED" });
}
