import { randomUUID } from "crypto";

type BookingContact = {
  user?: { name: string | null; email: string } | null;
  guestName?: string | null;
  guestEmail?: string | null;
};

export function getBookingContact(booking: BookingContact) {
  return {
    name: booking.user?.name ?? booking.guestName ?? "Guest",
    email: booking.user?.email ?? booking.guestEmail ?? "",
  };
}

type CancellationInput = {
  cancellationHours: number;
  slotStart: Date;
  status: string;
};

export function canCancelBooking({
  cancellationHours,
  slotStart,
  status,
}: CancellationInput): { allowed: boolean; reason?: string } {
  if (status !== "CONFIRMED") {
    return { allowed: false, reason: "Only confirmed bookings can be cancelled." };
  }

  if (cancellationHours === 0) {
    return { allowed: false, reason: "This activity is non-refundable." };
  }

  const cutoff = slotStart.getTime() - cancellationHours * 60 * 60 * 1000;
  if (Date.now() >= cutoff) {
    return {
      allowed: false,
      reason: `Cancellation must be at least ${cancellationHours} hours before the activity starts.`,
    };
  }

  return { allowed: true };
}

export function createReviewToken(): string {
  return randomUUID();
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
