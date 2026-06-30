"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type Weight = {
  size: string;
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

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const [activeImage, setActiveImage] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const selectedWeight = product.weights?.[selectedIndex];
  const outOfStock = !selectedWeight || selectedWeight.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedWeight || outOfStock) return;

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant: selectedWeight.size,
      },
      quantity
    );

    setAdded(true);
    setToast(`${quantity} × ${product.name} (${selectedWeight.size}) added to cart`);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(() => setToast(null), 3000);
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
    <div className="min-h-screen bg-[#FBF7F1] py-16 relative">
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
        <Link href="/shop" className="hover:text-[#C18A42] transition">
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
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    activeImage === index
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
                ? `${rating.toFixed(1)} (${reviewsCount} ${
                    reviewsCount === 1 ? "Review" : "Reviews"
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
                    key={`${weight.size}-${index}`}
                    disabled={isOut}
                    onClick={() => handleSelectWeight(index)}
                    className={`border-2 p-4 rounded-2xl text-left transition shadow-sm ${
                      isOut
                        ? "border-[#E8DDD1] bg-[#F3EEE6] opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-[#C18A42] bg-white ring-2 ring-[#C18A42]/30"
                        : "border-[#E8DDD1] bg-white hover:border-[#C18A42]/60"
                    }`}
                  >
                    <p className="font-bold text-lg text-[#2D2A26]">
                      {weight.size}
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
                / {selectedWeight.size}
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
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`w-full mt-8 py-4 rounded-2xl text-xl font-bold transition shadow-md ${
                added
                  ? "bg-[#4F6B52] text-white"
                  : "bg-[#C18A42] hover:bg-[#A8742F] text-white"
              }`}
            >
              {added ? "Added to Cart ✓" : "Add to Cart"}
            </button>
          )}

          <Link
            href="/cart"
            className="block text-center mt-4 text-[#3D5640] font-semibold hover:text-[#C18A42] transition"
          >
            View Cart →
          </Link>

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

      {/* About this product */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E8DDD1] p-10">
          <h2
            className="text-3xl font-extrabold text-[#2D2A26] mb-6"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            About {product.name}
          </h2>
          <p className="text-[#5A5249] text-lg leading-8">
            {product.description}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div>
              <h4 className="font-bold text-[#2D2A26] mb-2">
                Made the Traditional Way
              </h4>
              <p className="text-[#7A6F65] text-sm leading-6">
                Prepared using time-tested recipes with fresh, hand-picked
                ingredients for an authentic, homemade taste.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#2D2A26] mb-2">
                Quality You Can Trust
              </h4>
              <p className="text-[#7A6F65] text-sm leading-6">
                No artificial colours or chemicals — just clean, carefully
                sourced ingredients packed with care.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#2D2A26] mb-2">
                Perfect Pairing
              </h4>
              <p className="text-[#7A6F65] text-sm leading-6">
                Enjoy with rice, roti, paratha, curd rice, or your favourite
                snacks for an extra burst of flavour.
              </p>
            </div>
          </div>
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
    </div>
  );
}