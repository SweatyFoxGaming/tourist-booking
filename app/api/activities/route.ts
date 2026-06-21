import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const admin = searchParams.get("admin") === "true";

  const where: Prisma.ActivityWhereInput = {};

  if (!admin) {
    where.isPublished = true;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { location: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: admin
      ? { _count: { select: { bookings: true, slots: true } } }
      : {
          reviews: {
            where: { isVisible: true },
            select: { rating: true },
          },
        },
  });

  const result = activities.map((activity) => {
    const reviews = "reviews" in activity ? activity.reviews : null;
    if (Array.isArray(reviews)) {
      const ratings = reviews.map((r: { rating: number }) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;
      const { reviews: _, ...rest } = activity as typeof activity & {
        reviews: { rating: number }[];
      };
      return { ...rest, avgRating, reviewCount: reviews.length };
    }
    return activity;
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const slug = body.slug || slugify(body.title);

  const activity = await prisma.activity.create({
    data: {
      title: body.title,
      slug,
      description: body.description,
      location: body.location,
      duration: parseInt(body.duration, 10),
      price: parseFloat(body.price),
      images: body.images ?? [],
      category: body.category,
      cancellationPolicy: body.cancellationPolicy,
      cancellationHours: parseInt(body.cancellationHours ?? "24", 10),
      isPublished: body.isPublished ?? false,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
