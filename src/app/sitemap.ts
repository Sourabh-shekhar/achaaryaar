import type { MetadataRoute } from "next";

const baseUrl = "https://www.achaaryaar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/products",
    "/about",
    "/blog",
    "/contact",
    "/careers",
    "/shipping-policy",
    "/returns",
    "/privacy-policy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/products" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
  }));
}
