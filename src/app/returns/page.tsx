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

export default function ReturnsPage() {
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
          Returns &amp; Refunds Policy
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "0.95rem",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Please read this policy carefully before placing your order.
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
        {/* Non-returnable notice — called out up front, not buried */}
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
            All our products are non-returnable.
          </p>
          <p style={{ margin: 0 }}>
            Because our pickles and preserves are perishable food items, we
            cannot accept returns or exchanges once an order has been
            delivered — whether the jar has been opened or not. This is
            standard practice across the food industry and is in place to
            protect the hygiene and safety of every customer. Your
            satisfaction still matters to us, and the sections below explain
            exactly how we make things right if something goes wrong on our
            end.
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
          Eligibility for a replacement or refund
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          While we don&apos;t accept returns, we will replace or refund an
          order if any of the following apply:
        </p>
        <ul style={{ margin: "0 0 1.25rem", paddingLeft: "1.25rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            The jar arrived <strong style={{ color: COLORS.ink }}>damaged, broken, or leaking</strong> in
            transit.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            You received the <strong style={{ color: COLORS.ink }}>wrong product or wrong quantity</strong> compared
            to your order confirmation.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            The product shows signs of <strong style={{ color: COLORS.ink }}>spoilage, contamination, or a
            quality defect</strong> that isn&apos;t due to improper storage after delivery.
          </li>
          <li>
            Your order <strong style={{ color: COLORS.ink }}>never arrived</strong> and tracking confirms it was
            lost in transit.
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
          How to report an issue
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          Email us at{" "}
          <a
            href="mailto:support@achaaryaar.com"
            style={{ color: COLORS.forest, fontWeight: 600 }}
          >
            support@achaaryaar.com
          </a>{" "}
          within <strong style={{ color: COLORS.ink }}>48 hours of delivery</strong> with your order
          number and a clear photo or short video of the issue. Our team
          typically responds within 1–2 business days with next steps.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Replacements
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          Where possible, we prefer to send a replacement jar of the same
          product and size at no extra cost, once the issue is verified. This
          is usually the fastest resolution and ships within 2–3 business
          days.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          Refunds
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          If a replacement isn&apos;t suitable or the item is out of stock,
          approved refunds are processed to your original payment method
          within <strong style={{ color: COLORS.ink }}>5–7 business days</strong>. You&apos;ll receive
          an email confirmation once the refund has been initiated.
        </p>

        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.ink,
            fontSize: "1.15rem",
            margin: "1.75rem 0 0.75rem",
          }}
        >
          What isn&apos;t covered
        </h2>
        <p style={{ marginBottom: "1.25rem" }}>
          We&apos;re unable to offer a replacement or refund for change of
          mind, taste preference, or products that have been mishandled or
          stored improperly after delivery (for example, left unrefrigerated
          or exposed to direct heat when the label recommends otherwise).
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
            Still need help?
          </p>
          <p style={{ margin: 0 }}>
            Reach out to our support team any time at{" "}
            <a
              href="mailto:support@achaaryaar.com"
              style={{ color: COLORS.forest, fontWeight: 600 }}
            >
              support@achaaryaar.com
            </a>{" "}
            — we read every message and aim to resolve issues quickly and
            fairly.
          </p>
        </div>
      </section>
    </div>
  );
}