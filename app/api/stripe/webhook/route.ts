import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getBookingContact } from "@/lib/booking";
import { confirmBooking } from "@/lib/confirm-booking";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import Stripe from "stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ received: true, devMode: true });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const confirmed = await confirmBooking(bookingId);

      if (confirmed) {
        const contact = getBookingContact(confirmed);

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
    }
  }

  return NextResponse.json({ received: true });
}
