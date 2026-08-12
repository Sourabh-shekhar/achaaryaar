"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiSave,
  FiTruck,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

type ProfileUser = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
};

type OrderItem = {
  name?: string;
  selectedVariant?: string;
  quantity?: number;
  price?: number;
};

type ProfileOrder = {
  _id: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  total?: number;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

const steps = [
  { label: "Placed", icon: FiClock },
  { label: "Preparing", icon: FiPackage },
  { label: "Shipped", icon: FiTruck },
  { label: "Delivered", icon: FiCheckCircle },
];

function getStepIndex(status = "Pending") {
  const normalized = String(status || "").trim().toLowerCase();

  // Closed orders must not show the normal delivery timeline
  if (
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("returned") ||
    normalized.includes("refunded")
  ) {
    return -1;
  }

  if (normalized.includes("deliver")) return 3;

  if (
    normalized.includes("ship") ||
    normalized.includes("dispatch") ||
    normalized.includes("transit") ||
    normalized.includes("out for delivery")
  ) {
    return 2;
  }

  if (
    normalized.includes("process") ||
    normalized.includes("packed") ||
    normalized.includes("prepar")
  ) {
    return 1;
  }

  return 0;
}

function isCancelled(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();

  return (
    normalized.includes("cancelled") ||
    normalized.includes("canceled")
  );
}

function isReturned(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();

  return normalized.includes("returned");
}

function isRefunded(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();

  return normalized.includes("refunded");
}

function formatDate(value?: string) {
  if (!value) return "Not updated yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProfilePage() {
  const { status } = useSession();

  const [profile, setProfile] = useState<ProfileUser>({});
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);

        const res = await fetch("/api/profile");
        const data = await res.json();

        if (data.success) {
          setProfile(data.user || {});
          setOrders(data.orders || []);
        } else {
          setMessage(data.message || "Could not load profile.");
        }
      } catch {
        setMessage("Something went wrong while loading your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [status]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.user || profile);
        setMessage("Profile updated successfully.");
      } else {
        setMessage(data.message || "Profile update failed.");
      }
    } catch {
      setMessage("Something went wrong while updating your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7F1] px-6 py-12">
        <div className="max-w-lg rounded-3xl border border-[#E8DDD1] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,61,46,0.1)]">
          <FiUser
            className="mx-auto mb-4 text-[#4F6B52]"
            size={42}
          />

          <h1 className="text-3xl font-black text-[#2D2A26]">
            Login to view your profile
          </h1>

          <p className="mt-3 leading-7 text-[#5C5249]">
            Your profile includes saved details, order history, and
            product tracking updates.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#C18A42] px-6 py-3 font-extrabold text-[#2D2A26]"
          >
            Login First
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#4F6B52]">
            My account
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#2D2A26] md:text-5xl">
            Profile & Order History
          </h1>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#E8DDD1] bg-white p-8 text-[#5C5249]">
            Loading your profile...
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
            {/* PROFILE */}
            <section className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-[0_18px_50px_rgba(28,61,46,0.08)]">
              <h2 className="mb-5 text-2xl font-black text-[#2D2A26]">
                Profile details
              </h2>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                {[
                  ["name", "Full name"],
                  ["phone", "Phone"],
                  ["address", "Address"],
                  ["city", "City"],
                  ["pincode", "Pincode"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-bold text-[#4F6B52]">
                      {label}
                    </label>

                    <input
                      value={String(
                        profile[key as keyof ProfileUser] || ""
                      )}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#E8DDD1] bg-[#FBF7F1] px-4 py-3 font-medium text-[#2D2A26] outline-none focus:border-[#C18A42] focus:ring-2 focus:ring-[#C18A42]/20"
                    />
                  </div>
                ))}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#4F6B52]">
                    Email
                  </label>

                  <input
                    value={profile.email || ""}
                    disabled
                    className="w-full rounded-xl border border-[#E8DDD1] bg-[#F3EDE3] px-4 py-3 font-medium text-[#6F6258]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C18A42] px-5 py-4 font-extrabold text-[#2D2A26] transition hover:bg-[#D9A85F] disabled:opacity-60"
                >
                  <FiSave size={18} />

                  {saving
                    ? "Saving..."
                    : "Update profile"}
                </button>
              </form>

              {message && (
                <p className="mt-4 rounded-xl bg-[#4F6B52]/10 p-3 text-sm font-semibold text-[#4F6B52]">
                  {message}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#FBF7F1] p-4">
                  <p className="text-2xl font-black text-[#6B1F1F]">
                    {orders.length}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-wide text-[#6F6258]">
                    Orders
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FBF7F1] p-4">
                  <p className="text-2xl font-black text-[#6B1F1F]">
                    ₹{totalSpent}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-wide text-[#6F6258]">
                    Total spent
                  </p>
                </div>
              </div>
            </section>

            {/* ORDER HISTORY */}
            <section className="rounded-3xl border border-[#E8DDD1] bg-white p-6 shadow-[0_18px_50px_rgba(28,61,46,0.08)]">
              <h2 className="mb-5 text-2xl font-black text-[#2D2A26]">
                Order history
              </h2>

              {orders.length === 0 ? (
                <div className="rounded-2xl bg-[#FBF7F1] p-8 text-center">
                  <p className="font-bold text-[#2D2A26]">
                    No orders yet
                  </p>

                  <p className="mt-2 text-sm text-[#5C5249]">
                    Once you place an order, tracking updates will
                    appear here.
                  </p>

                  <Link
                    href="/products"
                    className="mt-5 inline-flex rounded-xl bg-[#C18A42] px-5 py-3 font-extrabold text-[#2D2A26]"
                  >
                    Shop pickles
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map((order) => {
                    const activeStep = getStepIndex(
                      order.status
                    );

                    const cancelled = isCancelled(
                      order.status
                    );

                    const returned = isReturned(
                      order.status
                    );

                    const refunded = isRefunded(
                      order.status
                    );

                    return (
                      <article
                        key={order._id}
                        className="rounded-2xl border border-[#E8DDD1] p-5"
                      >
                        {/* ORDER HEADER */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7A9678]">
                              Order #
                              {order._id
                                .slice(-8)
                                .toUpperCase()}
                            </p>

                            <h3 className="mt-1 text-xl font-black text-[#2D2A26]">
                              {order.status || "Pending"}
                            </h3>

                            <p className="mt-1 text-sm text-[#6F6258]">
                              Placed{" "}
                              {formatDate(
                                order.createdAt
                              )}
                            </p>
                          </div>

                          <div className="rounded-full bg-[#4F6B52]/10 px-4 py-2 text-sm font-extrabold text-[#4F6B52]">
                            {order.paymentMethod ===
                            "razorpay"
                              ? order.paymentStatus ||
                                "Paid"
                              : "COD"}
                          </div>
                        </div>

                        {/* CANCELLED */}
                        {cancelled ? (
                          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <FiXCircle size={22} />
                              </div>

                              <div>
                                <p className="font-extrabold text-red-700">
                                  This order has been
                                  cancelled
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                  Your order was cancelled
                                  successfully and will not
                                  be prepared or dispatched.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : returned ? (
                          /* RETURNED */
                          <div className="mt-6 rounded-2xl border border-[#E8DDD1] bg-[#FBF7F1] p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8DDD1] text-[#6F6258]">
                                <FiPackage size={22} />
                              </div>

                              <div>
                                <p className="font-extrabold text-[#2D2A26]">
                                  This order has been
                                  returned
                                </p>

                                <p className="mt-1 text-sm text-[#6F6258]">
                                  The delivery process for
                                  this order has ended.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : refunded ? (
                          /* REFUNDED */
                          <div className="mt-6 rounded-2xl border border-[#E8DDD1] bg-[#FBF7F1] p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8DDD1] text-[#6F6258]">
                                <FiCheckCircle size={22} />
                              </div>

                              <div>
                                <p className="font-extrabold text-[#2D2A26]">
                                  This order has been
                                  refunded
                                </p>

                                <p className="mt-1 text-sm text-[#6F6258]">
                                  This order is closed and
                                  is no longer in the active
                                  delivery process.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* NORMAL DELIVERY TIMELINE */}
                            <div className="mt-6 grid grid-cols-4 gap-2">
                              {steps.map(
                                (step, index) => {
                                  const Icon =
                                    step.icon;

                                  const active =
                                    activeStep >= 0 &&
                                    index <= activeStep;

                                  return (
                                    <div
                                      key={
                                        step.label
                                      }
                                      className="text-center"
                                    >
                                      <div
                                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                          active
                                            ? "border-[#4F6B52] bg-[#4F6B52] text-white"
                                            : "border-[#E8DDD1] bg-white text-[#9C9388]"
                                        }`}
                                      >
                                        <Icon
                                          size={16}
                                        />
                                      </div>

                                      <p
                                        className={`mt-2 text-xs font-bold ${
                                          active
                                            ? "text-[#2D2A26]"
                                            : "text-[#9C9388]"
                                        }`}
                                      >
                                        {step.label}
                                      </p>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {/* SHIPPING DETAILS */}
                            <div className="mt-5 rounded-xl bg-[#FBF7F1] p-4 text-sm text-[#5C5249]">
                              <p>
                                Courier:{" "}
                                <span className="font-bold text-[#2D2A26]">
                                  {order.courierName ||
                                    "Will be updated after dispatch"}
                                </span>
                              </p>

                              {order.trackingNumber && (
                                <p className="mt-1">
                                  AWB:{" "}
                                  <span className="font-bold text-[#2D2A26]">
                                    {
                                      order.trackingNumber
                                    }
                                  </span>
                                </p>
                              )}

                              {order.estimatedDelivery && (
                                <p className="mt-1">
                                  Expected delivery:{" "}
                                  <span className="font-bold text-[#2D2A26]">
                                    {
                                      order.estimatedDelivery
                                    }
                                  </span>
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* ORDER ITEMS */}
                        <div className="mt-5 space-y-2">
                          {(order.items || []).map(
                            (item, index) => (
                              <div
                                key={`${item.name}-${index}`}
                                className="flex justify-between gap-3 text-sm"
                              >
                                <span className="text-[#2D2A26]">
                                  {item.name ||
                                    "Pickle jar"}{" "}
                                  <span className="text-[#8B8177]">
                                    (
                                    {item.selectedVariant ||
                                      "size"}
                                    ) x{" "}
                                    {item.quantity || 1}
                                  </span>
                                </span>

                                <span className="font-bold text-[#6B1F1F]">
                                  ₹{item.price || 0}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {/* TOTAL */}
                        <div className="mt-4 flex justify-between border-t border-[#E8DDD1] pt-4 font-black">
                          <span>Total</span>

                          <span className="text-[#6B1F1F]">
                            ₹{order.total || 0}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}