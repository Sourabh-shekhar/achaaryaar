"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

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
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">

      <img
        src={image}
        alt={name}
        className="h-48 w-full object-cover rounded-xl mb-4"
      />

      <h3 className="text-2xl font-bold mb-2">
        {name}
      </h3>

      <p className="text-gray-600 mb-4">
        {description}
      </p>

      <p className="text-orange-600 font-bold text-xl mb-4">
        ₹{selectedData.price}
      </p>

      <p className="text-gray-600 mb-4">
        Stock: {selectedData.stock}
      </p>
      <p className="text-gray-600 mb-4">
        Stock: {selectedData.stock}
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
        className="w-full border rounded-xl p-3 mb-4"
      >
        {variants.map((variant) => (
          <option
            key={variant.quantity}
            value={variant.quantity}
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
        className={`w-full py-3 rounded-xl text-white transition ${selectedData.stock === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
          }`}
      >
        {selectedData.stock === 0
          ? "Out of Stock"
          : `Add to Cart (${count})`}
      </button>

    </div>
  );
}