"use client";

import { useState } from "react";
import Link from "next/link";
import { FiShoppingBag, FiStar } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

type ProductProps = {
  _id: string;
  name: string;
  description: string;
  image: string;
  weights: {
    size: string;
    price: number;
    stock: number;
  }[];
};

export default function ProductCard({
  _id,
  name,
  description,
  image,
  weights,
}: ProductProps) {
  const [selectedVariant, setSelectedVariant] =
    useState(weights?.[0]?.size || "");
  const [count, setCount] = useState(0);

  const selectedData =
    weights?.find((w) => w.size === selectedVariant) ??
    weights?.[0] ??
    null;

  const addItem = useCartStore((state) => state.addItem);
  const isLowStock =
    selectedData?.stock !== undefined &&
    selectedData.stock <= 5 &&
    selectedData.stock > 0;

  return (
    <Link href={`/products/${_id}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-[0_12px_30px_rgba(28,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(28,61,46,0.16)]">
        <div className="absolute left-4 top-4 z-10 rounded-full bg-[#4F6B52] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Bestseller
        </div>

        <div className="relative overflow-hidden bg-[#FBF7F1]">
          <img
            src={image}
            alt={name}
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
                  Rs. {selectedData?.price || "N/A"}
                </p>
              </div>

              {selectedData?.stock === 0 ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-xs font-bold text-[#6B1F1F]">
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="rounded-full bg-[#C18A42]/15 px-3 py-1 text-xs font-bold text-[#8A5E20]">
                  Only {selectedData.stock} left
                </span>
              ) : (
                <span className="rounded-full bg-[#4F6B52]/10 px-3 py-1 text-xs font-bold text-[#4F6B52]">
                  Fresh stock
                </span>
              )}
            </div>

            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              onClick={(e) => e.preventDefault()}
              className="mb-4 w-full rounded-xl border border-[#E8DDD1] bg-[#FBF7F1] p-3 font-semibold text-[#2D2A26] outline-none transition focus:border-[#4F6B52] focus:ring-2 focus:ring-[#4F6B52]/20"
            >
              {weights?.map((weight, index) => (
                <option
                  key={`${weight.size}-${index}`}
                  value={weight.size}
                >
                  {weight.size}
                </option>
              ))}
            </select>

            <button
              disabled={!selectedData || selectedData.stock === 0}
              onClick={(e) => {
                e.preventDefault();

                if (!selectedData) return;

                setCount(count + 1);

                addItem({
                  _id,
                  name,
                  price: selectedData.price,
                  selectedVariant,
                });
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-extrabold transition duration-300 ${
                !selectedData || selectedData.stock === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-[#C18A42] text-[#2D2A26] hover:bg-[#D9A85F]"
              }`}
            >
              <FiShoppingBag size={18} />
              {!selectedData || selectedData.stock === 0
                ? "Out of Stock"
                : count > 0
                  ? `Added (${count})`
                  : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
