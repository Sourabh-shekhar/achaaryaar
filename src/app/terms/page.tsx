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

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "0.95rem",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Last updated: July 2026 — please read these terms before placing an
          order.
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
            By placing an order with AchaarYaar, you agree to these terms.
            Our products are handmade in small batches, so minor natural
            variation is expected, prices can change without notice, and
            please always check ingredients if you have allergies.
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
          Orders
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          All orders are subject to availability. Prices are listed in
          Indian Rupees (INR) and may change without prior notice. We reserve
          the right to refuse or cancel any order at our discretion — for
          example, in cases of suspected fraud, pricing errors, or stock
          unavailability — in which case you&apos;ll be notified and any
          payment already made will be refunded in full.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Product information
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We describe our products as accurately as possible. Because every
          batch is handmade, minor variations in colour, texture, and spice
          level are natural and not considered a defect. Product images are
          for illustration; actual appearance may vary slightly between
          batches.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Shipping &amp; delivery
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          Delivery timelines shown at checkout are estimates and not
          guarantees. AchaarYaar is not responsible for delays caused by
          courier partners, weather, customs, or other circumstances beyond
          our reasonable control.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Allergens &amp; liability
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          AchaarYaar is not liable for allergic reactions or adverse effects
          arising from consumption of our products. Please check the
          ingredient list on the product page and packaging carefully before
          consuming, especially if you have food allergies, sensitivities,
          or dietary restrictions. If you&apos;re unsure about an ingredient,
          contact us before ordering.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Intellectual property
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          All content on this website — including our logo, product
          photography, recipes, and written descriptions — belongs to
          AchaarYaar and may not be copied, reproduced, or used commercially
          without our written permission.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Changes to these terms
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We may update these terms from time to time to reflect changes in
          our practices or for legal reasons. The updated version will be
          posted on this page with a revised date, and continued use of our
          website after changes are posted constitutes acceptance of the
          revised terms.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Governing law
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          These terms are governed by the laws of India, and any disputes
          will be subject to the exclusive jurisdiction of the courts
          applicable to our place of business.
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
            Questions about these terms?
          </p>
          <p style={{ margin: 0 }}>
            Email us at{" "}
            <a
              href="mailto:support@achaaryaar.com"
              style={{ color: COLORS.forest, fontWeight: 600 }}
            >
              support@achaaryaar.com
            </a>{" "}
            and our team will be happy to help.
          </p>
        </div>
      </section>
    </div>
  );
}