const COLORS = { forest: "#4F6B52", gold: "#C18A42", cream: "#FBF7F1", ink: "#2D2A26", muted: "#5C5249", white: "#FFFFFF" };
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{ background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`, padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", color: COLORS.white, fontWeight: 900 }}>Terms &amp; Conditions</h1>
      </section>
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", color: COLORS.muted, fontSize: "0.95rem", lineHeight: 1.85 }}>
        <p style={{ marginBottom: "1.25rem" }}>By ordering from AchaarYaar, you agree to the following terms.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Orders</h2>
        <p style={{ marginBottom: "1.25rem" }}>All orders are subject to availability. Prices are listed in Indian Rupees and may change without prior notice.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Product information</h2>
        <p style={{ marginBottom: "1.25rem" }}>We describe our products as accurately as possible. Minor variations in colour, texture, and spice level are natural in handmade batches.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Liability</h2>
        <p>AchaarYaar is not liable for allergic reactions. Please check ingredient lists carefully before consuming.</p>
      </section>
    </div>
  );
}