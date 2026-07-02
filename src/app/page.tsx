"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiInstagram, SiFacebook, SiYoutube } from "react-icons/si";
import { FiTruck, FiFeather, FiHome, FiRefreshCw, FiPhone, FiMail, FiMapPin, FiCheck, FiCopy, FiShield, FiLock, FiAward } from "react-icons/fi";
import WhatsAppButton from "@/components/WhatsAppButton";
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  forest: "#4F6B52",
  forestMid: "#5E7A60",
  forestLight: "#7A9678",
  gold: "#C18A42",
  goldLight: "#D9A85F",
  cream: "#FBF7F1",
  creamDark: "#F3EDE3",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#5C5249", // darkened for better readability against cream backgrounds
  white: "#FFFFFF",
  red: "#6B1F1F",
};

// Consistent scale so every card / button / panel pulls from the same values
const RADIUS = { sm: 10, md: 12, lg: 16, xl: 18, xxl: 22, round: 24 };
const SHADOW = {
  sm: "0 4px 12px rgba(28,40,30,0.10)",
  md: "0 16px 32px rgba(28,61,46,0.12)",
  lg: "0 24px 48px rgba(28,61,46,0.16)",
  glow: "0 8px 20px rgba(79,107,82,0.35)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "system-ui, -apple-system, sans-serif";

// Social + contact links — update these with your real handles/details
const SOCIAL_LINKS = {
  instagram: "https://instagram.com/achaaryaar",
  facebook: "https://www.facebook.com/share/1JYUx8xQc4/",
  youtube: "https://youtube.com/",
};

const CONTACT = {
  phone: "+91 75619 72501",
  email: "support@achaaryaar.com",
  location: "Siwan, Bihar, Patna",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── SHARED: visually-hidden helper (for accessible labels) ─────────────────
const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

// ─── SHARED: scroll-reveal wrapper (lightweight, no dependency) ─────────────
function Reveal({ children, as: Tag = "div" }: { children: React.ReactNode; as?: any }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Respect users who've asked for reduced motion — show immediately, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal${visible ? " is-visible" : ""}`}>
      {children}
    </Tag>
  );
}

// ─── WELCOME POPUP ────────────────────────────────────────────────────────────
function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("achaaryaar_welcome_seen");
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    sessionStorage.setItem("achaaryaar_welcome_seen", "true");
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      previouslyFocused.current?.focus();
    }, 200);
  }, []);

  // Focus management + Escape-to-close + scroll lock while the dialog is open
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      onClick={close}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,28,22,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1.5rem",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: COLORS.cream,
          borderRadius: RADIUS.xxl,
          maxWidth: 440,
          width: "100%",
          padding: "2.75rem 2.25rem 2.25rem",
          position: "relative",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.45)",
          textAlign: "center",
          transform: closing ? "scale(0.96) translateY(8px)" : "scale(1) translateY(0)",
          transition: "transform 0.22s ease",
          border: `1px solid ${COLORS.sand}`,
        }}
      >
        <button
          ref={closeBtnRef}
          onClick={close}
          aria-label="Close welcome dialog"
          className="icon-btn"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            fontSize: "1.1rem",
            color: "rgba(45,42,38,0.6)",
            cursor: "pointer",
            lineHeight: 1,
            padding: 8,
            borderRadius: RADIUS.sm,
          }}
        >
          ✕
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: COLORS.forest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            margin: "0 auto 1.1rem",
            boxShadow: SHADOW.glow,
          }}
          aria-hidden="true"
        >
          🥭
        </div>

        <div
          style={{
            fontSize: "0.68rem",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: COLORS.gold,
            fontWeight: 700,
            marginBottom: "0.6rem",
          }}
        >
          Namaste
        </div>

        <h3
          id={titleId}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "1.7rem",
            color: COLORS.ink,
            fontWeight: 900,
            marginBottom: "0.65rem",
            lineHeight: 1.2,
          }}
        >
          Welcome to AchaarYaar
        </h3>

        <p
          style={{
            color: COLORS.muted,
            fontSize: "0.92rem",
            lineHeight: 1.65,
            marginBottom: "1.5rem",
          }}
        >
          Recipes passed down through three generations, hand-mixed in small batches
          and matured the traditional way — pure ingredients, no shortcuts, no
          preservatives.
        </p>

        <div
          style={{
            background: "rgba(193,138,66,0.1)",
            border: `1px dashed ${COLORS.gold}`,
            borderRadius: RADIUS.md,
            padding: "0.9rem 1rem",
            marginBottom: "1.6rem",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Use code </span>
          <span style={{ fontWeight: 900, color: COLORS.forest, letterSpacing: "1px" }}>
            WELCOME10
          </span>
          <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>
            {" "}
            for 10% Off On First Order
          </span>
        </div>

        <Link href="/products" onClick={close} className="btn-primary">
          Explore Our Jars
        </Link>
      </div>
    </div>
  );
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { icon: <FiTruck size={15} />, text: "Free delivery above ₹499" },
    { icon: <FiFeather size={15} />, text: "No artificial preservatives" },
    { icon: <FiHome size={15} />, text: "Homemade recipes" },
    { icon: <FiRefreshCw size={15} />, text: "Eco-friendly packaging" },
  ];
  return (
    <div className="trust-strip" style={{
      background: COLORS.forestMid,
      padding: "0.75rem 2rem",
      display: "flex",
      justifyContent: "center",
      gap: "2.5rem",
      flexWrap: "wrap",
      borderBottom: `1px solid rgba(255,255,255,0.12)`,
    }}>
      {items.map(item => (
        <div key={item.text} className="trust-item" style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          color: "rgba(255,255,255,0.92)",
          fontSize: "0.8rem", fontWeight: 500,
        }}>
          <span style={{ color: COLORS.gold, display: "flex" }} aria-hidden="true">{item.icon}</span>{item.text}
        </div>
      ))}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero-section" style={{
      background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
      padding: "clamp(2.75rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: "-5%", top: "-20%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,146,58,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} aria-hidden="true" />

      <div style={{
        maxWidth: 1320, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(2rem, 5vw, 4rem)",
        alignItems: "center",
      }} className="hero-grid">
        {/* Left */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(201,146,58,0.18)",
            border: "1px solid rgba(201,146,58,0.4)",
            color: COLORS.gold,
            padding: "0.35rem 1rem",
            borderRadius: 100,
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}>
            🥒 Authentic Bihar Pickles
          </div>

          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(2.1rem, 6vw, 3.8rem)",
            lineHeight: 1.1,
            color: COLORS.white,
            fontWeight: 900,
            marginBottom: "1.25rem",
          }}>
            Grandma&apos;s Recipes,{" "}
            <em style={{ color: COLORS.gold, fontStyle: "normal" }}>
              Delivered Fresh
            </em>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.82)",
            fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
            lineHeight: 1.75,
            maxWidth: 440,
            marginBottom: "2.25rem",
          }}>
            Handcrafted with premium ingredients and age-old techniques passed through generations. No preservatives. Pure tradition.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <Link href="/products" className="btn-primary">
              Shop Pickles →
            </Link>
            <Link href="/about" className="btn-ghost-light">
              Our Story
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex" }} aria-hidden="true">
              {["RK", "SP", "AM", "99+"].map((a, i) => (
                <div key={a} style={{
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: `hsl(${100 + i * 30}, 40%, 35%)`,
                  border: `2px solid ${COLORS.forest}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 700, color: "#fff",
                  marginLeft: i === 0 ? 0 : -10,
                }}>{a}</div>
              ))}
            </div>
            <div>
              <div style={{ color: COLORS.white, fontWeight: 700, fontSize: "0.85rem" }}>2,000+ Happy Customers</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}>Across India ⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Right – real product photo */}
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{
            borderRadius: RADIUS.round,
            overflow: "hidden",
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <Image
              src="/image/jars-yellow.png"
              alt="Achaar Yaar pickle jars — mango, lemon, garlic, green chilli, red chilli and mixed pickle"
              width={1024}
              height={1024}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </div>

          {/* Badge */}
          <div className="hero-badge" style={{
            position: "absolute", top: -12, right: -12,
            background: COLORS.gold,
            color: COLORS.forest,
            borderRadius: "50%",
            width: 72, height: 72,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "0.7rem",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(201,146,58,0.5)",
          }}>
            <div style={{ fontSize: "1.3rem", lineHeight: 1 }}>18+</div>
            Months shelf life
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── OFFER BANNER ─────────────────────────────────────────────────────────────
// Contained card-style banner (matches the Hero's rounded-card treatment)
// instead of a full-bleed, edge-to-edge section.
function OfferBanner() {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("WELCOME10");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browser / insecure context) — fall back silently,
      // the code is already visible on-screen for the person to type manually.
    }
  }, []);

  return (
    <section
      className="section-pad"
      style={{
        background: COLORS.cream,
        padding: "clamp(2rem, 5vw, 3rem) clamp(1.25rem, 5vw, 2rem) 0",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          className="offer-card"
          style={{
            background: `linear-gradient(130deg, ${COLORS.forest} 0%, #3D5640 100%)`,
            borderRadius: RADIUS.xxl,
            overflow: "hidden",
            position: "relative",
            boxShadow: SHADOW.lg,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* subtle brine-jar texture */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "18px 18px",
            pointerEvents: "none",
          }} aria-hidden="true" />

          <div className="offer-banner-inner" style={{
            padding: "clamp(1.75rem, 4vw, 2.75rem) clamp(1.5rem, 4vw, 2.75rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
            position: "relative",
            zIndex: 1,
          }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 500, flex: "1 1 320px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%)`,
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 999,
                padding: "0.4rem 1rem",
                fontSize: "0.7rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: COLORS.forest,
                fontWeight: 800,
                marginBottom: "1rem",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              }}>
                🎁 New Customers · First Batch On Us
              </div>

              <h2 className="offer-heading" style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.3rem, 3.6vw, 2rem)", lineHeight: 1.15, color: COLORS.white, marginBottom: "0.5rem", fontWeight: 900 }}>
                10% Off On First Order
              </h2>
              <p className="offer-sub" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.87rem", marginBottom: "1.4rem", lineHeight: 1.5 }}>
                Small-batch, slow-fermented, shipped fresh from the brine. New customers save automatically with the code below.
              </p>

              {/* ticket-stub coupon */}
              <div className="coupon-stub" style={{
                display: "flex",
                alignItems: "stretch",
                marginBottom: "1.4rem",
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
              }}>
                <div style={{
                  background: COLORS.cream,
                  borderRadius: "10px 0 0 10px",
                  padding: "0.8rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(28,40,30,0.6)", fontWeight: 700 }}>Code</span>
                  <span className="coupon-code" style={{ fontSize: "1.1rem", fontWeight: 900, color: COLORS.forest, letterSpacing: "2px" }}>WELCOME10</span>
                </div>
                <div style={{
                  position: "relative",
                  width: 0,
                  borderTop: "23px solid transparent",
                  borderBottom: "23px solid transparent",
                  borderLeft: `14px solid ${COLORS.gold}`,
                }} aria-hidden="true" />
                <button
                  type="button"
                  onClick={copyCode}
                  className="coupon-copy-btn"
                  aria-label="Copy discount code WELCOME10"
                  style={{
                    background: copied ? COLORS.forestLight : COLORS.gold,
                    borderRadius: "0 10px 10px 0",
                    padding: "0.8rem 1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: COLORS.forest,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <Link href="/products" className="btn-outline-gold">Shop the batch →</Link>
            </div>

            {/* real product photo on the right */}
            <div className="offer-photo" style={{
              position: "relative", zIndex: 1,
              flex: "0 1 240px",
              width: "100%",
              maxWidth: 240,
              aspectRatio: "1 / 1",
              borderRadius: RADIUS.lg,
              overflow: "hidden",
              boxShadow: "0 16px 32px -12px rgba(0,0,0,0.45)",
              margin: "0 auto",
            }}>
              <Image
                src="/image/discount.png"
                alt="AchaarYaar jars — your first order, 10% off"
                fill
                sizes="(max-width: 768px) 60vw, 240px"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .offer-banner-inner { text-align: left; }
        @media (max-width: 768px) {
          .offer-banner-inner { justify-content: center !important; text-align: center !important; }
          .offer-photo { max-width: 200px !important; }
        }
        @media (max-width: 480px) {
          .offer-heading { font-size: 1.35rem !important; }
          .offer-sub { font-size: 0.8rem !important; }
          .coupon-code { font-size: 1rem !important; letterSpacing: 1px !important; }
          .offer-photo { max-width: 170px !important; }
        }
        @media (max-width: 380px) {
          .coupon-stub { flex-direction: column !important; filter: none !important; }
          .coupon-stub > div:first-child { border-radius: 10px 10px 0 0 !important; align-items: center !important; text-align: center !important; }
          .coupon-stub > div:nth-child(2) { display: none !important; }
          .coupon-copy-btn { border-radius: 0 0 10px 10px !important; justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}

// ─── CATEGORY GRID ────────────────────────────────────────────────────────────
function CategoryGrid() {
  const cats = [
    {
      slug: "mango",
      photo: "/image/mango-category.jpg",
      posX: "50%",
      posY: "50%",
      badge: "Best Seller",
      name: "Mango Pickles",
      desc: "Traditional mango pickles with authentic Bihar taste.",
      accent: "#FFF4E0",
    },
    { slug: "spicy", photo: "/image/spicy-category.jpg", posX: "50%", posY: "45%", badge: "Hot & Spicy", name: "Spicy Pickles", desc: "Fiery flavours using premium chillies and spices.", accent: "#FFF0EE" },
    { slug: "garlic", photo: "/image/garlic-category.jpg", posX: "50%", posY: "45%", badge: "Premium", name: "Garlic Special", desc: "Rich garlic flavour with traditional recipes.", accent: "#F2EEF9" },
    { slug: "lemon", photo: "/image/lemon-category.jpg", posX: "50%", posY: "45%", badge: "Tangy", name: "Lemon Pickles", desc: "Refreshing lemon pickles bursting with bright flavour.", accent: "#FDFCE8" },
  ];
  return (
    <section className="section-pad" style={{ background: COLORS.cream, padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader eyebrow="Browse Our Range" title="Shop by Category" sub="Explore flavours your family will love." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}>
          {cats.map(c => (
            <Reveal key={c.name}>
              <Link href={`/products?category=${c.slug}`} className="card-link" style={{
                background: COLORS.white,
                borderRadius: RADIUS.xl,
                border: `1px solid ${COLORS.sand}`,
                overflow: "hidden",
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}>
                <div style={{
                  background: c.accent,
                  aspectRatio: "4 / 3",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <Image
                    src={c.photo}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    style={{ objectFit: "cover", objectPosition: `${c.posX} ${c.posY}` }}
                    loading="lazy"
                  />
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <span style={{
                    background: COLORS.creamDark,
                    color: COLORS.forest,
                    fontSize: "0.7rem", fontWeight: 700,
                    letterSpacing: "1px", textTransform: "uppercase",
                    padding: "0.25rem 0.7rem", borderRadius: 100,
                  }}>{c.badge}</span>
                  <div style={{ color: "#E69A1A", fontSize: "0.78rem", margin: "0.5rem 0 0.3rem" }} aria-hidden="true">★★★★★</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "1.05rem", marginBottom: "0.35rem" }}>{c.name}</div>
                  <div style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED PRODUCTS ────────────────────────────────────────────────────────
function FeaturedProducts() {
  const products = [
    { id: 1, photo: "/image/mango-product.png", bg: "#FFF8E7", name: "Aam ka Achaar", desc: "Classic mango pickle with mustard oil and authentic spices.", price: "₹249", weight: "500g", tag: "Bestseller" },
    { id: 2, photo: "/image/mirchi-product.png", bg: "#FFF1EE", name: "Mirchi Achaar", desc: "Fiery green chilli pickle for bold, spicy flavour lovers.", price: "₹219", weight: "400g", tag: "Hot Pick" },
    { id: 3, photo: "/image/lemon-product.png", bg: "#FDFCE8", name: "Nimbu ka Achaar", desc: "Tangy lemon pickle — perfect with dal and rice.", price: "₹199", weight: "400g", tag: "New" },
  ];
  return (
    <section className="section-pad" style={{ background: COLORS.creamDark, padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader eyebrow="Featured Products" title="Bestsellers"
          sub="Traditional homemade pickles crafted with love." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}>
          {products.map(p => (
            <Reveal key={p.id}>
              <Link href="/products" className="card-link" style={{
                background: COLORS.white,
                borderRadius: RADIUS.xl,
                border: `1px solid ${COLORS.sand}`,
                overflow: "hidden",
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}>
                <div style={{
                  background: p.bg,
                  aspectRatio: "4 / 3",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <Image
                    src={p.photo}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    background: COLORS.forest,
                    color: COLORS.gold,
                    fontSize: "0.7rem", fontWeight: 700,
                    padding: "0.3rem 0.75rem", borderRadius: 100,
                    letterSpacing: "0.5px",
                    zIndex: 2,
                  }}>{p.tag}</span>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "1.1rem", marginBottom: "0.35rem" }}>{p.name}</div>
                  <div style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.55, marginBottom: "1rem" }}>{p.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: COLORS.forest, fontSize: "1.3rem" }}>{p.price}</span>
                      <span style={{ color: COLORS.muted, fontSize: "0.78rem", marginLeft: 4 }}>/ {p.weight}</span>
                    </div>
                    <span
                      style={{
                        background: COLORS.forest,
                        color: COLORS.white,
                        border: "none",
                        padding: "0.55rem 1.2rem",
                        borderRadius: RADIUS.sm,
                        fontWeight: 700,
                        fontSize: "0.82rem",
                      }}
                    >
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ASSURANCE / TRUST BADGES ─────────────────────────────────────────────────
// Replaces the previous full-width poster banner with a compact, professional
// row of quality & service guarantees — preservative-free, secure payments, etc.
function AssuranceSection() {
  const badges = [
    { icon: <FiFeather size={20} />, title: "Preservative Free", desc: "Naturally cured the traditional way — nothing artificial, ever." },
    { icon: <FiLock size={20} />, title: "Secure Payments", desc: "Every transaction is encrypted and processed through trusted gateways." },
    { icon: <FiAward size={20} />, title: "Quality Assured", desc: "Small batches, checked by hand before they ever leave our kitchen." },
    { icon: <FiShield size={20} />, title: "Safe, Sealed Delivery", desc: "Tamper-proof jars, packed to survive the journey to your door." },
  ];
  return (
    <section className="section-pad" style={{ background: COLORS.cream, padding: "clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 5vw, 2rem) clamp(3rem, 7vw, 5rem)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader eyebrow="Why Choose Us" title="Our Promise to You" sub="The same standards, every single jar." />
        <div className="assurance-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.25rem",
        }}>
          {badges.map(b => (
            <Reveal key={b.title}>
              <div className="assurance-card" style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.sand}`,
                borderTop: `3px solid ${COLORS.gold}`,
                borderRadius: RADIUS.lg,
                padding: "1.75rem 1.5rem",
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}>
                <div style={{
                  width: 50, height: 50,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
                  color: COLORS.gold,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.1rem",
                  boxShadow: "0 6px 16px rgba(79,107,82,0.3)",
                }} aria-hidden="true">
                  {b.icon}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "1rem", marginBottom: "0.4rem" }}>
                  {b.title}
                </div>
                <div style={{ color: COLORS.muted, fontSize: "0.83rem", lineHeight: 1.6 }}>
                  {b.desc}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .assurance-card:hover {
          transform: translateY(-6px);
          box-shadow: ${SHADOW.md};
          border-color: ${COLORS.gold};
        }
        @media (max-width: 900px) {
          .assurance-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .assurance-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── PROCESS ──────────────────────────────────────────────────────────────────
function ProcessSection() {
  const steps = [
    { emoji: "🥭", num: 1, title: "Fresh Ingredients", desc: "Carefully selected fruits and vegetables from trusted local farmers." },
    { emoji: "🌶️", num: 2, title: "Handcrafted Spices", desc: "Authentic spice blends prepared fresh in-house, every batch." },
    { emoji: "☀️", num: 3, title: "Sun Matured", desc: "Naturally matured under sunlight for deep, rich flavour." },
    { emoji: "❤️", num: 4, title: "Packed With Love", desc: "Freshly packed and delivered across India, jar by jar." },
  ];
  return (
    <section className="section-pad" style={{ background: COLORS.creamDark, padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader eyebrow="Our Process" title="How We Make Our Pickles" sub="Traditional methods passed down through generations." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem",
        }}>
          {steps.map(step => (
            <Reveal key={step.num}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 90, height: 90,
                  borderRadius: "50%",
                  background: COLORS.forest,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2.2rem",
                  margin: "0 auto 1rem",
                  position: "relative",
                  boxShadow: "0 8px 24px rgba(28,61,46,0.25)",
                }}>
                  <span aria-hidden="true">{step.emoji}</span>
                  <span style={{
                    position: "absolute", bottom: -4, right: -4,
                    background: COLORS.gold,
                    color: COLORS.forest,
                    borderRadius: "50%",
                    width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "0.8rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}>{step.num}</span>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{step.title}</div>
                <div style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STORY ────────────────────────────────────────────────────────────────────
function StorySection() {
  const stats = [
    { num: "2K+", label: "Happy Customers" },
    { num: "20+", label: "Pickle Varieties" },
    { num: "100%", label: "Natural Ingredients" },
    { num: "3 Gen", label: "Of Recipes" },
  ];
  return (
    <section className="section-pad" style={{ background: COLORS.forest, padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center",
      }} className="story-grid">
        <div>
          <div style={{ color: COLORS.gold, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Our Story
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 900, color: COLORS.white, lineHeight: 1.15, marginBottom: "1rem" }}>
            A Legacy of Taste &amp; Tradition
          </h2>
          <div style={{ width: 56, height: 3, background: COLORS.gold, borderRadius: 2, marginBottom: "1.5rem" }} aria-hidden="true" />
          <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.95rem" }}>
            AchaarYaar was born from a simple dream — to preserve and share the authentic homemade flavours of Bihar with families across India.
          </p>
          <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8, fontSize: "0.95rem" }}>
            Inspired by our grandmothers and their treasured recipes, each jar is handcrafted with patience, passion, and deep respect for tradition.
          </p>
          <Link href="/about" className="btn-secondary-gold" style={{ marginTop: "1.75rem" }}>Read Full Story →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="stats-grid">
          {stats.map(st => (
            <div key={st.label} style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: RADIUS.lg, padding: "1.75rem", textAlign: "center" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 900, color: COLORS.gold }}>{st.num}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", marginTop: "0.25rem" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  const faqs = [
    { q: "How are AchaarYaar pickles prepared?", a: "All our pickles are handcrafted in small batches using traditional family recipes, premium ingredients, and authentic spices — no shortcuts." },
    { q: "Do your pickles contain preservatives?", a: "No. Our pickles are naturally preserved using traditional methods without harmful artificial preservatives." },
    { q: "Do you deliver across India?", a: "Yes. We deliver safely across India through trusted courier partners, with careful packaging to ensure jars arrive in perfect condition." },
    { q: "What is the shelf life of your pickles?", a: "Generally 18–24 months in a cool, dry place. Once opened, refrigerate and consume within 3 months." },
  ];
  return (
    <section className="section-pad" id="faq" style={{ background: COLORS.cream, padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <SectionHeader eyebrow="FAQ" title="Have Questions?" />
        {faqs.map((f, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-button-${i}`;
          const isOpen = open === i;
          return (
            <div key={f.q} style={{ background: COLORS.white, border: `1px solid ${COLORS.sand}`, borderRadius: RADIUS.lg, marginBottom: "0.75rem", overflow: "hidden" }}>
              <h3 style={{ margin: 0 }}>
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="faq-trigger"
                  style={{
                    width: "100%", textAlign: "left", padding: "1.15rem 1.5rem",
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontFamily: FONT_BODY, fontWeight: 600, color: COLORS.ink, fontSize: "0.92rem",
                    gap: "1rem",
                  }}>
                  {f.q}
                  <span style={{ color: COLORS.forest, fontSize: "1.2rem", flexShrink: 0 }} aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
              </h3>
              {isOpen && (
                <div id={panelId} role="region" aria-labelledby={buttonId} style={{ padding: "0 1.5rem 1.15rem", color: COLORS.muted, fontSize: "0.87rem", lineHeight: 1.7 }}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
type SubscribeStatus = "idle" | "loading" | "success" | "error";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      // TODO: wire this up to your real newsletter endpoint, e.g.:
      // const res = await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
      // if (!res.ok) throw new Error();
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatus("success");
      setMessage("You're subscribed! Watch your inbox for offers.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="section-pad" style={{ background: COLORS.forestMid, padding: "clamp(2.75rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: COLORS.white, marginBottom: "0.5rem" }}>
          Get Exclusive Offers
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          New launches, seasonal specials, and subscriber-only discounts.
        </p>
        <form className="newsletter-row" onSubmit={handleSubscribe} style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <label htmlFor={inputId} style={srOnly}>Email address</label>
          <input
            id={inputId}
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status === "loading"}
            required
            style={{
              flex: 1, minWidth: 220,
              padding: "0.8rem 1.2rem",
              borderRadius: RADIUS.md,
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: "0.875rem",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: COLORS.white,
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-gold-solid"
            style={{ opacity: status === "loading" ? 0.7 : 1, cursor: status === "loading" ? "wait" : "pointer" }}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        <div role="status" aria-live="polite" style={{
          marginTop: "0.85rem",
          fontSize: "0.82rem",
          minHeight: "1.2em",
          color: status === "error" ? "#FFB4A8" : "rgba(255,255,255,0.9)",
          fontWeight: 600,
        }}>
          {message}
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .newsletter-row { flex-direction: column !important; }
          .newsletter-row input, .newsletter-row button { width: 100% !important; }
        }
      `}</style>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyFooter() {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Shop", links: [{ label: "Mango Pickles", href: "/products?category=mango" }, { label: "Spicy Pickles", href: "/products?category=spicy" }, { label: "Garlic Special", href: "/products?category=garlic" }, { label: "Lemon Pickles", href: "/products?category=lemon" }] },
    { title: "Company", links: [{ label: "Our Story", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }, { label: "Careers", href: "/careers" }, { label: "FAQs", href: "/#faq" }] },
    { title: "Support", links: [{ label: "Shipping Policy", href: "/shipping-policy" }, { label: "Returns", href: "/returns" }, { label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms", href: "/terms" }] },
  ];
  return (
    <footer style={{ background: "#2E3F30", padding: "clamp(2.75rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem) 2rem" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "3rem",
          marginBottom: "3rem",
        }} className="footer-grid">
          <div>
            <div style={{
              fontFamily: FONT_DISPLAY, color: COLORS.white, fontSize: "1.2rem", marginBottom: "0.5rem", fontWeight: 700,
            }}>
              AchaarYa<span style={{ color: COLORS.gold }}>ar</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: 280, marginBottom: "1.25rem" }}>
              Handcrafted pickles from the heart of Bihar. Traditional recipes, pure ingredients, delivered to your door.
            </p>

            {/* Contact details — builds trust for a real, reachable business */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="footer-link" style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.82rem" }}>
                <FiPhone size={14} color={COLORS.gold} aria-hidden="true" /> {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="footer-link" style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.82rem" }}>
                <FiMail size={14} color={COLORS.gold} aria-hidden="true" /> {CONTACT.email}
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.65)", fontSize: "0.82rem" }}>
                <FiMapPin size={14} color={COLORS.gold} aria-hidden="true" /> {CONTACT.location}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-icon-link" style={{ color: "rgba(255,255,255,0.75)" }}><SiInstagram size={18} /></a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-icon-link" style={{ color: "rgba(255,255,255,0.75)" }}><SiFacebook size={18} /></a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-icon-link" style={{ color: "rgba(255,255,255,0.75)" }}><SiYoutube size={18} /></a>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ color: COLORS.white, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "1rem" }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map(l => (
                  <li key={l.label} style={{ marginBottom: "0.5rem" }}>
                    <Link href={l.href} className="footer-link" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.85rem" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "1.5rem",
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.75rem",
        }}>
          © {year} AchaarYaar. All rights reserved. Made with ❤️ in Bihar.
        </div>
      </div>
    </footer>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      {eyebrow && (
        <div style={{
          color: COLORS.forest,
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: FONT_DISPLAY,
        fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
        fontWeight: 900,
        color: COLORS.ink,
        lineHeight: 1.15,
        marginBottom: sub ? "0.75rem" : 0,
      }}>{title}</h2>
      {sub && <p style={{ color: COLORS.muted, fontSize: "0.95rem", maxWidth: 500, margin: "0 auto" }}>{sub}</p>}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ fontFamily: FONT_BODY, background: COLORS.cream, minHeight: "100vh", overflowX: "hidden" }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <WelcomePopup />
      <TrustStrip />

      <main id="main-content">
        <Hero />
        <OfferBanner />
        <CategoryGrid />
        <FeaturedProducts />
        <AssuranceSection />
        <ProcessSection />
        <StorySection />
        <FAQSection />
        <Newsletter />
        <WhatsAppButton />
      </main>

      <style>{`
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; max-width: 100%; }

        /* ── Skip link ─────────────────────────────────────────────── */
        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          background: ${COLORS.forest};
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 0 0 10px 0;
          z-index: 2000;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
        }
        .skip-link:focus {
          left: 0;
        }

        /* ── Global focus visibility ───────────────────────────────── */
        a:focus-visible,
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid ${COLORS.gold};
          outline-offset: 3px;
          border-radius: 4px;
        }

        /* ── Buttons ────────────────────────────────────────────────── */
        .btn-primary {
          background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
          color: ${COLORS.forest};
          padding: 0.95rem 2.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(193,138,66,0.4);
          border: 1px solid rgba(255,255,255,0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .btn-primary:hover, .btn-primary:focus-visible {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(193,138,66,0.5);
        }

        .btn-ghost-light {
          background: transparent;
          color: #fff;
          padding: 0.9rem 2.1rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.45);
          display: inline-block;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        }
        .btn-ghost-light:hover, .btn-ghost-light:focus-visible {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.8);
          transform: translateY(-3px);
        }

        .btn-outline-gold {
          background: transparent;
          border: 1.5px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 0.85rem 2rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          text-decoration: none;
          display: inline-block;
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .btn-outline-gold:hover, .btn-outline-gold:focus-visible {
          background: ${COLORS.gold};
          color: ${COLORS.forest};
          transform: translateY(-3px);
        }

        .btn-secondary-gold {
          background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
          color: ${COLORS.forest};
          padding: 0.9rem 2.1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 8px 22px rgba(0,0,0,0.2);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .btn-secondary-gold:hover, .btn-secondary-gold:focus-visible {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.28);
        }

        .btn-gold-solid {
          background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
          color: ${COLORS.forest};
          border: 1px solid rgba(255,255,255,0.3);
          padding: 0.9rem 2rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.3px;
          box-shadow: 0 8px 22px rgba(193,138,66,0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .btn-gold-solid:hover:not(:disabled), .btn-gold-solid:focus-visible {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(193,138,66,0.45);
        }

        .coupon-copy-btn { transition: background 0.15s ease, transform 0.1s ease; }
        .coupon-copy-btn:hover, .coupon-copy-btn:focus-visible { transform: translateY(-1px); }
        .coupon-copy-btn:active { transform: translateY(0); }

        .icon-btn { transition: color 0.15s ease, background 0.15s ease; }
        .icon-btn:hover, .icon-btn:focus-visible { color: ${COLORS.ink} !important; background: rgba(0,0,0,0.06); }

        .faq-trigger { transition: background 0.15s ease; }
        .faq-trigger:hover { background: rgba(79,107,82,0.04); }

        .footer-link { transition: color 0.15s ease; }
        .footer-link:hover, .footer-link:focus-visible { color: ${COLORS.gold} !important; }
        .footer-icon-link { transition: color 0.15s ease, transform 0.15s ease; }
        .footer-icon-link:hover, .footer-icon-link:focus-visible { color: ${COLORS.gold} !important; transform: translateY(-2px); }

        /* ── Cards ──────────────────────────────────────────────────── */
        .card-link { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-link:hover, .card-link:focus-visible {
          transform: translateY(-6px);
          box-shadow: ${SHADOW.md};
        }

        /* ── Scroll reveal ──────────────────────────────────────────── */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .reveal { opacity: 1 !important; transform: none !important; }
        }

        /* ── Responsive ─────────────────────────────────────────────── */
        @media (max-width: 640px) {
          .trust-strip { gap: 1.1rem !important; padding: 0.65rem 1rem !important; justify-content: flex-start !important; overflow-x: auto !important; }
          .trust-item { font-size: 0.72rem !important; white-space: nowrap; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .offer-banner-inner { flex-direction: column !important; align-items: stretch !important; text-align: center !important; }
          .story-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .hero-badge { width: 60px !important; height: 60px !important; font-size: 0.6rem !important; top: -8px !important; right: -8px !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
