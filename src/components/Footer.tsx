import Link from "next/link";
import {
  FaCcMastercard,
  FaCcVisa,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { SiGooglepay, SiPaytm } from "react-icons/si";

const shopLinks = [
  { label: "Mango Pickles", href: "/products?category=mango" },
  { label: "Lemon Pickles", href: "/products?category=lemon" },
  { label: "Garlic Pickles", href: "/products?category=garlic" },
  { label: "Spicy Pickles", href: "/products?category=spicy" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
];

const supportLinks = [
  { label: "Track Order", href: "/track" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#E8DDD1] bg-[#2E3F30] px-6 pt-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 pb-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <img
            src="/image/logo.png"
            alt="AchaarYaar"
            className="mb-5 h-16 w-auto rounded-lg bg-white p-2"
          />
          <p className="max-w-sm text-sm leading-7 text-white/70">
            Authentic homemade Bihar pickles crafted in small batches with
            balanced spices, careful packing, and the comfort of traditional
            recipes.
          </p>

          <div className="mt-6 space-y-3 text-sm text-white/70">
            <a
              href="tel:+917561972501"
              className="flex items-center gap-3 transition hover:text-[#D9A85F]"
            >
              <FiPhone className="text-[#D9A85F]" /> +91 75619 72501
            </a>
            <a
              href="mailto:support@achaaryaar.com"
              className="flex items-center gap-3 transition hover:text-[#D9A85F]"
            >
              <FiMail className="text-[#D9A85F]" /> support@achaaryaar.com
            </a>
            <p className="flex items-center gap-3">
              <FiMapPin className="text-[#D9A85F]" /> Bihar, India
            </p>
          </div>

          <div className="mt-6 flex gap-4 text-2xl text-white/80">
            <a
              href="https://www.instagram.com/achaaryaar?igsh=MXIyandtYjM1M3RpZQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition hover:-translate-y-0.5 hover:text-[#D9A85F]"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/share/1JYUx8xQc4/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition hover:-translate-y-0.5 hover:text-[#D9A85F]"
            >
              <FaFacebook />
            </a>
            <a
              href="https://wa.me/917561972501"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="transition hover:-translate-y-0.5 hover:text-[#D9A85F]"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="transition hover:-translate-y-0.5 hover:text-[#D9A85F]"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {[
          { title: "Shop", links: shopLinks },
          { title: "Company", links: companyLinks },
          { title: "Support", links: supportLinks },
        ].map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.2em] text-[#D9A85F]">
              {column.title}
            </h2>
            <div className="flex flex-col gap-3 text-sm text-white/70">
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-[#D9A85F]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/55 md:flex-row">
        <p>Copyright {new Date().getFullYear()} AchaarYaar. All rights reserved.</p>
        <div className="flex items-center gap-4 text-3xl text-white/70">
          <FaCcVisa />
          <FaCcMastercard />
          <SiGooglepay />
          <SiPaytm />
        </div>
      </div>
    </footer>
  );
}
