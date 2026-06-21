import { NextResponse } from "next/server";
import { notifyBookingConfirmed } from "@/lib/booking-notifications";
import { confirmBooking } from "@/lib/confirm-booking";
import { prisma } from "@/lib/db";
import {
  amountsMatch,
  buildItnParamString,
  isPayfastConfigured,
  parsePayfastItnBody,
  validateItnWithPayfast,
  verifyPayfastItnSignature,
} from "@/lib/payfast";

export async function POST(request: Request) {
  if (!isPayfastConfigured()) {
    return new NextResponse("OK", { status: 200 });
  }

  const body = await request.text();
  const data = parsePayfastItnBody(body);
  const paramString = buildItnParamString(data);
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();

  if (!verifyPayfastItnSignature(data, paramString, passphrase || undefined)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const isValid = await validateItnWithPayfast(paramString);
  if (!isValid) {
    return new NextResponse("Invalid ITN", { status: 400 });
  }

  const bookingId = data.m_payment_id;
  const paymentStatus = data.payment_status;

  if (!bookingId || paymentStatus !== "COMPLETE") {
    return new NextResponse("OK", { status: 200 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      activity: true,
      slot: true,
      user: true,
    },
  });

  if (!booking) {
    return new NextResponse("OK", { status: 200 });
  }

  if (booking.status === "CONFIRMED") {
    return new NextResponse("OK", { status: 200 });
  }

  if (!amountsMatch(Number(booking.totalPrice), data.amount_gross)) {
    return new NextResponse("Amount mismatch", { status: 400 });
  }

  const confirmed = await confirmBooking(bookingId, data.pf_payment_id);

  if (confirmed) {
    await notifyBookingConfirmed(confirmed);
  }

  return new NextResponse("OK", { status: 200 });
}
