import { getBookingContact } from "@/lib/booking";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import {
  sendAdminBookingAlertWhatsApp,
  sendBookingConfirmationWhatsApp,
} from "@/lib/whatsapp";

type ConfirmedBooking = {
  id: string;
  guestCount: number;
  totalPrice: number | { toString(): string };
  guestPhone?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  reviewToken?: string | null;
  activity: { title: string };
  slot: { startTime: Date };
  user?: { name: string | null; email: string } | null;
};

export async function notifyBookingConfirmed(booking: ConfirmedBooking) {
  const contact = getBookingContact(booking);
  const totalPrice = formatPrice(Number(booking.totalPrice));

  await Promise.allSettled([
    sendBookingConfirmationEmail({
      to: contact.email,
      customerName: contact.name,
      activityTitle: booking.activity.title,
      slotStart: booking.slot.startTime,
      guestCount: booking.guestCount,
      totalPrice,
      bookingId: booking.id,
      reviewToken: booking.reviewToken,
    }),
    sendBookingConfirmationWhatsApp({
      phone: booking.guestPhone,
      customerName: contact.name,
      activityTitle: booking.activity.title,
      slotStart: booking.slot.startTime,
      guestCount: booking.guestCount,
      totalPrice,
      bookingId: booking.id,
    }),
    sendAdminBookingAlertWhatsApp({
      customerName: contact.name,
      activityTitle: booking.activity.title,
      totalPrice,
      bookingId: booking.id,
      guestCount: booking.guestCount,
    }),
  ]);
}
