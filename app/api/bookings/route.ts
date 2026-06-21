import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth, requireAdmin } from "@/lib/auth";

const guestBookingSchema = z.object({
  activityId: z.string(),
  slotId: z.string(),
  guestCount: z.number().int().min(1),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        activity: { select: { title: true, slug: true } },
        slot: { select: { startTime: true, endTime: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  }

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      activity: { select: { title: true, slug: true, images: true, location: true } },
      slot: { select: { startTime: true, endTime: true } },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();

  const slot = await prisma.activitySlot.findUnique({
    where: { id: body.slotId },
    include: { activity: true },
  });

  if (!slot || slot.activityId !== body.activityId) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const guestCount = parseInt(body.guestCount, 10);
  if (!guestCount || guestCount < 1) {
    return NextResponse.json({ error: "Invalid guest count" }, { status: 400 });
  }

  if (slot.bookedCount + guestCount > slot.capacity) {
    return NextResponse.json({ error: "Not enough capacity" }, { status: 400 });
  }

  const totalPrice = Number(slot.activity.price) * guestCount;

  if (session?.user) {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        activityId: body.activityId,
        slotId: body.slotId,
        guestCount,
        totalPrice,
        status: "PENDING",
      },
      include: {
        activity: true,
        slot: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  }

  const parsed = guestBookingSchema.safeParse({
    activityId: body.activityId,
    slotId: body.slotId,
    guestCount,
    guestName: body.guestName,
    guestEmail: body.guestEmail,
    guestPhone: body.guestPhone,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Name and valid email are required" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      guestName: parsed.data.guestName,
      guestEmail: parsed.data.guestEmail,
      guestPhone: parsed.data.guestPhone?.trim() || null,
      activityId: parsed.data.activityId,
      slotId: parsed.data.slotId,
      guestCount: parsed.data.guestCount,
      totalPrice,
      status: "PENDING",
    },
    include: {
      activity: true,
      slot: true,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
