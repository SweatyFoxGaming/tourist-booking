import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/os/http";
import { sendContactViaWhatsApp } from "@/lib/whatsapp";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "contact", {
    limit: 5,
    windowMs: 60_000,
  });
  if (limited instanceof NextResponse) {
    return limited;
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  await Promise.allSettled([
    sendContactEmail(parsed.data),
    sendContactViaWhatsApp(parsed.data),
  ]);

  return NextResponse.json({ success: true });
}
