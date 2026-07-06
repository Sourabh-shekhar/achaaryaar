"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { baseUrl } from "@/lib/baseUrl";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type Weight = {
  size?: string;
  quantity?: string;
  weight?: string;
  price: number;
  stock: number;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  weights: Weight[];
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("specifications");
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const [activeImage, setActiveImage] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const selectedWeight = product.weights?.[selectedIndex];
  const selectedWeightLabel =
    selectedWeight?.size || selectedWeight?.quantity || selectedWeight?.weight || "Size";
  const outOfStock = !selectedWeight || selectedWeight.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedWeight || outOfStock) return;

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant: selectedWeightLabel,
      },
      quantity
    );

    setAdded(true);
    setToast(`${quantity} x ${product.name} (${selectedWeightLabel}) added to cart`);
    setTimeout(() => setAdded(false), 1800);
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
      quantity
    );

    window.location.href = "/checkout";
  };

  const handleSelectWeight = (index: number) => {
    setSelectedIndex(index);
    setQuantity(1);
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
      setToast("Something went wrong — please try again");
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

          <p className="text-[#5A5249] text-lg leading-8 mt-6">
            {product.description}
          </p>

          {/* Variant selector */}
          <div className="mt-8">
            <h3 className="font-bold text-[#2D2A26] mb-3 text-lg">
              Select Weight
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {product.weights?.map((weight, index) => {
                const isSelected = index === selectedIndex;
                const isOut = weight.stock <= 0;

                return (
                  <button
                    key={`${weight.size || weight.quantity || weight.weight || "size"}-${index}`}
                    disabled={isOut}
                    onClick={() => handleSelectWeight(index)}
                    className={`border-2 p-4 rounded-2xl text-left transition shadow-sm ${isOut
                      ? "border-[#E8DDD1] bg-[#F3EEE6] opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-[#C18A42] bg-white ring-2 ring-[#C18A42]/30"
                        : "border-[#E8DDD1] bg-white hover:border-[#C18A42]/60"
                      }`}
                  >
                    <p className="font-bold text-lg text-[#2D2A26]">
                      {weight.size || weight.quantity || weight.weight || "Size"}
                    </p>
                    {!isOut && (
                      <p className="text-[#C18A42] font-bold mt-1">
                        ₹{weight.price}
                      </p>
                    )}
                    {isOut ? (
                      <p className="text-[#6B1F1F] text-xs mt-1 font-semibold">
                        Out of stock
                      </p>
                    ) : weight.stock <= 5 ? (
                      <p className="text-[#6B1F1F] text-xs mt-1 font-semibold">
                        Only {weight.stock} left
                      </p>
                    ) : (
                      <p className="text-[#4F6B52] text-xs mt-1 font-semibold">
                        In Stock
                      </p>
                    )}
                  </button>
                );
              })}
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

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-6">
              <h3 className="font-bold text-[#2D2A26] mb-3 text-lg">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="bg-[#E8DDD1] text-[#2D2A26] w-10 h-10 rounded-lg font-bold hover:bg-[#DBCDBC] transition text-lg"
                >
                  −
                </button>
                <span className="text-xl font-bold min-w-[36px] text-center text-[#2D2A26]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      selectedWeight
                        ? Math.min(selectedWeight.stock, q + 1)
                        : q + 1
                    )
                  }
                  className="bg-[#4F6B52] text-white w-10 h-10 rounded-lg font-bold hover:bg-[#3F5A43] transition text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {outOfStock ? (
            <div className="mt-8 bg-white border border-[#E8DDD1] rounded-2xl p-6">
              <p className="text-[#6B1F1F] font-bold text-lg mb-1">
                Currently Out of Stock
              </p>
              <p className="text-[#7A6F65] text-sm mb-4">
                Leave your email and we'll let you know the moment it's
                back.
              </p>

              {notifySubmitted ? (
                <p className="text-[#4F6B52] font-semibold">
                  ✓ You're on the list — we'll notify you!
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
              )}
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
                {added ? "Added ✓" : "Add to Cart"}
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
                  ❦
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

                  <div>
                    <span
                      className="font-bold text-[#2F5533]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Delivery Time :
                    </span>{" "}
                    6 - 8 Days Across India
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Manufacturer Tab */}
          {activeTab === "manufacturer" && (
            <div className="bg-white rounded-3xl border border-[#E8DDD1] p-10 shadow-md">

              <h2
                className="text-4xl font-bold text-[#2D2A26] mb-10"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Manufacturer Information
              </h2>

              <div className="grid md:grid-cols-2 gap-8">

                {/* Manufacturer */}
                <div className="bg-[#FBF7F1] p-6 rounded-2xl border border-[#E8DDD1]">
                  <p className="text-sm uppercase tracking-widest text-[#A8742F] mb-2">
                    Manufacturer
                  </p>

                  <p className="text-2xl font-bold text-[#2D2A26]">
                    AchaarYaar Foods
                  </p>
                </div>

                {/* Packed By */}
                <div className="bg-[#FBF7F1] p-6 rounded-2xl border border-[#E8DDD1]">
                  <p className="text-sm uppercase tracking-widest text-[#A8742F] mb-2">
                    Packed By
                  </p>

                  <p className="text-2xl font-bold text-[#2D2A26]">
                    AchaarYaar Foods
                  </p>
                </div>

                {/* Address */}
                <div className="md:col-span-2 bg-[#FBF7F1] p-6 rounded-2xl border border-[#E8DDD1]">
                  <p className="text-sm uppercase tracking-widest text-[#A8742F] mb-2">
                    Address
                  </p>

                  <p className="text-lg font-semibold text-[#2D2A26] leading-8">
                    Kanti Kunj, Tarwara More <br />
                    Siwan, Bihar - 841226
                  </p>
                </div>

                {/* Customer Care */}
                <div className="bg-[#FBF7F1] p-6 rounded-2xl border border-[#E8DDD1]">
                  <p className="text-sm uppercase tracking-widest text-[#A8742F] mb-2">
                    Customer Care
                  </p>

                  <p className="text-lg font-semibold text-[#2D2A26]">
                    support@achaaryaar.com
                  </p>
                </div>

                {/* Country */}
                <div className="bg-[#FBF7F1] p-6 rounded-2xl border border-[#E8DDD1]">
                  <p className="text-sm uppercase tracking-widest text-[#A8742F] mb-2">
                    Country of Origin
                  </p>

                  <p className="text-lg font-semibold text-[#2D2A26]">
                    India
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <h2
            className="text-4xl font-extrabold mb-10 text-center text-[#2D2A26]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            You May Also Like
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/products/${item._id}`}
                className="block bg-white rounded-3xl shadow-lg overflow-hidden border border-[#E8DDD1] hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-64 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2D2A26]">
                    {item.name}
                  </h3>

                  <p className="text-[#C18A42] font-bold text-lg mt-2">
                    ₹{item.weights?.[0]?.price ?? "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Cart Bar — Flipkart-style: Add to Cart | Buy at ₹price, side by side */}
      {!outOfStock && selectedWeight && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8DDD1] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center py-4 rounded-xl font-bold text-base border-2 transition ${added
                ? "border-[#4F6B52] bg-[#4F6B52] text-white"
                : "border-[#2D2A26] bg-white text-[#2D2A26] hover:bg-[#F3EDE3]"
                }`}
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center py-4 rounded-xl font-extrabold text-base bg-[#F5C518] hover:bg-[#E6B60F] text-[#2D2A26] transition"
            >
              Buy at ₹{selectedWeight.price}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}