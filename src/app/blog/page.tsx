const COLORS = {
  forest: "#4F6B52",
  gold: "#C18A42",
  cream: "#FBF7F1",
  creamDark: "#F3EDE3",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#5C5249",
  white: "#FFFFFF",
};
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

const posts = [
  { title: "5 Ways to Enjoy Mango Pickle Beyond the Thali", tag: "Recipes", date: "Jun 2026" },
  { title: "Why Sun-Maturing Still Makes the Best Pickle", tag: "Tradition", date: "May 2026" },
  { title: "Storing Your Achaar: Tips for a Longer Shelf Life", tag: "Guides", date: "Apr 2026" },
];

export default function BlogPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)",
        textAlign: "center",
      }}>
        <div style={{ color: COLORS.gold, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          From the Kitchen
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 5vw, 3rem)", color: COLORS.white, fontWeight: 900 }}>
          The Achaaryaar Blog
        </h1>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(3rem, 6vw, 4.5rem) clamp(1.25rem, 5vw, 2rem)" }}>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {posts.map(p => (
            <div key={p.title} style={{
              background: COLORS.white,
              border: `1px solid ${COLORS.sand}`,
              borderRadius: 16,
              padding: "1.75rem",
            }}>
              <span style={{
                background: COLORS.creamDark,
                color: COLORS.forest,
                fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase",
                padding: "0.25rem 0.7rem", borderRadius: 100,
              }}>{p.tag}</span>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: COLORS.ink, fontSize: "1.2rem", margin: "0.75rem 0 0.35rem" }}>
                {p.title}
              </div>
              <div style={{ color: COLORS.muted, fontSize: "0.82rem" }}>{p.date}</div>
            </div>
          ))}
        </div>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginTop: "2rem", textAlign: "center" }}>
          More stories, recipes and behind-the-scenes coming soon.
        </p>
      </section>
    </div>
  );
}