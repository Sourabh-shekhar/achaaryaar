import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://achaaryaar.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api/*",
        "/checkout",
        "/cart",
        "/profile",
        "/login",
        "/signup",
        "/order-success",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}