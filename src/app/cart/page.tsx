"use client";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type StockInfo = {
  size: string;
  stock: number;
};

export default function CartPage() {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );
  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  // Live stock per product, fetched fresh every time the cart page loads.
  // Keyed by product _id -> array of { size, stock } from that product's
  // current weights variants.
  const [stockMap, setStockMap] = useState<Record<string, StockInfo[]>>({});
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setStockLoading(false);
      return;
    }

    const uniqueIds = Array.from(new Set(items.map((item) => item._id)));

    const fetchStock = async () => {
      setStockLoading(true);
      try {
        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            return { id, weights: data.success ? data.product.weights : [] };
          })
        );

        const map: Record<string, StockInfo[]> = {};
        for (const result of results) {
          map[result.id] = result.weights;
        }
        setStockMap(map);
      } catch (error) {
        console.error("Failed to fetch live stock:", error);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStock();
  }, [items.length]); // re-check whenever items are added/removed

  // Returns true if this cart item's quantity now exceeds available stock
  // (or the variant/product no longer exists at all).
  function isOutOfStock(item: { _id: string; selectedVariant: string; quantity: number }) {
    const variants = stockMap[item._id];
    if (!variants) return false; // still loading, or fetch failed — don't block

    const variant = variants.find((v) => v.size === item.selectedVariant);
    if (!variant) return true; // variant no longer exists

    return variant.stock < item.quantity;
  }

  const anyOutOfStock = items.some(isOutOfStock);

  const subtotal = items.reduce((total, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : parseInt(String(item.price).match(/\d+/)?.[0] || "0", 10);

    return total + price * item.quantity;
  }, 0);

  const shipping = items.length > 0 ? 50 : 0;
  const couponMap: Record<string, number> = {
    WELCOME10: 10,
    BIHAR10: 10,
  };
  const discountPercent = appliedCoupon ? couponMap[appliedCoupon] || 0 : 0;
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount + shipping);

  useEffect(() => {
    const savedCoupon = localStorage.getItem("achaaryaar_coupon") || "";
    if (couponMap[savedCoupon]) {
      setAppliedCoupon(savedCoupon);
      setCouponInput(savedCoupon);
    }
  }, []);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponMessage("Enter a coupon code.");
      return;
    }

    if (!couponMap[code]) {
      setCouponMessage("Coupon not valid.");
      setAppliedCoupon("");
      localStorage.removeItem("achaaryaar_coupon");
      return;
    }

    setAppliedCoupon(code);
    localStorage.setItem("achaaryaar_coupon", code);
    setCouponMessage(`${code} applied. You saved ${couponMap[code]}%.`);
  }

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponMessage("Coupon removed.");
    localStorage.removeItem("achaaryaar_coupon");
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] p-10">
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-5xl font-extrabold text-[#2D2A26] mb-8"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DDD1] p-8 text-center">
            <p className="text-xl text-[#7A6F65]">
              Your cart is currently empty.
            </p>
            <Link
              href="/products"
              className="inline-block mt-4 bg-[#C18A42] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#A8742F] transition"
            >
              Browse Pickles →
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-6">
              {items.map((item) => {
                const outOfStock = isOutOfStock(item);

                return (
                  <div
                    key={`${item.name}-${item.selectedVariant}`}
                    className={`bg-white rounded-2xl p-6 shadow-xl border ${
                      outOfStock ? "border-[#6B1F1F]" : "border-[#E8DDD1]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2
                            className="text-2xl font-bold text-[#2D2A26]"
                            style={{ fontFamily: FONT_DISPLAY }}
                          >
                            {item.name}
                          </h2>

                          {outOfStock && (
                            <span className="text-xs font-bold uppercase tracking-wide bg-[#6B1F1F] text-white px-3 py-1 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <p className="text-[#C18A42] font-semibold mt-2">
                          {typeof item.price === "number" ? `₹${item.price}` : item.price}
                        </p>
                        <p className="text-[#7A6F65]">
                          Variant: {item.selectedVariant}
                        </p>

                        {outOfStock && (
                          <p className="text-sm text-[#6B1F1F] font-medium mt-1">
                            This item is no longer available in the quantity you selected. Please remove it or reduce the quantity.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.name, item.selectedVariant)
                        }
                        className="bg-[#6B1F1F] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#561818] transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.name,
                            item.selectedVariant
                          )
                        }
                        className="bg-[#E8DDD1] text-[#2D2A26] w-8 h-8 rounded-lg font-bold hover:bg-[#DBCDBC] transition"
                      >
                        -
                      </button>

                      <span className="text-lg font-bold min-w-[30px] text-center text-[#2D2A26]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.name,
                            item.selectedVariant
                          )
                        }
                        disabled={outOfStock}
                        className="bg-[#4F6B52] text-white w-8 h-8 rounded-lg font-bold hover:bg-[#3F5A43] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-10 bg-[#3D5640] rounded-2xl shadow-2xl p-8 text-white">
              <h2
                className="text-3xl font-extrabold text-white mb-6"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Order Summary
              </h2>

              <div className="space-y-5 text-lg text-white">
                <div className="flex justify-between">
                  <span className="text-white/80">Subtotal</span>
                  <span className="font-bold">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/80">Shipping</span>
                  <span className="font-bold">
                    ₹{shipping}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/80">
                    Coupon Code
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="WELCOME10"
                      className="flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 font-semibold uppercase text-[#2D2A26] outline-none"
                    />
                    <button
                      type="button"
                      onClick={appliedCoupon ? removeCoupon : applyCoupon}
                      className={`rounded-xl px-5 py-3 font-bold text-white transition ${
                        appliedCoupon
                          ? "bg-[#6B1F1F] hover:bg-[#561818]"
                          : "bg-[#C18A42] hover:bg-[#A8742F]"
                      }`}
                    >
                      {appliedCoupon ? "Remove" : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className="mt-2 text-sm text-white/80">{couponMessage}</p>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Coupon Discount</span>
                    <span className="font-bold text-[#D9A85F]">
                      -₹{discount}
                    </span>
                  </div>
                )}

                <hr className="border-white/15" />

                <div className="flex justify-between text-3xl font-extrabold text-[#C18A42]">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                {anyOutOfStock && (
                  <p className="text-center text-sm font-semibold text-[#D9A85F] bg-white/10 rounded-xl p-3">
                    Please remove or adjust out-of-stock items before checking out.
                  </p>
                )}

                {anyOutOfStock || stockLoading ? (
                  <button
                    disabled
                    className="block w-full mt-4 bg-white/20 text-white/60 py-4 rounded-xl font-bold text-center cursor-not-allowed"
                  >
                    {stockLoading ? "Checking stock..." : "Resolve stock issues to continue"}
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="block w-full mt-4 bg-[#C18A42] text-white py-4 rounded-xl font-bold text-center hover:bg-[#A8742F] transition"
                  >
                    Proceed to Checkout
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}