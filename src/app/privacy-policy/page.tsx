const COLORS = {
  forest: "#4F6B52",
  gold: "#C18A42",
  cream: "#FBF7F1",
  ink: "#2D2A26",
  muted: "#5C5249",
  white: "#FFFFFF",
  border: "#E8DDD1",
};
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: COLORS.cream,
        minHeight: "100vh",
      }}
    >
      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
          padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)",
            color: COLORS.white,
            fontWeight: 900,
            marginBottom: "0.6rem",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "0.95rem",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Last updated: July 2026 — how AchaarYaar collects, uses, and
          protects your information.
        </p>
      </section>

      <section
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 2rem)",
          color: COLORS.muted,
          fontSize: "0.95rem",
          lineHeight: 1.85,
        }}
      >
        {/* Summary callout up front */}
        <div
          style={{
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderLeft: `4px solid ${COLORS.gold}`,
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          <p style={{ color: COLORS.ink, fontWeight: 700, marginBottom: "0.4rem" }}>
            The short version
          </p>
          <p style={{ margin: 0 }}>
            We only collect what&apos;s needed to process your order and
            support you as a customer. We never sell your data, we never
            store your card details, and you can ask us to access, correct,
            or delete your information at any time.
          </p>
        </div>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Information we collect
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We collect only the information needed to process your order and
          improve your experience:
        </p>
        <ul style={{ margin: "0 0 1.25rem", paddingLeft: "1.25rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: COLORS.ink }}>Contact details</strong> — your name, email
            address, and phone number.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: COLORS.ink }}>Delivery information</strong> — your shipping
            address, used to fulfil and track your order.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: COLORS.ink }}>Order and payment details</strong> — items
            purchased, order value, and payment confirmation (card numbers
            themselves are never stored on our servers — see below).
          </li>
          <li>
            <strong style={{ color: COLORS.ink }}>Basic usage data</strong> — pages visited and
            device/browser type, used only to keep the site working properly
            and improve it over time.
          </li>
        </ul>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          How we use your data
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          Your information is used solely to fulfil orders, respond to
          enquiries, and — if you&apos;ve opted in — send you offers and
          updates. We never sell, rent, or trade your data to third parties
          for their own marketing purposes.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Who we share it with
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We share the minimum information necessary with trusted partners
          who help us run the business — such as courier services (to
          deliver your order) and payment gateways (to process your
          transaction). These partners are only permitted to use your data
          to perform that specific service for us.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Payment security
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          All payments are processed through encrypted, PCI-compliant
          gateways. We do not store your card details on our servers at any
          point in the transaction.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Cookies
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We use essential cookies to keep your cart and login session
          working, and basic analytics cookies to understand how the site is
          used. You can control or disable cookies through your browser
          settings at any time.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Data retention
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We retain your order information for as long as needed to comply
          with tax, accounting, and legal obligations, after which it is
          securely deleted or anonymized.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Your rights
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          You can request access to, correction of, or deletion of your
          personal data at any time. You can also opt out of marketing
          emails whenever you like using the unsubscribe link in any email,
          or by contacting us directly.
        </p>

        <div
          style={{
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginTop: "2rem",
          }}
        >
          <p style={{ color: COLORS.ink, fontWeight: 700, marginBottom: "0.4rem" }}>
            Questions about your data?
          </p>
          <p style={{ margin: 0 }}>
            Email us at{" "}
            <a
              href="mailto:support@achaaryaar.com"
              style={{ color: COLORS.forest, fontWeight: 600 }}
            >
              support@achaaryaar.com
            </a>{" "}
            and our team will respond promptly.
          </p>
        </div>
      </section>
    </div>
  );
}