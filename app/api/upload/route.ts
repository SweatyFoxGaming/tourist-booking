import { NextResponse } from "next/server";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  uploadFile,
} from "@/lib/os/storage";
import { logger } from "@/lib/os/logger";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, GIF, or SVG." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".png";
  const filename = `${Date.now()}${ext}`;

  try {
    const result = await uploadFile({
      buffer,
      filename,
      contentType: file.type,
    });

    logger.info("api.upload", "File uploaded", {
      provider: result.provider,
      filename,
    });

    return NextResponse.json({ url: result.url, provider: result.provider });
  } catch (error) {
    logger.error("api.upload", "Upload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
