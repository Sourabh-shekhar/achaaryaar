import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Authentic Homemade Pickles
        </h1>

        <p className="mt-6 text-lg md:text-xl max-w-3xl">
          Traditional Bihar recipes crafted with premium ingredients,
          rich spices and homemade goodness.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="bg-white text-orange-700 px-8 py-4 rounded-xl font-bold hover:scale-105 transition duration-300"
          >
            Shop Now
          </Link>

          <Link
            href="/recipes"
            className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-700 transition duration-300"
          >
            View Recipes
          </Link>
        </div>

      </div>
    </section>
  );
}