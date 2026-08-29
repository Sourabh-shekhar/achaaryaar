import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.achaaryaar.com";

export const revalidate = 3600;

type Product = {
  _id: string;
  slug?: string;
  updatedAt?: string;
};

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Sitemap: Failed to fetch products", res.status);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data.products)) {
      console.error("Sitemap: Invalid products response");
      return [];
    }

    return data.products;
  } catch (error) {
    console.error("Sitemap: Product fetch error", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
    },
    {
      url: `${SITE_URL}/products`,
    },
    {
      url: `${SITE_URL}/blog`,
    },
    {
      url: `${SITE_URL}/about`,
    },
    {
      url: `${SITE_URL}/contact`,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
    },
    {
      url: `${SITE_URL}/shipping-policy`,
    },
    {
      url: `${SITE_URL}/returns`,
    },
    {
      url: `${SITE_URL}/terms`,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => product.slug || product._id)
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug ?? product._id}`,
      ...(product.updatedAt
        ? { lastModified: new Date(product.updatedAt) }
        : {}),
    }));

  return [...staticPages, ...productPages];
}