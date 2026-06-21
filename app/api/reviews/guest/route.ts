import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBookingContact } from "@/lib/booking";

const reviewSchema = z.object({
  token: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reviewSchema.safeParse({
    ...body,
    rating: parseInt(body.rating, 10),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { reviewToken: parsed.data.token },
    include: { review: true },
  });

  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Invalid or expired review link" }, { status: 400 });
  }

  if (booking.review) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
  }

  const contact = getBookingContact(booking);

  const review = await prisma.review.create({
    data: {
      activityId: booking.activityId,
      bookingId: booking.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      guestName: booking.userId ? undefined : contact.name,
      userId: booking.userId ?? undefined,
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { reviewToken: token },
    include: {
      activity: { select: { title: true, slug: true } },
      review: { select: { id: true } },
    },
  });

  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Invalid review link" }, { status: 404 });
  }

  return NextResponse.json({
    activityTitle: booking.activity.title,
    activitySlug: booking.activity.slug,
    hasReview: !!booking.review,
  });
}
