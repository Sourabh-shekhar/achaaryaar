"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

type ProductProps = {
  name: string;
  description: string;
  price: string;
};

export default function ProductCard({
  name,
  description,
  price,
}: ProductProps) {
  const [count, setCount] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="h-48 bg-orange-100 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-orange-600 font-bold">
          Product Image
        </span>
      </div>

      <h3 className="text-2xl font-bold mb-2">
        {name}
      </h3>

      <p className="text-gray-600 mb-4">
        {description}
      </p>

      <p className="text-orange-600 font-bold text-xl mb-4">
        {price}
      </p>

      <button
        onClick={() => {
          setCount(count + 1);

          addItem({
            name,
            price,
          });
        }}
        className="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition"
      >
        Add to Cart ({count})
      </button>
    </div>
  );
}