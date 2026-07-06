"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiShoppingBag, FiStar, FiChevronDown, FiCheck } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

type ProductProps = {
  _id: string;
  name: string;
  description: string;
  image: string;
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
  weights,
}: ProductProps) {
  const hasVariants = Array.isArray(weights) && weights.length > 0;
  const getVariantLabel = (weight?: ProductProps["weights"][number]) =>
    weight?.size || weight?.quantity || weight?.weight || "Size";

  const [selectedVariant, setSelectedVariant] =
    useState(getVariantLabel(weights?.[0]));
  const [justAdded, setJustAdded] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close the custom size dropdown on outside click / Escape
  useEffect(() => {
    if (!isSizeOpen) return;

    function onClickOutside(e: MouseEvent) {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setIsSizeOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSizeOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSizeOpen]);

  const selectedData =
    weights?.find((w) => getVariantLabel(w) === selectedVariant) ??
    weights?.[0] ??
    null;

  const addItem = useCartStore((state) => state.addItem);

  const stock = selectedData?.stock;
  const isOutOfStock = hasVariants && stock === 0;
  const isLowStock = typeof stock === "number" && stock > 0 && stock <= 5;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (justAdded) {
      window.location.href = "/cart";
      return;
    }
    if (!selectedData || isOutOfStock) return;

    addItem({
      _id,
      name,
      price: selectedData.price,
      selectedVariant,
    });

    setJustAdded(true);
  }

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
                  {selectedData ? `Rs. ${selectedData.price}` : "Unavailable"}
                </p>
              </div>

              {!hasVariants ? (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                  Unavailable
                </span>
              ) : isOutOfStock ? (
                <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-xs font-bold text-[#6B1F1F]">
                  Out of stock
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
                  Availability unknown
                </span>
              )}
            </div>

            {hasVariants && (
              <div className="relative mb-3" ref={sizeDropdownRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isSizeOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSizeOpen((open) => !open);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border bg-[#FBF7F1] p-3 font-semibold text-[#2D2A26] outline-none transition focus:ring-2 focus:ring-[#4F6B52]/20 ${
                    isSizeOpen ? "border-[#4F6B52]" : "border-[#E8DDD1]"
                  }`}
                >
                  <span>{selectedVariant || getVariantLabel(selectedData)}</span>
                  <FiChevronDown
                    size={16}
                    className={`text-[#4F6B52] transition-transform duration-200 ${isSizeOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSizeOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-y-auto rounded-xl border border-[#E8DDD1] bg-white shadow-[0_16px_36px_rgba(28,61,46,0.18)]"
                  >
                    {weights?.map((weight, index) => {
                      const label = getVariantLabel(weight);
                      const isSelected = label === selectedVariant;
                      return (
                        <button
                          key={`${weight.size}-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVariant(label);
                            setIsSizeOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left font-semibold transition-colors ${
                            isSelected
                              ? "bg-[#F3E7DA] text-[#4F6B52]"
                              : "text-[#2D2A26] hover:bg-[#FBF7F1]"
                          }`}
                        >
                          <span>
                            {label}
                            <span className="ml-2 text-xs font-medium text-[#8A8074]">
                              Rs. {weight.price}
                            </span>
                          </span>
                          {isSelected && <FiCheck size={16} className="text-[#4F6B52]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!selectedData || isOutOfStock}
              onClick={handleAddToCart}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-extrabold transition duration-300 ${
                !selectedData || isOutOfStock
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-[#1877F2] text-white hover:bg-[#166FE5]"
              }`}
            >
              <FiShoppingBag size={18} />
              {!hasVariants
                ? "Unavailable"
                : isOutOfStock
                  ? "Out of Stock"
                  : justAdded
                    ? "Go to Cart"
                    : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
