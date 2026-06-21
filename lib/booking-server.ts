import { getBookingContact } from "@/lib/booking";
import { prisma } from "@/lib/db";

export async function findBookingByEmailAndId(email: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      activity: {
        select: {
          title: true,
          slug: true,
          cancellationPolicy: true,
          cancellationHours: true,
        },
      },
      slot: { select: { startTime: true, endTime: true } },
      user: { select: { name: true, email: true } },
      review: { select: { id: true } },
    },
  });

  if (!booking) return null;

  const contact = getBookingContact(booking);
  if (contact.email.toLowerCase() !== email.toLowerCase()) return null;

  return booking;
}
