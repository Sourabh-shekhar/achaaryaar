"use client";

import Link from "next/link";
import { FiArrowUpRight, FiStar } from "react-icons/fi";

type ProductProps = {
  _id: string;
  name: string;
  description: string;
  image: string;
  href?: string;
  weights: {
    size?: string;
    quantity?: string;
    weight?: string;
    price: number;
    stock: number;
  }[];
};

export default function ProductCard({
  _id,
  name,
  description,
  image,
  href,
  weights,
}: ProductProps) {
  const hasVariants = Array.isArray(weights) && weights.length > 0;
  const getVariantLabel = (weight?: ProductProps["weights"][number]) =>
    weight?.size || weight?.quantity || weight?.weight || "Size";

  // The card no longer lets you pick a weight or add to cart directly —
  // that happens on the product page. Here we just default to the first
  // in-stock variant (or, if everything's out of stock, the first variant)
  // so the price/stock badge still has something to show.
  const defaultVariant =
    weights?.find((w) => w.stock > 0) ?? weights?.[0] ?? null;

  const selectedData = defaultVariant;

  const stock = selectedData?.stock;
  const isOutOfStock = hasVariants && stock === 0;
  const isLowStock = typeof stock === "number" && stock > 0 && stock <= 5;

  return (
    <Link href={href || `/products/${_id}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-[0_12px_30px_rgba(28,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(28,61,46,0.16)]">
        <div className="absolute left-4 top-4 z-10 rounded-full bg-[#4F6B52] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Bestseller
        </div>

        <div className="relative overflow-hidden bg-[#FBF7F1]">
          <img
            src={image}
            alt={name}
            width={420}
            height={256}
            loading="lazy"
            decoding="async"
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#C18A42]">
            {[0, 1, 2, 3, 4].map((star) => (
              <FiStar key={star} className="fill-current" size={14} />
            ))}
            <span className="ml-1 text-xs font-medium text-[#6F6258]">
              Customer favourite
            </span>
          </div>

          <h3 className="mb-2 text-2xl font-extrabold leading-tight text-[#2D2A26]">
            {name}
          </h3>

          <p className="mb-5 line-clamp-3 leading-relaxed text-[#5C5249]">
            {description}
          </p>

          <div className="mt-auto">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A9678]">
                  Starts at
                </p>
                <p className="text-3xl font-black text-[#6B1F1F]">
                  {selectedData ? `₹${selectedData.price}` : "Out of Stock"}
                </p>
              </div>

              {!hasVariants ? (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                  Out of Stock
                </span>
              ) : isOutOfStock ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-xs font-bold text-[#6B1F1F]">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="rounded-full bg-[#C18A42]/15 px-3 py-1 text-xs font-bold text-[#8A5E20]">
                  Only {stock} left
                </span>
              ) : typeof stock === "number" ? (
                <span className="rounded-full bg-[#4F6B52]/10 px-3 py-1 text-xs font-bold text-[#4F6B52]">
                  {stock} in stock
                </span>
              ) : (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                  Out of Stock
                </span>
              )}
            </div>

            <span
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-extrabold transition duration-300 ${
                !hasVariants || isOutOfStock
                  ? "bg-gray-300 text-gray-600"
                  : "bg-[#3D5640] text-white group-hover:bg-[#2F4533]"
              }`}
            >
              {!hasVariants
                ? "Out of Stock"
                : isOutOfStock
                  ? "Out of Stock"
                  : (
                    <>
                      View Product
                      <FiArrowUpRight size={18} />
                    </>
                  )}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}