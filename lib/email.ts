import { getAppUrl, getBookingContact } from "@/lib/booking";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function isEmailConfigured(): boolean {
  return (
    !!resend &&
    !!process.env.RESEND_FROM_EMAIL &&
    !process.env.RESEND_API_KEY?.includes("placeholder")
  );
}

export async function sendBookingConfirmationEmail({
  to,
  customerName,
  activityTitle,
  slotStart,
  guestCount,
  totalPrice,
  bookingId,
  reviewToken,
}: {
  to: string;
  customerName: string;
  activityTitle: string;
  slotStart: Date;
  guestCount: number;
  totalPrice: string;
  bookingId: string;
  reviewToken?: string | null;
}) {
  const appUrl = getAppUrl();
  const lookupUrl = `${appUrl}/booking/lookup`;
  const reviewUrl = reviewToken ? `${appUrl}/review/${reviewToken}` : null;

  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    console.log("[email] Skipped — Resend not configured", {
      to,
      bookingId,
      lookupUrl,
      reviewUrl,
    });
    return;
  }

  const formattedDate = slotStart.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `Booking confirmed: ${activityTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Booking Confirmed!</h1>
        <p>Hi ${customerName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0;"><strong>Activity:</strong></td><td>${activityTitle}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Date & Time:</strong></td><td>${formattedDate}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Guests:</strong></td><td>${guestCount}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Total:</strong></td><td>${totalPrice}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Reference:</strong></td><td>${bookingId}</td></tr>
        </table>
        <p style="margin: 24px 0;">
          <a href="${lookupUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View or Cancel Booking
          </a>
        </p>
        ${reviewUrl ? `<p>After your experience, <a href="${reviewUrl}">leave a review</a>.</p>` : ""}
        <p>We look forward to seeing you!</p>
      </div>
    `,
  });
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.CONTACT_EMAIL ?? process.env.RESEND_FROM_EMAIL;

  if (!resend || !to || !process.env.RESEND_FROM_EMAIL) {
    console.log("[email] Contact form submission:", { name, email, subject, message });
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
}
