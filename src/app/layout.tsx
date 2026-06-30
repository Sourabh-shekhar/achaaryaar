import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import AuthProvider from "@/components/SessionProvider";
import { Playfair_Display } from "next/font/google";


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
  title: "Achaaryaar | Authentic Homemade Bihar Pickles",
  description:
    "Buy authentic homemade Bihar pickles online. Traditional recipes, premium ingredients, and homemade taste delivered across India.",
  keywords: [
    "Bihar Pickle",
    "Homemade Pickle",
    "Mango Pickle",
    "Achar Online",
    "Achaaryaar",
    "Indian Pickles",
    "Garlic Pickle",
    "Homemade Achar",
  ],

  authors: [{ name: "Achaaryaar" }],

  openGraph: {
    title: "Achaaryaar | Authentic Homemade Bihar Pickles",
    description:
      "Experience the authentic taste of homemade Bihar pickles.",
    url: "https://www.achaaryaar.com",
    siteName: "Achaaryaar",
    locale: "en_IN",
    type: "website",
  },


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

        <AuthProvider>

          <Navbar />

          <main className="flex-grow">
            {children}
          </main>

        </AuthProvider>

      </body>
    </html>
  );
}