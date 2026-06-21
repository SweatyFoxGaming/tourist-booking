import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookingContact } from "@/lib/booking";
import { confirmBooking } from "@/lib/confirm-booking";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";

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

  if (!isStripeConfigured()) {
    const confirmed = await confirmBooking(bookingId, `dev_${bookingId}`);

    if (confirmed) {
      await sendBookingConfirmationEmail({
        to: contact.email,
        customerName: contact.name,
        activityTitle: confirmed.activity.title,
        slotStart: confirmed.slot.startTime,
        guestCount: confirmed.guestCount,
        totalPrice: formatPrice(Number(confirmed.totalPrice)),
        bookingId: confirmed.id,
        reviewToken: confirmed.reviewToken,
      });
    }

    return NextResponse.json({
      url: `${process.env.NEXTAUTH_URL}/booking/success?bookingId=${bookingId}`,
      devMode: true,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: contact.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.activity.title,
            description: `Booking for ${booking.guestCount} guest(s) on ${booking.slot.startTime.toLocaleString()}`,
          },
          unit_amount: Math.round(Number(booking.totalPrice) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
    },
    success_url: `${process.env.NEXTAUTH_URL}/booking/success?bookingId=${bookingId}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/book/${booking.activityId}?cancelled=true`,
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
