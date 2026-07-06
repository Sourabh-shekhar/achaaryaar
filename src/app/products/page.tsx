import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { baseUrl } from "@/lib/baseUrl";

export const revalidate = 60;

const COLORS = {
  forest: "#4F6B52",
  forestDark: "#2E3F30",
  gold: "#C18A42",
  goldLight: "#D9A85F",
  cream: "#FBF7F1",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#5C5249",
  red: "#6B1F1F",
};

type Product = {
  _id: string;
  name: string;
  description: string;
  category?: string;
  image: string;
  featured?: boolean;
  weights: {
    size: string;
    price: number;
    stock: number;
  }[];
};

const CATEGORY_LINKS = [
  { label: "All", value: "" },
  { label: "Mango", value: "mango" },
  { label: "Lemon", value: "lemon" },
  { label: "Garlic", value: "garlic" },
  { label: "Spicy", value: "spicy" },
  { label: "Combo", value: "combo" },
];

const COMBO_PRODUCTS: Product[] = [
  {
    _id: "combo-3-box-bihar",
    name: "3 Item Bihar Combo Pack",
    description:
      "A ready combo of 3 pickle jars for daily meals: mango, lemon, and chilli style flavours packed for family use or gifting.",
    category: "combo pack",
    image: "/image/jars-yellow.png",
    featured: true,
    weights: [
      {
        size: "3 items",
        price: 399,
        stock: 50,
      },
    ],
  },
  {
    _id: "combo-4-box-family",
    name: "4 Item Family Combo Pack",
    description:
      "A fuller 4 item combo pack with classic Bihar-style pickle flavours for homes that want variety on the table every day.",
    category: "combo pack",
    image: "/image/holding.jpg",
    featured: true,
    weights: [
      {
        size: "4 items",
        price: 499,
        stock: 50,
      },
    ],
  },
];

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();
  return data.products || [];
}

function getLowestPrice(product: Product) {
  const prices = (product.weights || [])
    .map((weight) => Number(weight.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return prices.length > 0 ? Math.min(...prices) : null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const products = await getProducts();
  const allProducts = [...COMBO_PRODUCTS, ...products];
  const params = await searchParams;
  const search = params.search?.toLowerCase().trim() || "";
  const category = params.category?.toLowerCase().trim() || "";

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    const matchesCategory =
      !category || product.category?.toLowerCase().includes(category);

    return matchesSearch && matchesCategory;
  });

  const featuredCount = allProducts.filter((product) => product.featured).length;
  const inStockCount = allProducts.filter((product) =>
    product.weights?.some((weight) => weight.stock > 0)
  ).length;
  const validStartingPrices = allProducts
    .map((product) => getLowestPrice(product))
    .filter((price): price is number => typeof price === "number");
  const startingPrice =
    validStartingPrices.length > 0
      ? Math.min(...validStartingPrices)
      : null;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream }}>
      <section
        style={{
          background: `linear-gradient(135deg, ${COLORS.forestDark} 0%, ${COLORS.forest} 100%)`,
          padding: "clamp(3rem, 8vw, 5rem) 1.25rem clamp(5rem, 10vw, 7rem)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(193,138,66,0.16)",
              border: "1px solid rgba(217,168,95,0.38)",
              color: COLORS.goldLight,
              padding: "0.45rem 1rem",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "1.2rem",
            }}
          >
            Small-batch Bihar pickles
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              lineHeight: 1.08,
              fontWeight: 900,
              color: "#fff",
              margin: "0 auto 1rem",
              maxWidth: 760,
            }}
          >
            Pickle jars for everyday meals, gifting, and cravings.
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            Explore handcrafted mango, lemon, garlic, chilli, and seasonal
            achaar made with balanced spices and traditional recipes.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.25rem" }}>
        <section
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.sand}`,
            borderRadius: 18,
            boxShadow: "0 16px 42px rgba(28,61,46,0.12)",
            padding: "1.25rem",
            marginTop: "-3.5rem",
            marginBottom: "2rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <form
            action="/products"
            method="GET"
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            {category && <input type="hidden" name="category" value={category} />}
            <input
              type="text"
              name="search"
              defaultValue={params.search || ""}
              placeholder="Search mango, lemon, garlic..."
              style={{
                flex: 1,
                minWidth: 220,
                padding: "0.85rem 1rem",
                borderRadius: 12,
                border: `1px solid ${COLORS.sand}`,
                fontSize: "0.95rem",
                outline: "none",
                color: COLORS.ink,
                background: COLORS.cream,
              }}
            />
            <button
              type="submit"
              style={{
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                padding: "0.85rem 1.6rem",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              marginTop: "1rem",
            }}
          >
            {CATEGORY_LINKS.map((item) => {
              const isActive = item.value === category;
              const href = item.value
                ? `/products?category=${item.value}${search ? `&search=${search}` : ""}`
                : `/products${search ? `?search=${search}` : ""}`;

              return (
                <Link
                  key={item.label}
                  href={href}
                  style={{
                    border: `1px solid ${isActive ? COLORS.forest : COLORS.sand}`,
                    background: isActive ? COLORS.forest : COLORS.cream,
                    color: isActive ? "#fff" : COLORS.ink,
                    borderRadius: 999,
                    padding: "0.55rem 0.9rem",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { value: `${allProducts.length}+`, label: "pickle varieties" },
            { value: `${inStockCount}`, label: "currently in stock" },
            { value: `${featuredCount}`, label: "featured favourites" },
            {
              value: startingPrice ? `Rs. ${startingPrice}` : "Soon",
              label: "starting price",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.sand}`,
                borderRadius: 16,
                padding: "1rem",
              }}
            >
              <p
                style={{
                  color: COLORS.red,
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  marginBottom: "0.2rem",
                }}
              >
                {item.value}
              </p>
              <p
                style={{
                  color: COLORS.muted,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                  fontWeight: 800,
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </section>

        {(search || category) && (
          <p
            style={{
              color: COLORS.muted,
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            Showing {filteredProducts.length} result
            {filteredProducts.length === 1 ? "" : "s"}
            {category ? ` in ${category}` : ""}
            {search ? ` for "${search}"` : ""}.
          </p>
        )}

        {filteredProducts.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: `1px solid ${COLORS.sand}`,
              borderRadius: 18,
              textAlign: "center",
              padding: "4rem 2rem",
              color: COLORS.muted,
              fontSize: "1rem",
              marginBottom: "5rem",
            }}
          >
            <h2
              style={{
                color: COLORS.ink,
                fontSize: "1.5rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              No jars matched that search
            </h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Try another flavour or browse the full pickle collection.
            </p>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                background: COLORS.gold,
                color: COLORS.ink,
                borderRadius: 999,
                padding: "0.8rem 1.3rem",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              View all products
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
              gap: "1.75rem",
              paddingBottom: "5rem",
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                description={product.description}
                image={product.image}
                href={product._id.startsWith("combo-") ? "/products?category=combo" : undefined}
                weights={product.weights}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
