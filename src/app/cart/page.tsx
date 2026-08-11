"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type StockInfo = {
  size: string;
  stock: number;
};

type CouponInfo = {
  code: string;
  percent: number;
  firstOrderOnly?: boolean;
};

export default function CartPage() {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const items = useCartStore((state) => state.items);

  const removeItem = useCartStore((state) => state.removeItem);

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  // --------------------------------------------------
  // LIVE STOCK
  // --------------------------------------------------

  const [stockMap, setStockMap] = useState<
    Record<string, StockInfo[]>
  >({});

  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setStockLoading(false);
      return;
    }

    const uniqueIds = Array.from(
      new Set(items.map((item) => item._id))
    );

    const fetchStock = async () => {
      setStockLoading(true);

      try {
        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const res = await fetch(`/api/products/${id}`, {
                cache: "no-store",
              });

              const data = await res.json();

              return {
                id,
                weights: data.success
                  ? data.product?.weights || []
                  : [],
              };
            } catch (error) {
              console.error(
                `Failed to fetch stock for ${id}:`,
                error
              );

              return {
                id,
                weights: [],
              };
            }
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
  }, [items.length]);

  // --------------------------------------------------
  // STOCK CHECK
  // --------------------------------------------------

  function isOutOfStock(item: {
    _id: string;
    selectedVariant?: string;
    quantity: number;
  }) {
    const variants = stockMap[item._id];

    // Product is still being checked.
    if (!variants) {
      return false;
    }

    const variant = variants.find(
      (v) => v.size === item.selectedVariant
    );

    // Variant no longer exists.
    if (!variant) {
      return true;
    }

    return variant.stock < item.quantity;
  }

  const anyOutOfStock = items.some(isOutOfStock);

  // --------------------------------------------------
  // SUBTOTAL
  // --------------------------------------------------

  const subtotal = items.reduce((total, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : parseInt(
            String(item.price).match(/\d+/)?.[0] || "0",
            10
          );

    return total + price * item.quantity;
  }, 0);

  // --------------------------------------------------
  // SHIPPING
  // --------------------------------------------------

  // Same rule used by checkout/payment API:
  // ₹50 below ₹499
  // FREE at ₹499+
  const shipping =
    items.length === 0
      ? 0
      : subtotal >= 499
      ? 0
      : 50;

  // --------------------------------------------------
  // DISCOUNT
  // --------------------------------------------------

  const discount =
    appliedCoupon && couponPercent > 0
      ? Math.round((subtotal * couponPercent) / 100)
      : 0;

  const total = Math.max(
    0,
    subtotal - discount + shipping
  );

  // --------------------------------------------------
  // RESTORE SAVED COUPON
  // --------------------------------------------------

  useEffect(() => {
    const savedCoupon =
      localStorage.getItem("achaaryaar_coupon") || "";

    if (!savedCoupon) {
      return;
    }

    const validateSavedCoupon = async () => {
      try {
        const response = await fetch("/api/coupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: savedCoupon,
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (
          response.ok &&
          data.success &&
          data.coupon
        ) {
          setAppliedCoupon(data.coupon.code);
          setCouponInput(data.coupon.code);
          setCouponPercent(
            Number(data.coupon.percent) || 0
          );

          setCouponMessage(
            `${data.coupon.code} applied. You saved ${data.coupon.percent}%.`
          );
        } else {
          localStorage.removeItem(
            "achaaryaar_coupon"
          );

          setAppliedCoupon("");
          setCouponInput("");
          setCouponPercent(0);
        }
      } catch (error) {
        console.error(
          "Saved coupon validation error:",
          error
        );

        localStorage.removeItem(
          "achaaryaar_coupon"
        );

        setAppliedCoupon("");
        setCouponInput("");
        setCouponPercent(0);
      }
    };

    validateSavedCoupon();
  }, []);

  // --------------------------------------------------
  // APPLY COUPON
  // --------------------------------------------------

  async function applyCoupon() {
    const code = couponInput
      .trim()
      .toUpperCase();

    if (!code) {
      setCouponMessage(
        "Please enter a coupon code."
      );
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.coupon
      ) {
        setAppliedCoupon("");
        setCouponPercent(0);

        localStorage.removeItem(
          "achaaryaar_coupon"
        );

        setCouponMessage(
          data.message ||
            "Coupon is invalid or inactive."
        );

        return;
      }

      const coupon: CouponInfo = data.coupon;

      setAppliedCoupon(coupon.code);
      setCouponInput(coupon.code);
      setCouponPercent(
        Number(coupon.percent) || 0
      );

      localStorage.setItem(
        "achaaryaar_coupon",
        coupon.code
      );

      setCouponMessage(
        `${coupon.code} applied. You saved ${coupon.percent}%.`
      );
    } catch (error) {
      console.error(
        "Coupon application error:",
        error
      );

      setAppliedCoupon("");
      setCouponPercent(0);

      localStorage.removeItem(
        "achaaryaar_coupon"
      );

      setCouponMessage(
        "Unable to validate coupon. Please try again."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  // --------------------------------------------------
  // REMOVE COUPON
  // --------------------------------------------------

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponPercent(0);

    localStorage.removeItem(
      "achaaryaar_coupon"
    );

    setCouponMessage("Coupon removed.");
  }

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] p-10">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-5xl font-extrabold text-[#2D2A26] mb-8"
            style={{
              fontFamily: FONT_DISPLAY,
            }}
          >
            Shopping Cart
          </h1>

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
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FBF7F1] p-10">
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-5xl font-extrabold text-[#2D2A26] mb-8"
          style={{
            fontFamily: FONT_DISPLAY,
          }}
        >
          Shopping Cart
        </h1>

        {/* ------------------------------------------ */}
        {/* CART ITEMS */}
        {/* ------------------------------------------ */}

        <div className="space-y-6">
          {items.map((item) => {
            const outOfStock = isOutOfStock(item);

            return (
              <div
                key={`${item._id}-${item.name}-${item.selectedVariant}`}
                className={`bg-white rounded-2xl p-6 shadow-xl border ${
                  outOfStock
                    ? "border-[#6B1F1F]"
                    : "border-[#E8DDD1]"
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2
                        className="text-2xl font-bold text-[#2D2A26]"
                        style={{
                          fontFamily: FONT_DISPLAY,
                        }}
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
                      {typeof item.price === "number"
                        ? `₹${item.price}`
                        : item.price}
                    </p>

                    <p className="text-[#7A6F65]">
                      Variant:{" "}
                      {item.selectedVariant ||
                        "Standard"}
                    </p>

                    {outOfStock && (
                      <p className="text-sm text-[#6B1F1F] font-medium mt-1">
                        This item is no longer
                        available in the quantity
                        you selected. Please
                        remove it or reduce the
                        quantity.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        item.name,
                        item.selectedVariant
                      )
                    }
                    className="bg-[#6B1F1F] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#561818] transition"
                  >
                    Remove
                  </button>
                </div>

                {/* Quantity */}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
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

                  <span className="text-lg font-bold min-w-7.5 text-center text-[#2D2A26]">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
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

        {/* ------------------------------------------ */}
        {/* ORDER SUMMARY */}
        {/* ------------------------------------------ */}

        <div className="mt-10 bg-[#3D5640] rounded-2xl shadow-2xl p-8 text-white">
          <h2
            className="text-3xl font-extrabold text-white mb-6"
            style={{
              fontFamily: FONT_DISPLAY,
            }}
          >
            Order Summary
          </h2>

          <div className="space-y-5 text-lg text-white">
            {/* Subtotal */}

            <div className="flex justify-between">
              <span className="text-white/80">
                Subtotal
              </span>

              <span className="font-bold">
                ₹{subtotal}
              </span>
            </div>

            {/* Shipping */}

            <div className="flex justify-between">
              <span className="text-white/80">
                Shipping
              </span>

              <span className="font-bold">
                {shipping === 0
                  ? "Free"
                  : `₹${shipping}`}
              </span>
            </div>

            {/* Free delivery message */}

            {subtotal > 0 && subtotal < 499 && (
              <p className="text-sm text-white/70 -mt-2">
                Add ₹{499 - subtotal} more to
                get free delivery.
              </p>
            )}

            {/* -------------------------------------- */}
            {/* COUPON */}
            {/* -------------------------------------- */}

            <div className="rounded-2xl bg-white/10 p-4">
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/80">
                Coupon Code
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={couponInput}
                  onChange={(e) =>
                    setCouponInput(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (!appliedCoupon) {
                        applyCoupon();
                      }
                    }
                  }}
                  placeholder="WELCOME10"
                  disabled={couponLoading}
                  className="flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 font-semibold uppercase text-[#2D2A26] outline-none disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={
                    appliedCoupon
                      ? removeCoupon
                      : applyCoupon
                  }
                  disabled={couponLoading}
                  className={`rounded-xl px-5 py-3 font-bold text-white transition disabled:opacity-50 ${
                    appliedCoupon
                      ? "bg-[#6B1F1F] hover:bg-[#561818]"
                      : "bg-[#C18A42] hover:bg-[#A8742F]"
                  }`}
                >
                  {couponLoading
                    ? "Checking..."
                    : appliedCoupon
                    ? "Remove"
                    : "Apply"}
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`mt-2 text-sm ${
                    appliedCoupon
                      ? "text-[#D9A85F]"
                      : "text-white/80"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Discount */}

            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-white/80">
                  Coupon Discount
                </span>

                <span className="font-bold text-[#D9A85F]">
                  -₹{discount}
                </span>
              </div>
            )}

            {/* Divider */}

            <hr className="border-white/15" />

            {/* Total */}

            <div className="flex justify-between text-3xl font-extrabold text-[#C18A42]">
              <span>Total</span>

              <span>₹{total}</span>
            </div>

            {/* Stock warning */}

            {anyOutOfStock && (
              <p className="text-center text-sm font-semibold text-[#D9A85F] bg-white/10 rounded-xl p-3">
                Please remove or adjust out-of-stock
                items before checking out.
              </p>
            )}

            {/* -------------------------------------- */}
            {/* CHECKOUT BUTTON */}
            {/* -------------------------------------- */}

            {anyOutOfStock || stockLoading ? (
              <button
                type="button"
                disabled
                className="block w-full mt-4 bg-white/20 text-white/60 py-4 rounded-xl font-bold text-center cursor-not-allowed"
              >
                {stockLoading
                  ? "Checking stock..."
                  : "Resolve stock issues to continue"}
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
      </div>
    </div>
  );
}