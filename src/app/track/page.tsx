"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiTruck,
} from "react-icons/fi";

type TrackedOrder = {
  id: string;
  fullName: string;
  city?: string;
  pincode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  total: number;
  items: {
    name?: string;
    quantity?: number;
    selectedVariant?: string;
    price?: number;
  }[];
  createdAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
};

const steps = [
  { key: "Pending", label: "Order placed", icon: FiClock },
  { key: "Processing", label: "Preparing", icon: FiPackage },
  { key: "Shipped", label: "Shipped", icon: FiTruck },
  { key: "Delivered", label: "Delivered", icon: FiCheckCircle },
];

function getStepIndex(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("deliver")) return 3;
  if (normalized.includes("ship") || normalized.includes("dispatch")) return 2;
  if (normalized.includes("process") || normalized.includes("packed")) return 1;
  return 0;
}

function formatDate(value?: string) {
  if (!value) return "Not updated yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const activeStep = useMemo(
    () => (order ? getStepIndex(order.status) : 0),
    [order]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setOrder(null);

    if (!orderId.trim() || !contact.trim()) {
      setMessage("Please enter your order ID and phone number or email.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        orderId: orderId.trim(),
        contact: contact.trim(),
      });

      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Could not find this order.");
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while checking your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#E8DDD1] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#4F6B52]">
              Order tracking
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-[#2D2A26] md:text-6xl">
              Track your AchaarYaar delivery.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#5C5249]">
              Enter your order ID and the phone number or email used at checkout.
              We will show the latest order status, payment status, and delivery
              details available in the system.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E8DDD1] bg-white p-5">
                <FiPackage className="mb-3 text-[#C18A42]" size={24} />
                <h2 className="font-extrabold text-[#2D2A26]">
                  Freshly packed
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6F6258]">
                  Orders move from placed to preparing once your jars are packed.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8DDD1] bg-white p-5">
                <FiTruck className="mb-3 text-[#C18A42]" size={24} />
                <h2 className="font-extrabold text-[#2D2A26]">
                  Courier ready
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6F6258]">
                  Tracking number appears here when the order is shipped.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-[0_18px_50px_rgba(28,61,46,0.1)] md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#4F6B52]">
                  Order ID
                </label>
                <input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Example: 66f1..."
                  className="w-full rounded-xl border border-[#E8DDD1] bg-[#FBF7F1] px-4 py-3 font-medium text-[#2D2A26] outline-none transition focus:border-[#C18A42] focus:ring-2 focus:ring-[#C18A42]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#4F6B52]">
                  Phone number or email
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="10-digit phone or email"
                  className="w-full rounded-xl border border-[#E8DDD1] bg-[#FBF7F1] px-4 py-3 font-medium text-[#2D2A26] outline-none transition focus:border-[#C18A42] focus:ring-2 focus:ring-[#C18A42]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C18A42] px-5 py-4 font-extrabold text-[#2D2A26] transition hover:bg-[#D9A85F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSearch size={18} />
                {loading ? "Checking..." : "Track order"}
              </button>
            </form>

            {message && (
              <p className="mt-5 rounded-xl border border-[#6B1F1F]/20 bg-[#6B1F1F]/10 p-4 text-sm font-semibold text-[#6B1F1F]">
                {message}
              </p>
            )}

            {order && (
              <div className="mt-8 border-t border-[#E8DDD1] pt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7A9678]">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#2D2A26]">
                      {order.status}
                    </h2>
                    <p className="mt-1 text-sm text-[#6F6258]">
                      Last updated {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#4F6B52]/10 px-4 py-2 text-sm font-extrabold text-[#4F6B52]">
                    {order.paymentMethod === "razorpay"
                      ? order.paymentStatus
                      : "COD order"}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const active = index <= activeStep;

                    return (
                      <div key={step.key} className="text-center">
                        <div
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                            active
                              ? "border-[#4F6B52] bg-[#4F6B52] text-white"
                              : "border-[#E8DDD1] bg-white text-[#9C9388]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <p
                          className={`mt-2 text-xs font-bold ${
                            active ? "text-[#2D2A26]" : "text-[#9C9388]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 grid gap-4 rounded-2xl bg-[#FBF7F1] p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A9678]">
                      Delivery
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-bold text-[#2D2A26]">
                      <FiMapPin className="text-[#C18A42]" />
                      {order.city || "City"} {order.pincode || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A9678]">
                      Courier
                    </p>
                    <p className="mt-2 font-bold text-[#2D2A26]">
                      {order.courierName || "Will be updated after dispatch"}
                    </p>
                    {order.trackingNumber && (
                      <p className="mt-1 text-sm text-[#6F6258]">
                        AWB: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 font-extrabold text-[#2D2A26]">
                    Items
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex justify-between gap-4 rounded-xl border border-[#E8DDD1] p-4 text-sm"
                      >
                        <span className="font-semibold text-[#2D2A26]">
                          {item.name || "Pickle jar"}
                          <span className="text-[#8B8177]">
                            {" "}
                            ({item.selectedVariant || "size"}) x{" "}
                            {item.quantity || 1}
                          </span>
                        </span>
                        <span className="font-bold text-[#6B1F1F]">
                          Rs. {item.price || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E8DDD1] pt-5">
                  <span className="font-bold text-[#5C5249]">Total</span>
                  <span className="text-2xl font-black text-[#6B1F1F]">
                    Rs. {order.total}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-[#6F6258]">
              Need help?{" "}
              <Link href="/contact" className="font-bold text-[#4F6B52]">
                Contact support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
