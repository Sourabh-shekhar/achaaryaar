const COLORS = { forest: "#4F6B52", gold: "#C18A42", cream: "#FBF7F1", ink: "#2D2A26", muted: "#5C5249", white: "#FFFFFF" };
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

function Header({ title }: { title: string }) {
  return (
    <section style={{ background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`, padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", textAlign: "center" }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", color: COLORS.white, fontWeight: 900 }}>{title}</h1>
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", color: COLORS.muted, fontSize: "0.95rem", lineHeight: 1.85 }}>
      {children}
    </section>
  );
}

export default function ShippingPolicyPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <Header title="Shipping Policy" />
      <Body>
        <p style={{ marginBottom: "1.25rem" }}>We dispatch every order within 1–2 business days from our kitchen in Bihar, using trusted courier partners who handle glass jars with care.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Delivery timelines</h2>
        <p style={{ marginBottom: "1.25rem" }}>Most orders arrive within 3–7 business days depending on your location. Remote areas may take a little longer.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Shipping charges</h2>
        <p style={{ marginBottom: "1.25rem" }}>Delivery is free on orders above ₹499. A flat shipping fee applies to smaller orders, shown at checkout.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Packaging</h2>
        <p>Every jar is sealed, cushioned, and boxed to survive transit. If anything arrives damaged, contact us within 48 hours of delivery and we&apos;ll make it right.</p>
      </Body>
    </div>
  );
}