import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, requireAdmin } from "@/lib/auth";

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
    await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
      prisma.activitySlot.update({
        where: { id: booking.slotId },
        data: { bookedCount: { decrement: booking.guestCount } },
      }),
    ]);
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
