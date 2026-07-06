const COLORS = {
  forest: "#4F6B52",
  gold: "#C18A42",
  cream: "#FBF7F1",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#5C5249",
  white: "#FFFFFF",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

const sections = [
  {
    title: "Why Bihar-style achaar tastes different",
    body: [
      "Bihar has a quiet but deeply confident food culture. A good meal is not only about the main dish; it is about the small things on the side that wake up the plate. Achaar is one of those small things. It brings sharpness to dal-chawal, warmth to paratha, and a familiar punch to simple curd rice or sattu.",
      "The difference is in balance. Mustard oil is not used only as an ingredient; it becomes the base note of the flavour. Spices are not added randomly. Fenugreek brings a gentle bitterness, fennel adds sweetness, mustard seeds bring heat, and hing gives that unmistakable savoury depth. When these flavours rest together, the pickle becomes rounded instead of harsh.",
    ],
  },
  {
    title: "The patient work behind a jar",
    body: [
      "Real achaar is slow food. Raw mango, lemon, chilli, garlic, and seasonal vegetables need cleaning, cutting, drying, mixing, and resting. Every stage matters. If there is too much moisture, the pickle loses its character. If the masala is rushed, the spices stay separate instead of becoming one flavour.",
      "At AchaarYaar, we try to preserve that patient rhythm. The goal is not to make pickle taste like a factory product. The goal is to make a jar that feels close to the kitchen memory many of us grew up with: a clean glass jar, warm oil, spices on the hand, and the smell of achaar opening before lunch.",
    ],
  },
  {
    title: "How to enjoy achaar beyond the usual thali",
    body: [
      "Pickle belongs with dal, rice, roti, litti, poori, and paratha, but it can do more. A small spoon of mango pickle masala can lift a sandwich. Lemon pickle works beautifully with curd and rice. Chilli pickle can turn a plain khichdi into something bold. Garlic pickle pairs well with simple millet rotis or roasted snacks.",
      "The trick is to use achaar like a flavour concentrate. You do not need too much. Start with a little oil and masala from the jar, mix it into the food, and then add pieces of pickle as needed. That way the flavour spreads evenly without overpowering the meal.",
    ],
  },
  {
    title: "Storing pickle the right way",
    body: [
      "Use a dry spoon every time. Keep the jar closed after serving. Store it away from direct moisture and avoid dipping wet food into the jar. These habits sound small, but they protect the taste and texture of the pickle.",
      "If you refrigerate after opening, the oil may thicken slightly, especially in cooler weather. That is normal. Let the jar sit at room temperature for a few minutes before serving. The aroma returns as the oil loosens.",
    ],
  },
];

export default function BlogPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)",
        textAlign: "center",
      }}>
        <div style={{ color: COLORS.gold, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          From Bihar Kitchens
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2.1rem, 6vw, 4rem)", color: COLORS.white, fontWeight: 900, maxWidth: 860, margin: "0 auto" }}>
          The story of achaar, patience, spice, and everyday Indian meals
        </h1>
        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 680, margin: "1.25rem auto 0" }}>
          A long-form note from AchaarYaar on what makes traditional pickle feel honest, memorable, and rooted in home.
        </p>
      </section>

      <article style={{ maxWidth: 920, margin: "0 auto", padding: "clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 2rem)" }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.sand}`, borderRadius: 20, padding: "clamp(1.5rem, 5vw, 3rem)" }}>
          <p style={{ color: COLORS.muted, fontSize: "1.05rem", lineHeight: 1.9, marginBottom: "2rem" }}>
            Some foods announce themselves loudly. Achaar does not need to. It sits in a small bowl near the edge of the plate, but one bite can change the whole meal. For many families in Bihar and across India, pickle is not just a condiment. It is memory, season, patience, and the skill of knowing how much spice is enough.
          </p>

          {sections.map((section) => (
            <section key={section.title} style={{ marginTop: "2.5rem" }}>
              <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 900, marginBottom: "1rem" }}>
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={{ color: COLORS.muted, fontSize: "1rem", lineHeight: 1.9, marginBottom: "1rem" }}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div style={{ marginTop: "3rem", padding: "1.5rem", borderRadius: 16, background: COLORS.cream, border: `1px solid ${COLORS.sand}` }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.ink, fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.75rem" }}>
              Our promise
            </h2>
            <p style={{ color: COLORS.muted, lineHeight: 1.9 }}>
              AchaarYaar is built around a simple belief: authentic flavour should feel personal. We want every jar to carry the warmth of regional Indian food, the confidence of Bihar-style masala, and the care of small-batch preparation.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
