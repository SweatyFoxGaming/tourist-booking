import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteTheme } from "@/lib/theme-server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const theme = await getSiteTheme();
  return NextResponse.json(theme);
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const theme = await prisma.siteTheme.upsert({
    where: { id: "default" },
    update: {
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      fontFamily: body.fontFamily,
      logoUrl: body.logoUrl ?? null,
      faviconUrl: body.faviconUrl ?? null,
      layoutVariant: body.layoutVariant,
      borderRadius: body.borderRadius,
      headerStyle: body.headerStyle,
    },
    create: {
      id: "default",
      ...body,
    },
  });

  return NextResponse.json(theme);
}
