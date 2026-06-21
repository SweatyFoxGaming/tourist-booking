import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/booking";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl();

  const activities = await prisma.activity.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages = ["", "/activities", "/about", "/contact", "/terms", "/privacy", "/booking/lookup"];

  return [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...activities.map((activity) => ({
      url: `${baseUrl}/activities/${activity.slug}`,
      lastModified: activity.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
