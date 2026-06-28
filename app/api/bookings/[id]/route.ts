import { NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { cancelBookingWithCapacity } from "@/lib/booking-capacity";
import { prisma } from "@/lib/db";
import { eventBus } from "@/lib/os";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const session = await auth();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { slot: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id === booking.userId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.status === "CANCELLED") {
    const cancelled = await cancelBookingWithCapacity(id);

    if (cancelled) {
      await eventBus.emit("booking.cancelled", {
        bookingId: cancelled.id,
        activityId: cancelled.activityId,
        slotId: cancelled.slotId,
        guestCount: cancelled.guestCount,
        reason: "user_or_admin_cancel",
      });
    }
  } else if (isAdmin && body.status) {
    await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });
  }

  const updated = await prisma.booking.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      activity: true,
      slot: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
