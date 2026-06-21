import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const wholesaler = await prisma.wholesaler.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { slots: true, bookings: true } },
        },
      },
      _count: { select: { activities: true } },
    },
  });

  if (!wholesaler) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wholesaler);
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const slug = body.slug?.trim() || slugify(body.name);

  const conflict = await prisma.wholesaler.findFirst({
    where: { slug, NOT: { id } },
  });

  if (conflict) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
  }

  const wholesaler = await prisma.wholesaler.update({
    where: { id },
    data: {
      name: body.name.trim(),
      slug,
      contactName: body.contactName?.trim() || null,
      contactEmail: body.contactEmail.trim(),
      contactPhone: body.contactPhone?.trim() || null,
      website: body.website?.trim() || null,
      notes: body.notes?.trim() || null,
      commissionRate:
        body.commissionRate != null && body.commissionRate !== ""
          ? parseFloat(body.commissionRate)
          : null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(wholesaler);
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const activityCount = await prisma.activity.count({ where: { wholesalerId: id } });
  if (activityCount > 0) {
    return NextResponse.json(
      { error: "Remove or reassign partner activities before deleting this wholesaler" },
      { status: 400 }
    );
  }

  await prisma.wholesaler.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
