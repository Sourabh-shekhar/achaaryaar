"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter" && search.trim()) {
    router.push(`/products?search=${search}`);
  }
};

  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b">

      <div className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            {/* <img
    src="/image/logo.png"
    alt="Achaaryaar Logo"
    className="h-20 w-20 object-contain"
  /> */}

            <span className="text-3xl font-extrabold text-orange-600">
              ACHAAR🍯YAAR
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pickles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                 onKeyDown={handleSearch}
               className="border border-gray-300 rounded-xl px-4 py-2 w-56 text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <span className="absolute right-3 top-2.5 text-gray-400">
                🔍
              </span>
            </div>
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Shop
            </Link>

            <Link
              href="/about"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Contact
            </Link>

            <Link
              href="/cart"
              className="relative bg-orange-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-orange-700 transition"
            >
              🛒 Cart

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-3xl text-gray-800"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 bg-white rounded-xl p-4 shadow-lg">
            <input
              type="text"
              placeholder="Search pickles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
               onKeyDown={handleSearch}
             className="border border-gray-300 rounded-xl px-4 py-3 w-full text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"

            />
            <Link href="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>

            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
            >
              Shop
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
            >
              Cart ({totalItems})
            </Link>

          </div>
        )}
      </div>

    </nav>
  );
}