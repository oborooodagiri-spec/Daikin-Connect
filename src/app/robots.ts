import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://dconnect.id";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tools", "/privacy-policy", "/service-presentation"],
      disallow: [
        "/admin/",
        "/api/",
        "/dashboard/",
        "/w/", // Workspace private area
        "/passport/", // Secure tokens
        "/unit/", // Private unit data
        "/reports/", // Sensitive PDF generation
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
