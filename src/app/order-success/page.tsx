"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center">

        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mt-6">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mt-4 text-lg">
          Thank you for shopping with Achaaryaar.
          Your order has been received and will be processed soon.
        </p>

        <div className="mt-8 space-y-4">

          <Link
            href="/"
            className="block w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition"
          >
            Continue Shopping
          </Link>

          <Link
            href="/products"
            className="block w-full border-2 border-orange-600 text-orange-600 py-4 rounded-xl font-bold hover:bg-orange-50 transition"
          >
            View More Products
          </Link>

        </div>

      </div>
    </div>
  );
}