import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const slots = await prisma.activitySlot.findMany({
    where: {
      activityId: id,
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(slots);
}

export async function POST(request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const startTime = new Date(body.startTime);
  const endTime = body.endTime
    ? new Date(body.endTime)
    : new Date(startTime.getTime() + (body.durationMinutes ?? 120) * 60000);

  const slot = await prisma.activitySlot.create({
    data: {
      activityId: id,
      startTime,
      endTime,
      capacity: body.capacity ?? 10,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const slotId = searchParams.get("slotId");

  if (!slotId) {
    return NextResponse.json({ error: "slotId required" }, { status: 400 });
  }

  const slot = await prisma.activitySlot.findFirst({
    where: { id: slotId, activityId: id },
  });

  if (!slot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (slot.bookedCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete slot with existing bookings" },
      { status: 400 }
    );
  }

  await prisma.activitySlot.delete({ where: { id: slotId } });

  return NextResponse.json({ success: true });
}
