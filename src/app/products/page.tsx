import ProductCard from "@/components/ProductCard";
import { baseUrl } from "@/lib/baseUrl";
const COLORS = {
  forest: "#1C3D2E",
  forestMid: "#2A5540",
  gold: "#C9923A",
  cream: "#FBF7F1",
  creamDark: "#F3EDE3",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#7A6F65",
};



async function getProducts() {
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();
  return data.products || [];
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const products = await getProducts();

  const params = await searchParams;
  const search = params.search?.toLowerCase() || "";

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(search)
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream }}>
      {/* Header banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.forest} 0%, #0E2419 100%)`,
          padding: "4rem 2rem 5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(201,146,58,0.15)",
            border: "1px solid rgba(201,146,58,0.35)",
            color: COLORS.gold,
            padding: "0.35rem 1rem",
            borderRadius: 100,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          🫙 Our Full Range
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: "0.75rem",
          }}
        >
          Grandma&apos;s Specials ⭐
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "1rem",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Every jar handcrafted in small batches, just like home.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
        {/* Search bar pulled up to overlap the banner */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.sand}`,
            borderRadius: 18,
            boxShadow: "0 16px 40px rgba(28,61,46,0.12)",
            padding: "1.25rem 1.5rem",
            marginTop: "-3rem",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <form action="/products" method="GET" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="text"
              name="search"
              defaultValue={params.search || ""}
              placeholder="Search pickles by name..."
              style={{
                flex: 1,
                minWidth: 200,
                padding: "0.75rem 1.1rem",
                borderRadius: 12,
                border: `1px solid ${COLORS.sand}`,
                fontSize: "0.9rem",
                outline: "none",
                color: COLORS.ink,
              }}
            />
            <button
              type="submit"
              style={{
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {search && (
          <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "2rem", fontSize: "0.95rem" }}>
            Search results for{" "}
            <span style={{ fontWeight: 700, color: COLORS.gold }}>&ldquo;{search}&rdquo;</span>
          </p>
        )}

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: COLORS.muted,
              fontSize: "1.1rem",
            }}
          >
            No products found 😔
            <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Try a different search term.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.75rem",
              paddingBottom: "5rem",
            }}
          >
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                description={product.description}
                image={product.image}
                weights={product.weights}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}