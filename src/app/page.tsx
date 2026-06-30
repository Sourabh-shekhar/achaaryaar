"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiInstagram, SiFacebook, SiYoutube } from "react-icons/si";

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
  muted: "#7A6F65",
  white: "#FFFFFF",
  red: "#6B1F1F",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "system-ui, -apple-system, sans-serif";

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { icon: "🚚", text: "Free delivery above ₹499" },
    { icon: "🌿", text: "No artificial preservatives" },
    { icon: "🏠", text: "Homemade recipes" },
    { icon: "♻️", text: "Eco-friendly packaging" },
  ];
  return (
    <div style={{
      background: COLORS.forestMid,
      padding: "0.75rem 2rem",
      display: "flex",
      justifyContent: "center",
      gap: "2.5rem",
      flexWrap: "wrap",
      borderBottom: `1px solid rgba(255,255,255,0.1)`,
    }}>
      {items.map(item => (
        <div key={item.text} style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          color: "rgba(255,255,255,0.85)",
          fontSize: "0.8rem", fontWeight: 500,
        }}>
          <span>{item.icon}</span>{item.text}
        </div>
      ))}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
      padding: "5rem 2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: "-5%", top: "-20%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,146,58,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
      }} className="hero-grid">
        {/* Left */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(201,146,58,0.15)",
            border: "1px solid rgba(201,146,58,0.35)",
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
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
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
            color: "rgba(255,255,255,0.68)",
            fontSize: "1.05rem",
            lineHeight: 1.75,
            maxWidth: 440,
            marginBottom: "2.25rem",
          }}>
            Handcrafted with premium ingredients and age-old techniques passed through generations. No preservatives. Pure tradition.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <Link href="/products" style={{
              background: COLORS.gold,
              color: COLORS.forest,
              padding: "0.85rem 2rem",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(201,146,58,0.4)",
            }}>
              Shop Pickles →
            </Link>
            <Link href="/about" style={{
              background: "transparent",
              color: COLORS.white,
              padding: "0.85rem 2rem",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
            }}>
              Our Story
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div style={{ display: "flex" }}>
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
              <div style={{ color: COLORS.white, fontWeight: 700, fontSize: "0.85rem" }}>4,800+ Happy Customers</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem" }}>Across India ⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Right – real product photo */}
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{
            borderRadius: 24,
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
          <div style={{
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

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── CATEGORY GRID ────────────────────────────────────────────────────────────
function CategoryGrid() {
  const cats = [
    { slug: "mango", emoji: "🥭", photo: "/image/mango-category.jpg", zoom: 1.4, posX: "30%", posY: "35%", badge: "Best Seller", name: "Mango Pickles", desc: "Traditional mango pickles with authentic Bihar taste.", accent: "#FFF4E0" },
    { slug: "spicy", emoji: "🌶️", photo: "/image/spicy-category.jpg", zoom: 2.2, posX: "75%", posY: "60%", badge: "Hot & Spicy", name: "Spicy Pickles", desc: "Fiery flavours using premium chillies and spices.", accent: "#FFF0EE" },
    { slug: "garlic", emoji: "🧄", photo: "/image/garlic-category.jpg", zoom: 2.2, posX: "70%", posY: "60%", badge: "Premium", name: "Garlic Special", desc: "Rich garlic flavour with traditional recipes.", accent: "#F2EEF9" },
    { slug: "lemon", emoji: "🍋", photo: "/image/lemon-category.jpg", zoom: 2.2, posX: "70%", posY: "55%", badge: "Tangy", name: "Lemon Pickles", desc: "Refreshing lemon pickles bursting with bright flavour.", accent: "#FDFCE8" },
  ];
  return (
    <section style={{ background: COLORS.cream, padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader eyebrow="Browse Our Range" title="Shop by Category" sub="Explore flavours your family will love." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}>
          {cats.map(c => (
            <Link key={c.name} href={`/shop?category=${c.slug}`} style={{
              background: COLORS.white,
              borderRadius: 18,
              border: `1px solid ${COLORS.sand}`,
              overflow: "hidden",
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "block",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(28,61,46,0.14)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                background: c.accent,
                height: 160,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "4rem",
                position: "relative",
                overflow: "hidden",
              }}>
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    style={{
                      position: "absolute",
                      top: 0, left: 0,
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      objectPosition: `${c.posX} ${c.posY}`,
                      transform: `scale(${c.zoom})`,
                      transformOrigin: "center center",
                    }}
                  />
                ) : (
                  c.emoji
                )}
              </div>
              <div style={{ padding: "1.25rem" }}>
                <span style={{
                  background: COLORS.creamDark,
                  color: COLORS.forest,
                  fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase",
                  padding: "0.25rem 0.7rem", borderRadius: 100,
                }}>{c.badge}</span>
                <div style={{ color: "#F5A623", fontSize: "0.78rem", margin: "0.5rem 0 0.3rem" }}>★★★★★</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "1.05rem", marginBottom: "0.35rem" }}>{c.name}</div>
                <div style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            </Link>
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
    <section style={{ background: COLORS.creamDark, padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader eyebrow="Featured Products" title="Bestsellers"
          sub="Traditional homemade pickles crafted with love." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {products.map(p => (
            <Link key={p.id} href="/shop" style={{
              background: COLORS.white,
              borderRadius: 18,
              border: `1px solid ${COLORS.sand}`,
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              textDecoration: "none",
              display: "block",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 16px 32px rgba(28,61,46,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                background: p.bg,
                height: 200,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <img
                  src={p.photo}
                  alt={p.name}
                  style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                  }}
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
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: "0.82rem",
                    }}
                  >
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY CHOOSE US BANNER (full poster image) ────────────────────────────────
function WhyChooseUsBanner() {
  return (
    <section style={{ background: COLORS.cream, padding: "0 2rem 5rem" }}>
      <div style={{
        maxWidth: 1000, margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 24px 48px rgba(28,61,46,0.16)",
        border: `1px solid ${COLORS.sand}`,
      }}>
        <Image
          src="/image/holding.jpg"
          alt="Achaar Yaar — pure tradition, authentic taste, homemade pickles made fresh in small batches with no preservatives"
          width={1024}
          height={1536}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </section>
  );
}

// ─── OFFER BANNER ─────────────────────────────────────────────────────────────
function OfferBanner() {
  return (
    <section style={{ padding: "0 2rem 5rem", background: COLORS.cream }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          background: `linear-gradient(130deg, ${COLORS.forest} 0%, #3D5640 100%)`,
          borderRadius: 24,
          padding: "3.5rem 4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: "-4%", top: "-40%",
            width: 400, height: 400,
            borderRadius: "50%",
            background: "rgba(201,146,58,0.08)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", color: COLORS.white, marginBottom: "0.4rem", fontWeight: 900 }}>
              Get 10% Off Your First Order
            </h2>
            <p style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Join thousands of happy customers — use the code below at checkout.
            </p>
            <div style={{
              background: "rgba(201,146,58,0.15)",
              border: "1px dashed rgba(201,146,58,0.5)",
              borderRadius: 12,
              padding: "1rem 1.5rem",
              display: "inline-block",
              marginBottom: "1.5rem",
            }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.25rem" }}>
                Coupon Code
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: COLORS.gold, letterSpacing: "4px" }}>
                WELCOME10
              </div>
            </div>
            <br />
            <Link href="/products" style={{
              background: COLORS.gold,
              color: COLORS.forest,
              padding: "0.85rem 2rem",
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
            }}>Shop Now →</Link>
          </div>
          <div style={{ fontSize: "9rem", opacity: 0.08, position: "relative", zIndex: 1 }}>🥒</div>
        </div>
      </div>
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
    <section style={{ background: COLORS.creamDark, padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader eyebrow="Our Process" title="How We Make Our Pickles" sub="Traditional methods passed down through generations." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
        }}>
          {steps.map(step => (
            <div key={step.num} style={{ textAlign: "center" }}>
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
                {step.emoji}
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
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STORY ────────────────────────────────────────────────────────────────────
function StorySection() {
  const stats = [
    { num: "4,800+", label: "Happy Customers" },
    { num: "20+", label: "Pickle Varieties" },
    { num: "100%", label: "Natural Ingredients" },
    { num: "3 Gen", label: "Of Recipes" },
  ];
  return (
    <section style={{ background: COLORS.forest, padding: "5rem 2rem" }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "4rem", alignItems: "center",
      }} className="story-grid">
        <div>
          <div style={{ color: COLORS.gold, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Our Story
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "2.8rem", fontWeight: 900, color: COLORS.white, lineHeight: 1.15, marginBottom: "1rem" }}>
            A Legacy of Taste &amp; Tradition
          </h2>
          <div style={{ width: 56, height: 3, background: COLORS.gold, borderRadius: 2, marginBottom: "1.5rem" }} />
          <p style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.95rem" }}>
            Achaaryaar was born from a simple dream — to preserve and share the authentic homemade flavours of Bihar with families across India.
          </p>
          <p style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8, fontSize: "0.95rem" }}>
            Inspired by our grandmothers and their treasured recipes, each jar is handcrafted with patience, passion, and deep respect for tradition.
          </p>
          <Link href="/about" style={{ background: COLORS.gold, color: COLORS.forest, padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, textDecoration: "none", display: "inline-block", marginTop: "1.75rem" }}>Read Full Story →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {stats.map(st => (
            <div key={st.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "1.75rem", textAlign: "center" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 900, color: COLORS.gold }}>{st.num}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: "0.25rem" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .story-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How are Achaaryaar pickles prepared?", a: "All our pickles are handcrafted in small batches using traditional family recipes, premium ingredients, and authentic spices — no shortcuts." },
    { q: "Do your pickles contain preservatives?", a: "No. Our pickles are naturally preserved using traditional methods without harmful artificial preservatives." },
    { q: "Do you deliver across India?", a: "Yes. We deliver safely across India through trusted courier partners, with careful packaging to ensure jars arrive in perfect condition." },
    { q: "What is the shelf life of your pickles?", a: "Generally 18–24 months in a cool, dry place. Once opened, refrigerate and consume within 3 months." },
  ];
  return (
    <section style={{ background: COLORS.cream, padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <SectionHeader eyebrow="FAQ" title="Have Questions?" />
        {faqs.map((f, i) => (
          <div key={f.q} style={{ background: COLORS.white, border: `1px solid ${COLORS.sand}`, borderRadius: 14, marginBottom: "0.75rem", overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%", textAlign: "left", padding: "1.15rem 1.5rem",
                background: "none", border: "none", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: FONT_BODY, fontWeight: 600, color: COLORS.ink, fontSize: "0.92rem",
              }}>
              {f.q}
              <span style={{ color: COLORS.forest, fontSize: "1.2rem", flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 1.5rem 1.15rem", color: COLORS.muted, fontSize: "0.87rem", lineHeight: 1.7 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section style={{ background: COLORS.forestMid, padding: "4rem 2rem", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", color: COLORS.white, marginBottom: "0.5rem" }}>
          Get Exclusive Offers
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          New launches, seasonal specials, and subscriber-only discounts.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              flex: 1, minWidth: 220,
              padding: "0.8rem 1.2rem",
              borderRadius: 12,
              border: "none",
              fontSize: "0.875rem",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: COLORS.white,
            }}
          />
          <button
            onClick={() => email && alert(`Subscribed: ${email}`)}
            style={{
              background: COLORS.gold,
              color: COLORS.forest,
              border: "none",
              padding: "0.8rem 1.75rem",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}>
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Shop", links: ["Mango Pickles", "Spicy Pickles", "Garlic Special", "Lemon Pickles"] },
    { title: "Company", links: ["Our Story", "Blog", "Contact", "FAQs"] },
    { title: "Support", links: ["Shipping Policy", "Returns", "Privacy Policy", "Terms"] },
  ];
  return (
    <footer style={{ background: "#2E3F30", padding: "4rem 2rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
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
              Achaarya<span style={{ color: COLORS.gold }}>ar</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: 280, marginBottom: "1rem" }}>
              Handcrafted pickles from the heart of Bihar. Traditional recipes, pure ingredients, delivered to your door.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href="#" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.6)" }}><SiInstagram size={18} /></a>
              <a href="#" aria-label="Facebook" style={{ color: "rgba(255,255,255,0.6)" }}><SiFacebook size={18} /></a>
              <a href="#" aria-label="YouTube" style={{ color: "rgba(255,255,255,0.6)" }}><SiYoutube size={18} /></a>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ color: COLORS.white, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "1rem" }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map(l => (
                  <li key={l} style={{ marginBottom: "0.5rem" }}>
                    <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.85rem" }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = COLORS.gold}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "1.5rem",
          textAlign: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.75rem",
        }}>
          © 2025 Achaaryaar. All rights reserved. Made with ❤️ in Bihar.
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      {eyebrow && (
        <div style={{
          color: COLORS.forestLight,
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: FONT_DISPLAY,
        fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
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
    <div style={{ fontFamily: FONT_BODY, background: COLORS.cream, minHeight: "100vh" }}>
      <TrustStrip />
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyChooseUsBanner />
      <OfferBanner />
      <ProcessSection />
      <StorySection />
      <FAQSection />
      <Newsletter />
      <Footer />
    </div>
  );
}