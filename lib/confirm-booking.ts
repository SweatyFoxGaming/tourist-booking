import { prisma } from "@/lib/db";
import { createReviewToken } from "@/lib/booking";

export async function confirmBooking(bookingId: string, paymentReference?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true },
  });

  if (!booking || booking.status !== "PENDING") {
    return null;
  }

  const reviewToken = createReviewToken();

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        reviewToken,
        ...(paymentReference ? { paymentReference } : {}),
      },
    }),
    prisma.activitySlot.update({
      where: { id: booking.slotId },
      data: { bookedCount: { increment: booking.guestCount } },
    }),
  ]);

  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      activity: true,
      slot: true,
      user: true,
    },
  });
}
