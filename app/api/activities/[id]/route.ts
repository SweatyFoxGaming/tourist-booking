import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const activity = await prisma.activity.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      wholesaler: { select: { id: true, name: true, slug: true, isActive: true } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      slots: {
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(activity);
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug || slugify(body.title),
      description: body.description,
      location: body.location,
      duration: parseInt(body.duration, 10),
      price: parseFloat(body.price),
      images: body.images,
      category: body.category,
      cancellationPolicy: body.cancellationPolicy,
      cancellationHours: parseInt(body.cancellationHours, 10),
      isPublished: body.isPublished,
      wholesalerId: body.wholesalerId ?? null,
    },
  });

  return NextResponse.json(activity);
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.activity.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
