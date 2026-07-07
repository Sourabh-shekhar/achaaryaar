export const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://www.achaaryaar.com"
    : "http://localhost:3000";