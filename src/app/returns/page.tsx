const COLORS = { forest: "#4F6B52", gold: "#C18A42", cream: "#FBF7F1", ink: "#2D2A26", muted: "#5C5249", white: "#FFFFFF" };
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function ReturnsPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{ background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`, padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", color: COLORS.white, fontWeight: 900 }}>Returns &amp; Refunds</h1>
      </section>
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", color: COLORS.muted, fontSize: "0.95rem", lineHeight: 1.85 }}>
        <p style={{ marginBottom: "1.25rem" }}>Because our pickles are food items, we can&apos;t accept returns once a jar has been opened. Your satisfaction still matters to us — here&apos;s how we handle issues.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Damaged or incorrect orders</h2>
        <p style={{ marginBottom: "1.25rem" }}>If your order arrives damaged, leaking, or different from what you ordered, email us at support@achaaryaar.com within 48 hours with a photo, and we&apos;ll send a replacement or refund.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Refunds</h2>
        <p>Approved refunds are processed to your original payment method within 5–7 business days.</p>
      </section>
    </div>
  );
}