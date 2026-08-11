import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { baseUrl } from "@/lib/baseUrl";
import type { Metadata } from "next";
import Script from "next/script";

export const revalidate = 60;

async function getProduct(id: string) {
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    next: { revalidate },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.product;
}

async function getAllProducts() {
  const res = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.products || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | AchaarYaar",
    };
  }

  const image =
    product.images?.length > 0
      ? product.images[0].startsWith("http")
        ? product.images[0]
        : `https://www.achaaryaar.com${product.images[0]}`
      : product.image.startsWith("http")
      ? product.image
      : `https://www.achaaryaar.com${product.image}`;

  return {
    title: `${product.name} | AchaarYaar`,
    description:
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} online from AchaarYaar.`,

    keywords: [
      product.name,
      `${product.name} pickle`,
      `${product.name} achar`,
      "Homemade Pickle",
      "Bihar Pickle",
      "Traditional Pickle",
      "Buy Pickle Online",
      "AchaarYaar",
    ],

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: `https://www.achaaryaar.com/products/${id}`,
    },

    openGraph: {
      title: `${product.name} | AchaarYaar`,
      description: product.shortDescription || product.description,
      url: `https://www.achaaryaar.com/products/${id}`,
      siteName: "AchaarYaar",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.name} | AchaarYaar`,
      description:
        product.shortDescription || product.description,
      images: [image],
    },
  };
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) return notFound();

  const allProducts = await getAllProducts();

  const relatedProducts = allProducts
    .filter((p: any) => p._id !== product._id)
    .slice(0, 3);

  const image =
    product.images?.length > 0
      ? product.images.map((img: string) =>
          img.startsWith("http")
            ? img
            : `https://www.achaaryaar.com${img}`
        )
      : [
          product.image.startsWith("http")
            ? product.image
            : `https://www.achaaryaar.com${product.image}`,
        ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description:
      product.shortDescription || product.description,

    image,

    sku: product._id,

    identifierExists: false,

    brand: {
      "@type": "Brand",
      name: "AchaarYaar",
    },

    manufacturer: {
      "@type": "Organization",
      name: "AchaarYaar",
      url: "https://www.achaaryaar.com",
    },

    category: product.category,

    url: `https://www.achaaryaar.com/products/${id}`,

    countryOfOrigin: {
      "@type": "Country",
      name: "India",
    },

    material: "Natural Ingredients",

    weight: {
      "@type": "QuantitativeValue",
      value: product.isCombo
        ? product.comboUnitWeight || "120g"
        : product.weights?.[0]?.size ?? "",
    },

    aggregateRating:
      product.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewsCount,
          }
        : undefined,

    offers: {
      "@type": "Offer",

      url: `https://www.achaaryaar.com/products/${id}`,

      price: product.isCombo
        ? product.comboPrice
        : product.weights?.[0]?.price,

      priceCurrency: "INR",

      priceValidUntil: "2026-12-31",

      availability: product.isCombo
        ? product.comboStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
        : product.weights?.some((w: any) => w.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",

      itemCondition: "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: "AchaarYaar",
      },

      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
      },

      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.achaaryaar.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://www.achaaryaar.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://www.achaaryaar.com/products/${id}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",

    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            product.shortDescription || product.description,
        },
      },
      {
        "@type": "Question",
        name: "Is this pickle homemade?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. AchaarYaar pickles are prepared using traditional homemade recipes with carefully selected ingredients.",
        },
      },
      {
        "@type": "Question",
        name: "Do you deliver across India?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. AchaarYaar delivers authentic homemade pickles across India.",
        },
      },
      {
        "@type": "Question",
        name: "How should I store this pickle?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Store in a cool, dry place and always use a clean, dry spoon while serving.",
        },
      },
    ],
  };
  return (
  <>
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          productSchema,
          breadcrumbSchema,
          faqSchema,
        ]),
      }}
    />

    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  </>
);
}
