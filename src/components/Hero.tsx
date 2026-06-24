"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-orange-600 to-yellow-500 py-20">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="text-5xl font-extrabold text-white">
            Authentic Homemade Pickles
          </h1>

          <p className="text-white text-xl mt-6">
            Experience the authentic taste of Bihar.
          </p>

          <div className="flex gap-4 mt-8">
            <Link
              href="/products"
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold"
            >
              Shop Now
            </Link>

            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div>
          <img
            src="/image/hero-pickle.png"
            alt="Achaaryaar"
            className="rounded-3xl shadow-2xl w-full"
          />
        </div>

      </div>
    </section>
  );
}