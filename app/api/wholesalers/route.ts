import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const wholesalers = await prisma.wholesaler.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { activities: true } },
    },
  });

  return NextResponse.json(wholesalers);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const slug = body.slug?.trim() || slugify(body.name);

  if (!body.name?.trim() || !body.contactEmail?.trim()) {
    return NextResponse.json(
      { error: "Name and contact email are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.wholesaler.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
  }

  const wholesaler = await prisma.wholesaler.create({
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

  return NextResponse.json(wholesaler, { status: 201 });
}
