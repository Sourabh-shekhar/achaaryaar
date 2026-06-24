"use client";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );
  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const subtotal = items.reduce((total, item) => {
    const price = parseInt(
      item.price.match(/\d+/)?.[0] || "0"
    );

    return total + price * item.quantity;
  }, 0);

  const shipping = items.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-xl text-gray-700">
              Your cart is currently empty.
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.name}-${item.selectedVariant}`}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {item.name}
                      </h2>

                      <p className="text-gray-700 mt-2">
                        {item.price}
                      </p>
                      <p className="text-gray-700">
                        Variant: {item.selectedVariant}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item.name, item.selectedVariant)
                      }
                      className="bg-red-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
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
                      className="bg-red-500 text-white w-8 h-8 rounded-lg font-bold hover:bg-red-600 transition"
                    >
                      -
                    </button>

                    <span className="text-lg font-bold min-w-[30px] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.name,
                          item.selectedVariant
                        )
                      }
                      className="bg-orange-600 text-white w-8 h-8 rounded-lg font-bold hover:bg-orange-700 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-10 bg-gray-900 rounded-2xl shadow-2xl p-8 text-white">
              <h2 className="text-3xl font-extrabold text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-5 text-lg text-white">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold">
                    ₹{shipping}
                  </span>
                </div>

                <hr className="border-gray-600" />

                <div className="flex justify-between text-3xl font-extrabold text-orange-400">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Link href="/checkout"
                  className="block w-full mt-4 bg-orange-600 text-white py-4 rounded-xl font-bold text-center hover:bg-orange-700 transition">
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