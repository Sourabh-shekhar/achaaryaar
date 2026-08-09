import type { Metadata,Viewport} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/SessionProvider";
import { Playfair_Display } from "next/font/google";
import InfoTicker from "@/components/InfoTicker";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import SplashScreen from "@/components/SplashScreen";
import ChatWidget from "@/components/ChatWidget";
import Script from "next/script";
import AutoBreadcrumbSchema from "@/components/AutoBreadcrumbSchema";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://www.achaaryaar.com"),
   verification: {
    google: "Fw-cO-qK9kDEQVQp4yAgN9XbCW84gCTVZZrawpAWzRE",
  },
  title: {
    default: "Homemade Bihar Pickles Online | AchaarYaar",
    template: "%s | AchaarYaar",
  },
  description:
    "Buy authentic homemade Bihar pickles online, handcrafted using traditional family recipes and premium ingredients. Shop mango, lemon, garlic, chilli, and more with Pan India delivery.",
  keywords: [
    "homemade pickle",
    "homemade achar",
    "bihar pickle",
    "traditional pickle",
    "mango pickle",
    "garlic pickle",
    "lemon pickle",
    "green chilli pickle",
    "buy pickle online",
    "indian pickle",
    "authentic achar",
    "mustard oil pickle",
    "AchaarYaar",
    "Sanjeev Bus Pickles",
    "Arkvon Group Pickles",
  ],

  authors: [{ name: "AchaarYaar" }],

  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Homemade Bihar Pickles Online | AchaarYaar",
    description:
      "Authentic homemade Bihar pickles delivered across India.",
    images: ["/og-image.jpg"],
  },
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
  icons: {
    icon: "https://www.achaaryaar.com/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  applicationName: "AchaarYaar",
  creator: "AchaarYaar",
  publisher: "AchaarYaar",
  category: "Food",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AchaarYaar",
  },
  generator: "Next.js",

openGraph: {
  title: "Homemade Bihar Pickles Online | Authentic Traditional Achar | AchaarYaar",
  description:
    "Buy authentic homemade Bihar pickles online. Traditional recipes crafted with premium ingredients and rich homemade flavors. Order mango, lemon, chilli, garlic and more, delivered across India.",
  url: "https://www.achaaryaar.com",
  siteName: "AchaarYaar",
  locale: "en_IN",
  type: "website",
  images: [
    {
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "AchaarYaar Homemade Bihar Pickles",
    },
  ],
},
};
export const viewport: Viewport = {
  themeColor: "#4F6B52",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.className} ${geistMono.className} ${playfair.className}`}
    >
      <body className="min-h-screen flex flex-col">
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.achaaryaar.com/#organization",
                  name: "AchaarYaar",
                  url: "https://www.achaaryaar.com",
                  logo: "https://www.achaaryaar.com/icon.png",
                  description:
                    "Authentic homemade Bihar pickles handcrafted using traditional family recipes and premium ingredients.",
                  email: "support@achaaryaar.com",
                  brand: {
                    "@type": "Brand",
                    name: "AchaarYaar",
                  },
                  sameAs: [
                    "https://www.instagram.com/achaaryaar",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.achaaryaar.com/#website",
                  url: "https://www.achaaryaar.com",
                  name: "AchaarYaar",
                  publisher: {
                    "@id": "https://www.achaaryaar.com/#organization",
                  },
                  inLanguage: "en-IN",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://www.achaaryaar.com/products?search={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "FoodEstablishment",
                  logo: "https://www.achaaryaar.com/icon.png",
                  image: "https://www.achaaryaar.com/og-image.jpg",
                  "name": "AchaarYaar",
                  "url": "https://www.achaaryaar.com",
                  "telephone": "+91-7561972501",
                  "email": "support@achaaryaar.com",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Siwan",
                    "addressRegion": "Bihar",
                    "addressCountry": "IN",
                    "postalCode": "841226",
                  },
                    servesCuisine: "Indian",

                    priceRange: "₹₹",

                    areaServed: "India",

                    currenciesAccepted: "INR",

                    paymentAccepted: [
                      "UPI",
                      "Credit Card",
                      "Debit Card",
                      "Net Banking"
                    ],

                  },
                  
                {
                  "@type": "WebPage",
                  "@id": "https://www.achaaryaar.com/#webpage",
                  "url": "https://www.achaaryaar.com",
                  "name": "AchaarYaar Home",
                  "isPartOf": {
                    "@id": "https://www.achaaryaar.com/#website"
                  }
                }

              ],
            }),
          }}
        />
        <AutoBreadcrumbSchema />
        <AuthProvider>

          <Navbar />
          <InfoTicker />
          <SplashScreen />

          <main className="grow">
            {children}
          </main>

          <Footer />
          <ChatWidget />
        </AuthProvider>

      </body>
      <GoogleAnalytics gaId="G-N1SJXDN38B" />
    </html>
  );
}