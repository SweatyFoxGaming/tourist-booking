import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type TransactionClient = Prisma.TransactionClient;

const MAX_RESERVE_ATTEMPTS = 5;

export async function reserveSlotCapacity(
  slotId: string,
  guestCount: number,
  tx: TransactionClient = prisma
): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_RESERVE_ATTEMPTS; attempt += 1) {
    const slot = await tx.activitySlot.findUnique({
      where: { id: slotId },
      select: { bookedCount: true, capacity: true },
    });

    if (!slot || slot.bookedCount + guestCount > slot.capacity) {
      return false;
    }

    const result = await tx.activitySlot.updateMany({
      where: {
        id: slotId,
        bookedCount: slot.bookedCount,
      },
      data: {
        bookedCount: { increment: guestCount },
      },
    });

    if (result.count === 1) {
      return true;
    }
  }

  return false;
}

export async function releaseSlotCapacity(
  slotId: string,
  guestCount: number,
  tx: TransactionClient = prisma
): Promise<void> {
  await tx.activitySlot.updateMany({
    where: {
      id: slotId,
      bookedCount: { gte: guestCount },
    },
    data: {
      bookedCount: { decrement: guestCount },
    },
  });
}

export type CreateBookingInput = {
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  activityId: string;
  slotId: string;
  guestCount: number;
  totalPrice: number;
};

export async function createBookingWithCapacity(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    const reserved = await reserveSlotCapacity(input.slotId, input.guestCount, tx);
    if (!reserved) {
      return { ok: false as const, error: "Not enough capacity" };
    }

    const booking = await tx.booking.create({
      data: {
        userId: input.userId ?? null,
        guestName: input.guestName ?? null,
        guestEmail: input.guestEmail ?? null,
        guestPhone: input.guestPhone ?? null,
        activityId: input.activityId,
        slotId: input.slotId,
        guestCount: input.guestCount,
        totalPrice: input.totalPrice,
        status: "PENDING",
      },
      include: {
        activity: true,
        slot: true,
      },
    });

    return { ok: true as const, booking };
  });
}

export async function cancelBookingWithCapacity(bookingId: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { activity: true, slot: true },
    });

    if (!booking || booking.status === "CANCELLED") {
      return null;
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await releaseSlotCapacity(booking.slotId, booking.guestCount, tx);

    return booking;
  });
}
