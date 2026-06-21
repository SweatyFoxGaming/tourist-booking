import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/booking";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/book/", "/review/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
