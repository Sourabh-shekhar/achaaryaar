"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type Weight = {
  size?: string;
  quantity?: string;
  weight?: string;
  price: number;
  stock: number;
  unavailable?: boolean;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  image: string;
  images?: string[];
  weights: Weight[];
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
};

const STANDARD_SIZES = ["125g", "225g", "425g"];

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("specifications");
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  // Combo packs keep their own custom sizes (e.g. "3 items", "4 items").
  // Every other product always shows all 3 standard sizes - real ones with
  // their actual price/stock, and any missing ones shown as "Not Available".
  const isCombo =
    product.category?.toLowerCase().includes("combo") ||
    product._id.startsWith("combo-");

  const displayWeights: Weight[] = isCombo
    ? product.weights || []
    : STANDARD_SIZES.map((size) => {
        const existing = product.weights?.find(
          (w) => (w.size || w.quantity || w.weight) === size
        );
        return existing ? { ...existing } : { size, price: 0, stock: 0, unavailable: true };
      });

  const [activeImage, setActiveImage] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const selectedWeight = displayWeights[selectedIndex];
  const isUnavailable = selectedWeight?.unavailable === true;
  const selectedWeightLabel =
    selectedWeight?.size || selectedWeight?.quantity || selectedWeight?.weight || "Size";
  const outOfStock = !selectedWeight || selectedWeight.stock <= 0 || isUnavailable;

  const handleAddToCart = () => {
    if (added) {
      router.push("/cart");
      return;
    }
    if (!selectedWeight || outOfStock) return;

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant: selectedWeightLabel,
      },
      1
    );

    setAdded(true);
    setToast(`${product.name} (${selectedWeightLabel}) added to cart`);
    setTimeout(() => setToast(null), 3000);
  };
  const handleBuyNow = () => {
    if (!selectedWeight || outOfStock) return;

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant: selectedWeightLabel,
      },
      1
    );

    router.push("/checkout");
  };

  const handleSelectWeight = (index: number) => {
    setSelectedIndex(index);
    setAdded(false);
    setNotifySubmitted(false);
    setNotifyEmail("");
  };

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          variant: selectedWeight?.size,
          email: notifyEmail,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notify request");
      }

      setNotifySubmitted(true);
      setToast("We'll email you when it's back in stock");
    } catch {
      setToast("Something went wrong - please try again");
    }

    setTimeout(() => setToast(null), 3000);
  };

  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount ?? 0;
  const fullStars = Math.round(rating);

  return (
    <div className="min-h-screen bg-[#FBF7F1] py-16 pb-32 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#3D5640] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-[#C18A42] text-xl">✓</span>
          <span className="font-semibold">{toast}</span>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-sm text-[#7A6F65]">
        <Link href="/" className="hover:text-[#C18A42] transition">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:text-[#C18A42] transition">
          Shop
        </Link>{" "}
        / <span className="text-[#2D2A26] font-semibold">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        {/* Image gallery */}
        <div>
          <div className="rounded-3xl shadow-xl overflow-hidden bg-white border border-[#E8DDD1]">
            <img
              src={gallery[activeImage]}
              alt={product.name}
              width={720}
              height={480}
              loading="eager"
              decoding="async"
              className="w-full h-[480px] object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${activeImage === index
                    ? "border-[#C18A42]"
                    : "border-[#E8DDD1] hover:border-[#C18A42]/60"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#3D5640] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
              {product.category}
            </span>
            {product.featured && (
              <span className="bg-[#C18A42] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                Bestseller
              </span>
            )}
          </div>

          <h1
            className="text-5xl font-extrabold mt-6 text-[#2D2A26]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <div className="text-[#C18A42] text-xl tracking-tight">
              {"★".repeat(fullStars)}
              {"☆".repeat(5 - fullStars)}
            </div>
            <span className="text-[#7A6F65] text-base">
              {rating > 0
                ? `${rating.toFixed(1)} (${reviewsCount} ${reviewsCount === 1 ? "Review" : "Reviews"
                })`
                : "No reviews yet"}
            </span>
          </div>

          {/* Short 2-line preview only - full description lives in the Description tab below */}
        {product.shortDescription && (
            <p className="text-[#5A5249] text-base mt-4 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Variant selector */}
          <div className="mt-8">
            <label
              htmlFor="product-weight"
              className="mb-3 block text-lg font-bold text-[#2D2A26]"
            >
              Select Weight
            </label>

            <div className="relative max-w-md">
              <select
                id="product-weight"
                value={selectedIndex}
                onChange={(e) => handleSelectWeight(Number(e.target.value))}
                className="w-full appearance-none rounded-2xl border-2 border-[#E8DDD1] bg-white px-5 py-4 pr-12 text-lg font-bold text-[#2D2A26] shadow-sm outline-none transition focus:border-[#C18A42] focus:ring-4 focus:ring-[#C18A42]/20"
              >
                {displayWeights.map((weight, index) => {
                  const label = weight.size || weight.quantity || weight.weight || "Size";
                  const unavailable = weight.unavailable === true;
                  return (
                    <option key={`${label}-${index}`} value={index} disabled={unavailable}>
                      {unavailable
                        ? `${label} - Not Available`
                        : `${label} - ₹${weight.price}${weight.stock <= 0 ? " - Out of Stock" : ""}`}
                    </option>
                  );
                })}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#4F6B52]"
              >
                ˅
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
              {isUnavailable ? (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-600">
                  Not Available
                </span>
              ) : outOfStock ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
                  Out of Stock
                </span>
              ) : selectedWeight && selectedWeight.stock <= 5 ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
                  Only {selectedWeight.stock} left
                </span>
              ) : (
                <span className="rounded-full bg-[#4F6B52]/10 px-3 py-1 text-[#4F6B52]">
                  In Stock
                </span>
              )}
              {selectedWeight && (
                <span className="text-[#7A6F65]">
                  {selectedWeightLabel} selected
                </span>
              )}
            </div>
          </div>

          {/* Price summary */}
          {selectedWeight && !outOfStock && (
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#2D2A26]">
                ₹{selectedWeight.price}
              </span>
              <span className="text-[#7A6F65]">
                / {selectedWeightLabel}
              </span>
            </div>
          )}

          {outOfStock ? (
            <div className="mt-8 bg-white border border-[#E8DDD1] rounded-2xl p-6">
              <p className="text-[#6B1F1F] font-bold text-lg mb-1">
                {isUnavailable ? "This Size Isn't Offered" : "Currently Out of Stock"}
              </p>
              <p className="text-[#7A6F65] text-sm mb-4">
                {isUnavailable
                  ? "Please choose a different size above."
                  : "Leave your email and we'll let you know the moment it's back."}
              </p>

              {!isUnavailable && (notifySubmitted ? (
                <p className="text-[#4F6B52] font-semibold">
                  ✓ You're on the list - we'll notify you!
                </p>
              ) : (
                <form
                  onSubmit={handleNotify}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 border border-[#E8DDD1] rounded-xl px-4 py-3 text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#C18A42]/40"
                  />
                  <button
                    type="submit"
                    className="bg-[#3D5640] hover:bg-[#2F4533] text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    Notify Me
                  </button>
                </form>
              ))}
            </div>
          ) : (
            // Desktop-only inline buttons. Mobile uses the fixed bottom bar instead.
            <div className="hidden sm:grid grid-cols-3 gap-3 mt-8">

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`py-4 rounded-2xl text-lg font-bold transition shadow-md ${added
                  ? "bg-[#4F6B52] text-white"
                  : "bg-[#1877F2] hover:bg-[#166FE5] text-white"
                  }`}
              >
                {added ? "Go to Cart" : "Add to Cart"}
              </button>

              <Link
                href="/cart"
                className="flex items-center justify-center rounded-2xl border-2 border-[#3D5640] bg-white py-4 text-lg font-bold text-[#3D5640] shadow-md transition hover:bg-[#F3EDE3]"
              >
                Go to Cart
              </Link>

              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="bg-[#3D5640] hover:bg-[#2F4533] text-white py-4 rounded-2xl text-lg font-bold transition shadow-md"
              >
                Buy Now
              </button>

            </div>
          )}
          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                100% Authentic
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">
                Traditional recipes
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                No Preservatives
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">Natural ingredients</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                Fast Delivery
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">
                Across India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}

      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E8DDD1] p-8">

          {/* Tabs */}

          <div className="flex flex-wrap gap-3 mb-8">

            <button
              onClick={() => setActiveTab("specifications")}
              className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "specifications"
                ? "bg-[#3D5640] text-white"
                : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Specifications
            </button>

            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "description"
                ? "bg-[#3D5640] text-white"
                : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("manufacturer")}
              className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "manufacturer"
                ? "bg-[#3D5640] text-white"
                : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Manufacturer Info
            </button>

          </div>

          {/* Specifications Tab */}

          {activeTab === "specifications" && (
            <div>
              <h2
                className="text-3xl font-extrabold text-[#2D2A26] mb-8"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

                <div>
                  <p className="text-sm text-[#7A6F65]">Brand</p>
                  <p className="font-bold text-[#2D2A26]">AchaarYaar</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Type</p>
                  <p className="font-bold text-[#2D2A26]">Pickle</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Base Ingredient</p>
                  <p className="font-bold text-[#2D2A26]">Natural Ingredients</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Shelf Life</p>
                  <p className="font-bold text-[#2D2A26]">18 - 24 Months</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Delivery Time</p>
                  <p className="font-bold text-[#2D2A26]">6 - 8 Days</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Container Type</p>
                  <p className="font-bold text-[#2D2A26]">Glass Jar</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Storage Instructions</p>
                  <p className="font-bold text-[#2D2A26]">
                    Store in a cool & dry place
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Country of Origin</p>
                  <p className="font-bold text-[#2D2A26]">India</p>
                </div>

                <div>
                  <p className="text-sm text-[#7A6F65]">Preservatives</p>
                  <p className="font-bold text-[#2D2A26]">
                    No Artificial Preservatives
                  </p>
                </div>

              </div>
            </div>
          )}
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="bg-[#FFFDF8] rounded-3xl p-10">

              {/* Heading */}
              <h2
                className="text-4xl md:text-5xl font-bold text-[#2D2A26] text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                About {product.name}
              </h2>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center my-8">
                <div className="h-[1px] w-1/3 bg-[#D6C5AE]"></div>

                <span className="mx-4 text-3xl text-[#C18A42]">
                  ~
                </span>

                <div className="h-[1px] w-1/3 bg-[#D6C5AE]"></div>
              </div>

              {/* Description */}
              <div className="max-w-5xl mx-auto">

                <p className="text-[#3B342D] text-xl leading-[3rem] mb-8 font-medium">
                  {product.description}
                </p>

                <div className="space-y-6 text-xl leading-10 text-[#3B342D]">

                  <div>
                    <span
                      className="font-bold text-[#2F5533]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Ingredients :
                    </span>{" "}
                    Main seasonal ingredient, mustard oil, salt, mustard seeds,
                    fennel, fenugreek, turmeric, chilli, hing, and traditional
                    Indian spices, prepared according to the recipe of this jar.
                  </div>

                  <div>
                    <span
                      className="font-bold text-[#2F5533]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Taste / Flavour :
                    </span>{" "}
                    Balanced, aromatic, homestyle, and rooted in Bihar-style
                    achaar traditions.
                  </div>

                  <div>
                    <span
                      className="font-bold text-[#2F5533]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Category :
                    </span>{" "}
                    {product.category || "Pickles & Chutneys"}
                  </div>

                  <div>
                    <span
                      className="font-bold text-[#2F5533]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Shelf Life :
                    </span>{" "}
                    18 - 24 Months
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Manufacturer Tab */}
          {activeTab === "manufacturer" && (
            <div>
              <h2
                className="text-3xl font-extrabold text-[#2D2A26] mb-6"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Manufacturer Info
              </h2>
              <p className="text-[#5A5249] text-lg leading-8">
                Manufactured and packaged by AchaarYaar, Siwan, Bihar. For any
                queries regarding this product, please reach out via our
                Contact page.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}