"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/baseUrl";

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      cache: "no-store",
    });
    const data = await res.json();

    if (data.success) {
      const foundOrder = data.orders.find(
        (o: any) => o._id === params.id
      );

      setOrder(foundOrder);
    }
  };

  if (!order)
    return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white">

      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Aachaaryaar
          </h1>

          <p>Premium Homemade Pickles</p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl"
        >
          Print Invoice
        </button>
      </div>

      <hr className="my-6" />

      <h2 className="text-2xl font-bold mb-4">
        Customer Details
      </h2>

      <div className="space-y-2">
        <p><strong>Name:</strong> {order.fullName}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>City:</strong> {order.city}</p>
        <p><strong>Pincode:</strong> {order.pincode}</p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        Products
      </h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Product</th>
            <th className="border p-3">Quantity</th>
            <th className="border p-3">Price</th>
          </tr>
        </thead>

        <tbody>
          {order.items?.map((item: any, index: number) => (
            <tr key={index}>
              <td className="border p-3">
                {item.name}
              </td>

              <td className="border p-3">
                {item.quantity}
              </td>

              <td className="border p-3">
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-right">
        <h2 className="text-3xl font-bold">
          Total: ₹{order.total}
        </h2>
      </div>

    </div>
  );
}