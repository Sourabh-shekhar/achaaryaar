const COLORS = { forest: "#4F6B52", gold: "#C18A42", cream: "#FBF7F1", ink: "#2D2A26", muted: "#5C5249", white: "#FFFFFF" };
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{ background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`, padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", color: COLORS.white, fontWeight: 900 }}>Privacy Policy</h1>
      </section>
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)", color: COLORS.muted, fontSize: "0.95rem", lineHeight: 1.85 }}>
        <p style={{ marginBottom: "1.25rem" }}>We collect only the information needed to process your order and improve your experience — your name, delivery address, phone number, and payment details.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>How we use your data</h2>
        <p style={{ marginBottom: "1.25rem" }}>Your information is used solely to fulfil orders, respond to enquiries, and — if you&apos;ve opted in — send you offers and updates. We never sell your data to third parties.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Payment security</h2>
        <p style={{ marginBottom: "1.25rem" }}>All payments are processed through encrypted, PCI-compliant gateways. We do not store your card details on our servers.</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.1rem", margin: "1.75rem 0 0.75rem" }}>Your rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data at any time by emailing support@achaaryaar.com.</p>
      </section>
    </div>
  );
}