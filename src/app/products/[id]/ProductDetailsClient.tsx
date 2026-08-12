"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
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
  isCombo?: boolean;
  comboSize?: number;
  comboUnitWeight?: string;
  comboPrice?: number;
  comboStock?: number;
  comboVariants?: { unitWeight: string; price: number; stock: number }[];
};

const STANDARD_SIZES = ["120g", "220g", "330g", "430g"];

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

  // Combo packs have one fixed, clearly-labelled option. Regular products
  // show only the sizes that are actually configured by the admin.
  const isCombo =
    product.isCombo === true ||
    product.category?.toLowerCase().includes("combo") ||
    product._id.startsWith("combo-");

  const displayWeights: Weight[] = isCombo
    ? (product.comboVariants && product.comboVariants.length > 0
      ? product.comboVariants.map((v) => ({
        size: `${v.unitWeight} × ${product.comboSize || 2} jars`,
        price: Number(v.price || 0),
        stock: Number(v.stock || 0),
      }))
      : [{
        size: product.comboUnitWeight && product.comboSize
          ? `${product.comboUnitWeight} × ${product.comboSize} jars`
          : `${product.comboSize || 2}-Pack Combo`,
        price: Number(product.comboPrice || 0),
        stock: Number(product.comboStock || 0),
      }])
    : (product.weights || []).filter((weight) => {
      const size = weight.size || weight.quantity || weight.weight;
      return STANDARD_SIZES.includes(size || "") && Number(weight.price) > 0;
    });

  const [activeImage, setActiveImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImageModalOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  // --- Swipe navigation for the main product image (mobile-style, no buttons) ---
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const SWIPE_THRESHOLD = 40; // px — minimum drag distance to count as a swipe

  const goToImage = (index: number) => {
    if (gallery.length === 0) return;
    const clamped = Math.max(0, Math.min(gallery.length - 1, index));
    setActiveImage(clamped);
  };
  const openImageModal = (index = activeImage) => {
    setModalImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const goToModalImage = (index: number) => {
    if (gallery.length === 0) return;

    const newIndex =
      (index + gallery.length) % gallery.length;

    setModalImageIndex(newIndex);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
      // swiped left -> next image
      goToImage(activeImage + 1);
    } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
      // swiped right -> previous image
      goToImage(activeImage - 1);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Mouse-drag equivalent so swipe also works with a trackpad/mouse on desktop
  const mouseStartX = useRef<number | null>(null);
  const mouseDeltaX = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseDeltaX.current = 0;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    mouseDeltaX.current = e.clientX - mouseStartX.current;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    if (mouseDeltaX.current <= -SWIPE_THRESHOLD) {
      goToImage(activeImage + 1);
    } else if (mouseDeltaX.current >= SWIPE_THRESHOLD) {
      goToImage(activeImage - 1);
    }
    isDragging.current = false;
    mouseStartX.current = null;
    mouseDeltaX.current = 0;
  };

  const selectedWeight = displayWeights[selectedIndex];
  const selectedWeightLabel =
    selectedWeight?.size || selectedWeight?.quantity || selectedWeight?.weight || "Size";
  const selectedStock = Number(selectedWeight?.stock || 0);
  const outOfStock = !selectedWeight || selectedStock <= 0;

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
      {isImageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full-screen ${product.name} gallery`}
          className="fixed inset-0 z-[9999] bg-black"
        >
          {/* Top controls */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
            <button
              type="button"
              aria-label="Close image gallery"
              onClick={closeImageModal}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl font-light text-white backdrop-blur-md transition hover:bg-white/25"
            >
              ×
            </button>

            {gallery.length > 1 && (
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                {modalImageIndex + 1} / {gallery.length}
              </span>
            )}
          </div>

          {/* Fullscreen image */}
          <div
            className="flex h-full w-full items-center justify-center px-3 py-20 sm:px-16"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              touchDeltaX.current = 0;
            }}
            onTouchMove={(e) => {
              if (touchStartX.current === null) return;
              touchDeltaX.current =
                e.touches[0].clientX - touchStartX.current;
            }}
            onTouchEnd={() => {
              if (touchStartX.current === null) return;

              if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
                goToModalImage(modalImageIndex + 1);
              } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
                goToModalImage(modalImageIndex - 1);
              }

              touchStartX.current = null;
              touchDeltaX.current = 0;
            }}
          >
            <Image
              src={gallery[modalImageIndex]}
              alt={`${product.name} full-size photo ${modalImageIndex + 1}`}
              width={2000}
              height={2000}
              sizes="100vw"
              priority
              className="h-full w-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Previous button - desktop */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goToModalImage(modalImageIndex - 1)}
                className="hidden sm:flex absolute left-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white backdrop-blur-md transition hover:bg-white/25"
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Next image"
                onClick={() => goToModalImage(modalImageIndex + 1)}
                className="hidden sm:flex absolute right-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white backdrop-blur-md transition hover:bg-white/25"
              >
                ›
              </button>
            </>
          )}

          {/* Bottom thumbnails */}
          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 gap-3 overflow-x-auto rounded-2xl bg-black/30 p-2 backdrop-blur-md">
              {gallery.map((img, index) => (
                <button
                  key={`modal-${img}-${index}`}
                  type="button"
                  onClick={() => setModalImageIndex(index)}
                  className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${modalImageIndex === index
                      ? "border-white"
                      : "border-white/30 opacity-70 hover:opacity-100"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Mobile Sticky Cart Bar — Flipkart-style: Add to Cart | Buy at ₹price */}
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
              {added ? "Go to Cart" : "Add to cart"}
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
          <div
            className="relative rounded-3xl shadow-xl overflow-hidden bg-white border border-[#E8DDD1] select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onClick={() => openImageModal(activeImage)}
            role="button"
            tabIndex={0}
            aria-label="Open full-size product photo"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openImageModal(activeImage);
              }
            }}
          >
            <div className="relative flex w-full items-center justify-center bg-white h-[320px] sm:h-[420px] md:h-[480px]">
              <Image
                src={gallery[activeImage]}
                alt={product.name}
                width={1200}
                height={1200}
                priority
                draggable={false}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-contain pointer-events-none"
              />
            </div>

            <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white">
              Click to enlarge
            </span>

            {/* Non-interactive page counter — just feedback, not a control */}
            {gallery.length > 1 && (
              <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                {activeImage + 1} / {gallery.length}
              </span>
            )}
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
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
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
                  return (
                    <option key={`${label}-${index}`} value={index}>
                      {`${label} - ₹${weight.price}${weight.stock <= 0 ? " - Out of Stock" : ""}`}
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
              {outOfStock ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
                  Out of Stock
                </span>
              ) : selectedWeight && selectedStock <= 5 ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
                  Only {selectedStock} left
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
                Currently Out of Stock
              </p>
              <p className="text-[#7A6F65] text-sm mb-4">
                Leave your email and we'll let you know the moment it's back.
              </p>

              {notifySubmitted ? (
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
              )}
            </div>
          ) : (
            // Desktop-only inline buttons. Mobile uses the fixed bottom bar instead.
            <div className="hidden sm:grid grid-cols-2 gap-3 mt-8">

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E8DDD1] p-4 sm:p-8">

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
            <div className="bg-[#FFFDF8] rounded-2xl sm:rounded-3xl p-5 sm:p-10">

              {/* Heading */}
              <h2
                className="mx-auto max-w-4xl text-3xl leading-tight sm:text-4xl md:text-5xl font-bold text-[#2D2A26] text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                About {product.name}
              </h2>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center my-6 sm:my-8">
                <div className="h-[1px] flex-1 bg-[#D6C5AE]"></div>

                <span className="mx-3 sm:mx-4 text-2xl sm:text-3xl text-[#C18A42]">
                  ~
                </span>

                <div className="h-[1px] flex-1 bg-[#D6C5AE]"></div>
              </div>

              {/* Description */}
              <div className="max-w-5xl mx-auto">

                <p className="text-[#3B342D] text-[15px] leading-7 sm:text-lg sm:leading-8 md:text-xl md:leading-10 mb-7 sm:mb-8 font-medium whitespace-pre-line break-words">
                  {product.description}
                </p>

                <div className="space-y-5 sm:space-y-6 text-[15px] leading-7 sm:text-lg sm:leading-8 md:text-xl md:leading-10 text-[#3B342D]">

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
                className="text-3xl font-extrabold text-[#2D2A26] mb-8"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Manufacturer Info
              </h2>

              <div className="divide-y divide-[#E8DDD1] border-t border-b border-[#E8DDD1]">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                  <p className="text-sm font-semibold text-[#7A6F65]">
                    Manufacturer Name &amp; Address
                  </p>
                  <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                    Arkvon Group , Siwan, Bihar, India
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                  <p className="text-sm font-semibold text-[#7A6F65]">
                    Packer Name &amp; Address
                  </p>
                  <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                    AchaarYaar , Siwan, Bihar, India
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                  <p className="text-sm font-semibold text-[#7A6F65]">
                    Importer Name &amp; Address
                  </p>
                  <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                    Not Applicable
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                  <p className="text-sm font-semibold text-[#7A6F65]">
                    Country of Origin
                  </p>
                  <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                    India
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                  <p className="text-sm font-semibold text-[#7A6F65]">
                    Customer Care
                  </p>
                  <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                    For any queries regarding this product, please reach out
                    via our Contact page.
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
