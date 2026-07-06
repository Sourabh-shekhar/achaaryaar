"use client";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

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
    ACHAAR15: 15,
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
      setCouponMessage("Coupon not valid. Try WELCOME10, BIHAR10, or ACHAAR15.");
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
              {items.map((item) => (
                <div
                  key={`${item.name}-${item.selectedVariant}`}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-[#E8DDD1]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2
                        className="text-2xl font-bold text-[#2D2A26]"
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {item.name}
                      </h2>

                      <p className="text-[#C18A42] font-semibold mt-2">
                        {typeof item.price === "number" ? `₹${item.price}` : item.price}
                      </p>
                      <p className="text-[#7A6F65]">
                        Variant: {item.selectedVariant}
                      </p>
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
                      className="bg-[#4F6B52] text-white w-8 h-8 rounded-lg font-bold hover:bg-[#3F5A43] transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
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
                      onClick={applyCoupon}
                      className="rounded-xl bg-[#C18A42] px-5 py-3 font-bold text-white transition hover:bg-[#A8742F]"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="mt-2 text-sm font-bold text-[#D9A85F]"
                    >
                      Remove {appliedCoupon}
                    </button>
                  )}
                  {couponMessage && (
                    <p className="mt-2 text-sm text-white/80">{couponMessage}</p>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Coupon Discount</span>
                    <span className="font-bold text-[#D9A85F]">
                      -Rs. {discount}
                    </span>
                  </div>
                )}

                <hr className="border-white/15" />

                <div className="flex justify-between text-3xl font-extrabold text-[#C18A42]">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Link href="/checkout"
                  className="block w-full mt-4 bg-[#C18A42] text-white py-4 rounded-xl font-bold text-center hover:bg-[#A8742F] transition">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
