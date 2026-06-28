import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export function getSupportEmail(): string {
  return (
    process.env.SUPPORT_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "support@touristbooking.com"
  );
}

export async function getSupportKnowledgeBase(): Promise<string> {
  const activities = await prisma.activity.findMany({
    where: { isPublished: true },
    orderBy: { title: "asc" },
    select: {
      title: true,
      slug: true,
      location: true,
      category: true,
      price: true,
      duration: true,
      cancellationHours: true,
      description: true,
    },
    take: 30,
  });

  const activityLines =
    activities.length === 0
      ? "No published activities are listed right now."
      : activities
          .map((activity) => {
            const cancellation =
              activity.cancellationHours === 0
                ? "Non-refundable"
                : `Free cancellation up to ${activity.cancellationHours} hours before start`;
            return [
              `- ${activity.title} (${activity.category})`,
              `  Location: ${activity.location}`,
              `  Price: ${formatPrice(activity.price)} per person`,
              `  Duration: ${activity.duration} minutes`,
              `  Cancellation: ${cancellation}`,
              `  Page: /activities/${activity.slug}`,
              `  Book via the "Book Now" button on the activity page`,
              `  Summary: ${activity.description.slice(0, 180)}…`,
            ].join("\n");
          })
          .join("\n");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "ZAR";
  const supportEmail = getSupportEmail();

  return [
    "Site: Tourist Booking — book tourist activities online.",
    `Base URL: ${appUrl}`,
    `Currency: ${currency}`,
    "Guest checkout is supported — no account required.",
    "Booking lookup / cancellation: /booking/lookup (guests need booking reference + email).",
    "Contact form: /contact",
    `Support email: ${supportEmail}`,
    "Payments: PayFast (card / local methods depending on merchant setup).",
    "",
    "Published activities:",
    activityLines,
  ].join("\n");
}

export async function searchPublishedActivities(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  return prisma.activity.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: normalized } },
        { location: { contains: normalized } },
        { category: { contains: normalized } },
        { description: { contains: normalized } },
      ],
    },
    orderBy: { title: "asc" },
    take: 8,
    select: {
      title: true,
      slug: true,
      location: true,
      category: true,
      price: true,
      duration: true,
      cancellationHours: true,
    },
  });
}
