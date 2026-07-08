"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  createdAt?: string;
  paymentMethod?: string;
  status?: string;
};

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders`, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        const foundOrder = data.orders.find((o: any) => o._id === params.id);
        setOrder(foundOrder ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1E8] text-[#3E4A2E]">
        Loading invoice…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1E8] text-[#7A2E2E]">
        Order not found.
      </div>
    );
  }

  const subtotal = order.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) ?? 0;

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 60;
  const grandTotal = order.total ?? subtotal + shipping;
  const invoiceNumber = `AY-${(order._id || "").slice(-6).toUpperCase()}`;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  return (
    <div className="min-h-screen bg-[#EDE7D6] py-10 print:bg-white print:py-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @media print {
          @page { size: A4; margin: 8mm; }
          html, body { height: auto !important; }
          .invoice-box { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="invoice-box font-body max-w-3xl mx-auto bg-[#FBF8F0] text-[#2A2A24] shadow-xl print:shadow-none rounded-sm overflow-hidden border border-[#E3DAC1]">
        {/* Top accent band */}
        <div className="h-2 bg-[#3E4A2E] print:h-1" />

        <div className="p-10 sm:p-12 print:p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6 print:mb-4">
            <img
              src="/logo.png"
              alt="AchaarYaar"
              className="h-16 w-auto object-contain print:h-14"
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between pb-6 print:pb-4 border-b-2 border-dashed border-[#D8CBA5]">
            <div>
              <h1 className="font-display text-4xl font-semibold text-[#3E4A2E] tracking-tight">
                AchaarYaar
              </h1>
              <p className="mt-1 text-sm text-[#6B6552] tracking-wide uppercase">
                Premium Homemade Pickles
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-2xl text-[#2A2A24]">Invoice</p>
              <p className="mt-1 text-sm text-[#6B6552] font-medium tracking-wide">
                {invoiceNumber}
              </p>
              <p className="text-sm text-[#6B6552]">
                {invoiceDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Print button - hidden when printing */}
          <div className="flex justify-end pt-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-[#3E4A2E] hover:bg-[#333d26] text-white px-6 py-2.5 rounded-md text-sm font-medium tracking-wide transition-colors"
            >
              Print Invoice
            </button>
          </div>

          {/* Billed to / Order details */}
          <div className="grid sm:grid-cols-2 gap-8 mt-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#B58A2E] font-semibold mb-2">
                Billed To
              </p>
              <p className="font-medium text-[#2A2A24]">{order.fullName}</p>
              <p className="text-sm text-[#57523F] mt-1">{order.phone}</p>
              <p className="text-sm text-[#57523F] mt-1 leading-relaxed">
                {order.address}
                <br />
                {order.city} – {order.pincode}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-[#B58A2E] font-semibold mb-2">
                Order Details
              </p>
              <p className="text-sm text-[#57523F]">
                Order ID:{" "}
                <span className="text-[#2A2A24] font-medium">{order._id}</span>
              </p>
              <p className="text-sm text-[#57523F] mt-1">
                Payment:{" "}
                <span className="text-[#2A2A24] font-medium">
                  {order.paymentMethod ?? "Cash on Delivery"}
                </span>
              </p>
              <p className="text-sm text-[#57523F] mt-1">
                Status:{" "}
                <span className="text-[#3E4A2E] font-semibold">
                  {order.status ?? "Confirmed"}
                </span>
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-10">
            <p className="text-xs uppercase tracking-widest text-[#B58A2E] font-semibold mb-3">
              Products
            </p>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#3E4A2E] text-white">
                  <th className="text-left text-xs uppercase tracking-wide font-medium py-3 px-4 rounded-tl-sm">
                    #
                  </th>
                  <th className="text-left text-xs uppercase tracking-wide font-medium py-3 px-4">
                    Product
                  </th>
                  <th className="text-center text-xs uppercase tracking-wide font-medium py-3 px-4">
                    Qty
                  </th>
                  <th className="text-right text-xs uppercase tracking-wide font-medium py-3 px-4">
                    Unit Price
                  </th>
                  <th className="text-right text-xs uppercase tracking-wide font-medium py-3 px-4 rounded-tr-sm">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {order.items?.map((item, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-[#FBF8F0]" : "bg-[#F3EEDF]"
                    }
                  >
                    <td className="py-3 px-4 text-sm text-[#8A8468] border-b border-[#E3DAC1]">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2A2A24] border-b border-[#E3DAC1]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-[#57523F] border-b border-[#E3DAC1]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-[#57523F] border-b border-[#E3DAC1]">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-[#2A2A24] border-b border-[#E3DAC1]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-sm text-[#57523F]">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#57523F]">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-[#3E4A2E]">
                <span className="font-display text-lg font-semibold text-[#2A2A24]">
                  Total
                </span>
                <span className="font-display text-lg font-semibold text-[#7A2E2E]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Seal stamp */}
          <div className="flex justify-end mt-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#B58A2E] flex items-center justify-center text-center rotate-[-8deg] print:opacity-80">
              <span className="font-display text-[10px] leading-tight text-[#B58A2E] uppercase tracking-wide px-2">
                Achaar
                <br />
                Yaar
                <br />
                Sealed
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-dashed border-[#D8CBA5] text-center">
            <p className="font-display text-base text-[#3E4A2E]">
              Thank you for your order!
            </p>
            <p className="text-xs text-[#8A8468] mt-2">
              AchaarYaar · Premium Homemade Pickles · For queries, reply to
              this invoice or contact us at support@achaaryaar.com
            </p>
            <p className="text-[10px] text-[#B0AA8F] mt-3 tracking-wide uppercase">
              This is a computer-generated invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}