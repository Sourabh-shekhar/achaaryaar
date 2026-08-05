"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const SITE_URL = "https://www.achaaryaar.com";

export default function AutoBreadcrumbSchema() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      decodeURIComponent(segment)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    ...segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: segment,
      item: `${SITE_URL}/${pathname
        .split("/")
        .filter(Boolean)
        .slice(0, index + 1)
        .join("/")}`,
    })),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}