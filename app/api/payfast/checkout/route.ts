import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookingContact } from "@/lib/booking";
import { confirmBooking } from "@/lib/confirm-booking";
import { prisma } from "@/lib/db";
import { buildPayfastCheckoutData, isPayfastConfigured } from "@/lib/payfast";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const { bookingId } = body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      activity: true,
      slot: true,
      user: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  const isOwner = session?.user?.id && booking.userId === session.user.id;
  const isGuestBooking = !booking.userId;

  if (!isOwner && !isGuestBooking) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking already processed" }, { status: 400 });
  }

  const contact = getBookingContact(booking);

  if (!contact.email) {
    return NextResponse.json({ error: "Missing contact email" }, { status: 400 });
  }

  if (!isPayfastConfigured()) {
    await confirmBooking(bookingId, `dev_${bookingId}`);

    return NextResponse.json({
      url: `${process.env.NEXTAUTH_URL}/booking/success?bookingId=${bookingId}`,
      devMode: true,
    });
  }

  const checkout = buildPayfastCheckoutData({
    bookingId: booking.id,
    activityId: booking.activityId,
    amount: Number(booking.totalPrice),
    itemName: booking.activity.title,
    itemDescription: `Booking for ${booking.guestCount} guest(s) on ${booking.slot.startTime.toLocaleString()}`,
    customerName: contact.name,
    customerEmail: contact.email,
  });

  return NextResponse.json(checkout);
}
