"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

type ProductProps = {
  _id: string;
  name: string;
  description: string;
  image: string;
  variants: {
    quantity: string;
    price: number;
    stock: number;
  }[];
};

export default function ProductCard({
  _id,
  name,
  description,
  image,
  variants,
}: ProductProps) {
  const [count, setCount] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState(variants[0]?.quantity || "");
  const selectedData =
    variants.find(
      (v) => v.quantity === selectedVariant
    ) || variants[0];

  const addItem = useCartStore((state) => state.addItem);



  return (  
  <Link href={`/products/${_id}`}>
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 border border-gray-100">
      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
        Bestseller
      </div>


      <div className="overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-64 w-full object-cover hover:scale-110 transition duration-500"
        />

      </div>
      <div className="p-6">

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {name}
        </h3>

        <div className="text-yellow-500 mb-3">
          ⭐⭐⭐⭐⭐
          <span className="text-gray-600 text-sm ml-2">
            Loved by Customers
          </span>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          {description}
        </p>

        <p className="text-orange-600 font-bold text-2xl mb-4">
          ₹{selectedData.price}
        </p>

        {selectedData.stock <= 5 &&
          selectedData.stock > 0 && (
            <p className="text-red-600 font-semibold mb-4">
              Only {selectedData.stock} left!
            </p>
          )}

        {selectedData.stock === 0 && (
          <p className="text-red-700 font-bold mb-4">
            Out of Stock
          </p>
        )}
        <select
          value={selectedVariant}
          onChange={(e) =>
            setSelectedVariant(e.target.value)
          }
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 text-gray-900 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {variants.map((variant) => (
            <option
              key={variant.quantity}
              value={variant.quantity}
              className="text-gray-900 bg-white"
            >
              {variant.quantity}
            </option>
          ))}
        </select>

        <button
          disabled={selectedData.stock === 0}
          onClick={() => {
            setCount(count + 1);

            addItem({
              _id,
              name,
              price: `₹${selectedData.price}`,
              selectedVariant,
            });
          }}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition duration-300 ${selectedData.stock === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
            }`}
        >
          {selectedData.stock === 0
            ? "Out of Stock"
            : `Add to Cart (${count})`}
        </button>
      </div>
    </div>
    </Link>
  );
}