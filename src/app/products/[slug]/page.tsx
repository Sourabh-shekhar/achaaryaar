import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";

import ProductDetailsClient from "./ProductDetailsClient";
import { baseUrl } from "@/lib/baseUrl";

export const revalidate = 60;

const SITE_URL = "https://www.achaaryaar.com";

/* =========================================================
   HELPERS
========================================================= */

function absoluteUrl(url?: string | null) {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${SITE_URL}${trimmed}`;
  }

  return `${SITE_URL}/${trimmed}`;
}

function cleanText(value?: string | null) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(
  value: string,
  maxLength = 160
) {
  const cleaned = cleanText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.substring(0, maxLength - 1).trim()}…`;
}

/* =========================================================
   PRODUCT FETCH
========================================================= */

async function getProduct(slugOrId: string) {
  try {
    const res = await fetch(
      `${baseUrl}/api/products/${encodeURIComponent(slugOrId)}`,
      {
        next: {
          revalidate,
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data?.product || null;
  } catch (error) {
    console.error("GET PRODUCT PAGE ERROR:", error);
    return null;
  }
}

/* =========================================================
   ALL PRODUCTS
   Used for related products
========================================================= */

async function getAllProducts() {
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      next: {
        revalidate,
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return Array.isArray(data?.products)
      ? data.products
      : [];
  } catch (error) {
    console.error("GET ALL PRODUCTS ERROR:", error);
    return [];
  }
}

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | AchaarYaar",
      description:
        "The requested AchaarYaar product could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productName = cleanText(product.name);
  const productSlug = String(product.slug || slug);

  const productUrl =
    `${SITE_URL}/products/${encodeURIComponent(productSlug)}`;

  /* ---------------------------------------------------------
     SEO TITLE
  --------------------------------------------------------- */

  let title: string;

  if (product.isCombo) {
    const comboItems = Array.isArray(product.comboItems)
      ? product.comboItems
      : [];

    const comboNames = comboItems
      .map((item: any) => cleanText(item.name || ""))
      .filter(Boolean);

    if (comboNames.length > 0) {
      const shortComboNames = comboNames
        .slice(0, 3)
        .map((name: string) => {
          return name
            .replace(/\s*[-–—|].*$/g, "")
            .replace(/\s+/g, " ")
            .trim();
        });

      title = `4 Jar Pickle Combo – ${shortComboNames.join(
        ", "
      )} | AchaarYaar`;
    } else {
      title = `Pickle Combo – ${productName} | AchaarYaar`;
    }
  } else {
    title = `${productName} | AchaarYaar`;

    // Keep normal product titles reasonably short.
    if (title.length > 60) {
      title = `${productName
        .replace(/\s*[-–—|].*$/g, "")
        .trim()} | AchaarYaar`;
    }
  }

  /* ---------------------------------------------------------
     DESCRIPTION
  --------------------------------------------------------- */

  let description: string;

  if (product.isCombo) {
    const comboItems = Array.isArray(product.comboItems)
      ? product.comboItems
      : [];

    const comboNames = comboItems
      .map((item: any) => cleanText(item.name || ""))
      .filter(Boolean)
      .slice(0, 4)
      .map((name: string) =>
        name
          .replace(/\s*[-–—|].*$/g, "")
          .replace(/\s+/g, " ")
          .trim()
      );

    if (comboNames.length > 0) {
      description = truncateDescription(
        `Shop AchaarYaar's ${comboNames.join(
          ", "
        )} pickle combo. Authentic homemade Bihar flavours with traditional taste, perfect for everyday meals and delivered across India.`
      );
    } else {
      description = truncateDescription(
        product.shortDescription ||
          product.description ||
          `Buy ${productName} online from AchaarYaar.`
      );
    }
  } else {
    description = truncateDescription(
      product.shortDescription ||
        product.description ||
        `Buy ${productName} online from AchaarYaar.`
    );
  }

  /* ---------------------------------------------------------
     IMAGE
  --------------------------------------------------------- */

  const firstImage =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images[0]
      : product.image;

  const image = absoluteUrl(firstImage);

  /* ---------------------------------------------------------
     KEYWORDS
  --------------------------------------------------------- */

  const keywords = [
    productName,
    `${productName} pickle`,
    `${productName} achar`,
    `${productName} online`,
    `buy ${productName}`,
    "homemade pickle",
    "homemade achar",
    "Bihar pickle",
    "Bihari pickle",
    "traditional pickle",
    "Indian pickle",
    "buy pickle online",
    "pickle combo",
    "pickle gift pack",
    "AchaarYaar",
  ];

  /* ---------------------------------------------------------
     METADATA
  --------------------------------------------------------- */

  return {
    title,
    description,
    keywords,

    authors: [
      {
        name: "AchaarYaar",
      },
    ],

    creator: "AchaarYaar",
    publisher: "AchaarYaar",
    category: "Food",

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: "AchaarYaar",
      locale: "en_IN",
      type: "website",

      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: `${productName} - AchaarYaar`,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

/* =========================================================
   PRODUCT PAGE
========================================================= */

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  /* ---------------------------------------------------------
     PRODUCT NOT FOUND
  --------------------------------------------------------- */

  if (!product) {
    return notFound();
  }

  /* ---------------------------------------------------------
     SLUG REDIRECT

     Example:

     /products/6a7b116ea881e608c5085c2f

     redirects to:

     /products/achaar-yaar-special-kathal-ka-achaar
  --------------------------------------------------------- */

  if (
    product.slug &&
    slug !== product.slug
  ) {
    redirect(
      `/products/${product.slug}`
    );
  }

  const productSlug =
    String(product.slug || slug);

  const productUrl =
    `${SITE_URL}/products/${encodeURIComponent(productSlug)}`;

  const productName =
    cleanText(product.name);

  /* =========================================================
     PRODUCTS / RELATED PRODUCTS
  ========================================================= */

  const allProducts =
    await getAllProducts();

  const relatedProducts = allProducts
    .filter(
      (p: any) =>
        String(p?._id) !==
        String(product?._id)
    )
    .slice(0, 3);

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const productImages = Array.isArray(
    product.images
  )
    ? product.images
        .map((img: string) =>
          absoluteUrl(img)
        )
        .filter(Boolean)
    : [];

  const fallbackImage =
    absoluteUrl(product.image);

  const images =
    productImages.length > 0
      ? productImages
      : fallbackImage
        ? [fallbackImage]
        : [];

  /* =========================================================
     DETECT COMBO
  ========================================================= */

  const isCombo =
    product.isCombo === true ||
    (
      Array.isArray(product.comboVariants) &&
      product.comboVariants.length > 0
    ) ||
    (
      Array.isArray(product.comboItems) &&
      product.comboItems.length > 0
    ) ||
    (
      Number(product.comboPrice) > 0
    );

  /* =========================================================
     STOCK
  ========================================================= */

  let isInStock = false;

  if (isCombo) {
    /* -------------------------------------------------------
       NEW COMBO VARIANTS
    ------------------------------------------------------- */

    if (
      Array.isArray(product.comboVariants) &&
      product.comboVariants.length > 0
    ) {
      isInStock =
        product.comboVariants.some(
          (variant: any) =>
            Number(variant?.stock || 0) > 0
        );
    } else {
      /* -----------------------------------------------------
         LEGACY COMBO STOCK
      ----------------------------------------------------- */

      isInStock =
        Number(product.comboStock || 0) > 0;
    }
  } else {
    /* -------------------------------------------------------
       NORMAL PRODUCT STOCK
    ------------------------------------------------------- */

    isInStock =
      Array.isArray(product.weights) &&
      product.weights.some(
        (weight: any) =>
          Number(weight?.stock || 0) > 0
      );
  }

  /* =========================================================
     PRICE INFORMATION
  ========================================================= */

  let lowestPrice: number | null = null;
  let highestPrice: number | null = null;

  if (
    isCombo &&
    Array.isArray(product.comboVariants) &&
    product.comboVariants.length > 0
  ) {
    const prices = product.comboVariants
      .map((variant: any) =>
        Number(variant?.price)
      )
      .filter(
        (price: number) =>
          Number.isFinite(price) &&
          price > 0
      );

    if (prices.length > 0) {
      lowestPrice = Math.min(...prices);
      highestPrice = Math.max(...prices);
    }
  } else if (isCombo) {
    const price = Number(
      product.comboPrice
    );

    if (
      Number.isFinite(price) &&
      price > 0
    ) {
      lowestPrice = price;
      highestPrice = price;
    }
  } else {
    const prices = Array.isArray(product.weights)
      ? product.weights
          .map((weight: any) =>
            Number(weight?.price)
          )
          .filter(
            (price: number) =>
              Number.isFinite(price) &&
              price > 0
          )
      : [];

    if (prices.length > 0) {
      lowestPrice = Math.min(...prices);
      highestPrice = Math.max(...prices);
    }
  }

  /* =========================================================
     DESCRIPTION FOR STRUCTURED DATA
  ========================================================= */

  const schemaDescription = cleanText(
    product.shortDescription ||
      product.description ||
      `Buy ${productName} online from AchaarYaar.`
  );

  /* =========================================================
     PRICE VALID UNTIL

     Use the end of the current year.
  ========================================================= */

  const priceValidUntil =
    `${new Date().getFullYear()}-12-31`;

  /* =========================================================
     PRODUCT OFFERS
  ========================================================= */

  let offers: Record<string, any>;

  /* ---------------------------------------------------------
     COMBO WITH MULTIPLE VARIANTS
  --------------------------------------------------------- */

  if (
    isCombo &&
    Array.isArray(product.comboVariants) &&
    product.comboVariants.length > 0
  ) {
    const validVariants =
      product.comboVariants.filter(
        (variant: any) =>
          Number.isFinite(
            Number(variant?.price)
          ) &&
          Number(variant?.price) > 0
      );

    if (validVariants.length === 1) {
      const variant =
        validVariants[0];

      offers = {
        "@type": "Offer",

        url: productUrl,

        price: Number(
          variant.price
        ),

        priceCurrency: "INR",

        priceValidUntil,

        availability:
          Number(variant.stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        itemCondition:
          "https://schema.org/NewCondition",

        seller: {
          "@type": "Organization",
          name: "AchaarYaar",
          url: SITE_URL,
        },
      };
    } else {
      offers = {
        "@type": "AggregateOffer",

        url: productUrl,

        priceCurrency: "INR",

        lowPrice: lowestPrice,

        highPrice: highestPrice,

        offerCount: validVariants.length,

        priceValidUntil,

        availability: isInStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

        seller: {
          "@type": "Organization",
          name: "AchaarYaar",
          url: SITE_URL,
        },
      };
    }
  }

  /* ---------------------------------------------------------
     LEGACY / SINGLE COMBO
  --------------------------------------------------------- */

  else if (isCombo) {
    offers = {
      "@type": "Offer",

      url: productUrl,

      price: lowestPrice || 0,

      priceCurrency: "INR",

      priceValidUntil,

      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: "AchaarYaar",
        url: SITE_URL,
      },
    };
  }

  /* ---------------------------------------------------------
     NORMAL PRODUCT WITH MULTIPLE WEIGHTS
  --------------------------------------------------------- */

  else {
    const validWeights =
      Array.isArray(product.weights)
        ? product.weights.filter(
            (weight: any) =>
              Number.isFinite(
                Number(weight?.price)
              ) &&
              Number(weight?.price) > 0
          )
        : [];

    if (validWeights.length === 1) {
      const weight =
        validWeights[0];

      offers = {
        "@type": "Offer",

        url: productUrl,

        price: Number(
          weight.price
        ),

        priceCurrency: "INR",

        priceValidUntil,

        availability:
          Number(weight.stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        itemCondition:
          "https://schema.org/NewCondition",

        seller: {
          "@type": "Organization",
          name: "AchaarYaar",
          url: SITE_URL,
        },
      };
    } else {
      offers = {
        "@type": "AggregateOffer",

        url: productUrl,

        priceCurrency: "INR",

        lowPrice: lowestPrice,

        highPrice: highestPrice,

        offerCount: validWeights.length,

        priceValidUntil,

        availability: isInStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

        seller: {
          "@type": "Organization",
          name: "AchaarYaar",
          url: SITE_URL,
        },
      };
    }
  }

  /* =========================================================
     PRODUCT SCHEMA
  ========================================================= */

  const productSchema: Record<
    string,
    any
  > = {
    "@context": "https://schema.org",

    "@type": "Product",

    "@id": `${productUrl}#product`,

    name: productName,

    description: schemaDescription,

    image: images,

    sku: String(product._id),

    url: productUrl,

    brand: {
      "@type": "Brand",
      name: "AchaarYaar",
    },

    manufacturer: {
      "@type": "Organization",
      name: "AchaarYaar",
      url: SITE_URL,
    },

    category:
      product.category || "Pickle",

    countryOfOrigin: {
      "@type": "Country",
      name: "India",
    },

    offers,

    ...(product.reviewsCount > 0 &&
    Number(product.rating) > 0
      ? {
          aggregateRating: {
            "@type":
              "AggregateRating",

            ratingValue:
              Number(product.rating),

            reviewCount:
              Number(product.reviewsCount),

            bestRating: 5,

            worstRating: 1,
          },
        }
      : {}),
  };

  /* =========================================================
     BREADCRUMB SCHEMA
  ========================================================= */

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    "@id": `${productUrl}#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "Home",

        item: SITE_URL,
      },

      {
        "@type": "ListItem",

        position: 2,

        name: "Products",

        item: `${SITE_URL}/products`,
      },

      {
        "@type": "ListItem",

        position: 3,

        name: productName,

        item: productUrl,
      },
    ],
  };

  /* =========================================================
     FAQ SCHEMA

     Keep FAQ answers aligned with actual site/product
     information.
  ========================================================= */

  const faqSchema = {
    "@context": "https://schema.org",

    "@type": "FAQPage",

    mainEntity: [
      {
        "@type": "Question",

        name: `What is ${productName}?`,

        acceptedAnswer: {
          "@type": "Answer",

          text: schemaDescription,
        },
      },

      {
        "@type": "Question",

        name: "Is this pickle homemade?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "Yes. AchaarYaar offers authentic homemade Bihar pickles prepared using traditional recipes and carefully selected ingredients.",
        },
      },

      {
        "@type": "Question",

        name: "Do you deliver across India?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "Yes. AchaarYaar delivers homemade pickles across India.",
        },
      },

      {
        "@type": "Question",

        name: "How should I store this pickle?",

        acceptedAnswer: {
          "@type": "Answer",

          text:
            "Store the pickle in a cool, dry place and use a clean, dry spoon when serving.",
        },
      },
    ],
  };

  /* =========================================================
     WEBPAGE SCHEMA
  ========================================================= */

  const webpageSchema = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${productUrl}#webpage`,

    url: productUrl,

    name: productName,

    description: schemaDescription,

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${productUrl}#product`,
    },

    breadcrumb: {
      "@id": `${productUrl}#breadcrumb`,
    },

    inLanguage: "en-IN",
  };

  /* =========================================================
     RETURN PAGE
  ========================================================= */

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productSchema,
            breadcrumbSchema,
            faqSchema,
            webpageSchema,
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