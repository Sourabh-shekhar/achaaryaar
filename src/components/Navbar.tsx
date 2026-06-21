"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          href="/"
          className="text-3xl font-extrabold text-orange-600"
        >
          Achaaryaar
        </Link>

        <div className="flex items-center gap-8">

          <Link
            href="/"
            className="text-gray-700 font-medium hover:text-orange-600 transition"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="text-gray-700 font-medium hover:text-orange-600 transition"
          >
            Products
          </Link>

          <Link
            href="/recipes"
            className="text-gray-700 font-medium hover:text-orange-600 transition"
          >
            Recipes
          </Link>

          <Link
            href="/contact"
            className="text-gray-700 font-medium hover:text-orange-600 transition"
          >
            Contact
          </Link>

          <Link
            href="/cart"
            className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Cart ({totalItems})
          </Link>

        </div>
      </div>
    </nav>
  );
}