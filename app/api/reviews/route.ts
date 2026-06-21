import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activityId = searchParams.get("activityId");
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        activity: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  }

  const where = activityId
    ? { activityId, isVisible: true }
    : { isVisible: true };

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      ...r,
      userName: r.user?.name ?? r.guestName ?? "Guest",
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookingId, rating, comment } = body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Can only review confirmed bookings" },
      { status: 400 }
    );
  }

  if (booking.review) {
    return NextResponse.json(
      { error: "Review already submitted" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      activityId: booking.activityId,
      bookingId,
      rating: parseInt(rating, 10),
      comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const review = await prisma.review.update({
    where: { id: body.id },
    data: { isVisible: body.isVisible },
  });

  return NextResponse.json(review);
}
