"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiCopy, FiPackage } from "react-icons/fi";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  async function copyOrderId() {
    if (!orderId) return;
    await navigator.clipboard.writeText(orderId);
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF7F1] px-6 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#E8DDD1] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,61,46,0.12)] md:p-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#4F6B52]/10 text-[#4F6B52]">
          <FiCheckCircle size={48} />
        </div>

        <h1 className="mt-6 text-4xl font-black text-[#2D2A26]">
          Order placed successfully
        </h1>

        <p className="mt-4 text-lg leading-8 text-[#5C5249]">
          Thank you for shopping with AchaarYaar. Your order has been received
          and will be processed soon.
        </p>

        {orderId && (
          <div className="mt-7 rounded-2xl border border-[#E8DDD1] bg-[#FBF7F1] p-4 text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7A9678]">
              Your order ID
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="break-all rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#2D2A26]">
                {orderId}
              </code>
              <button
                type="button"
                onClick={copyOrderId}
                aria-label="Copy order ID"
                className="rounded-lg border border-[#E8DDD1] bg-white p-3 text-[#4F6B52] transition hover:bg-[#F3EDE3]"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Link
            href={orderId ? `/track?orderId=${orderId}` : "/track"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C18A42] py-4 font-extrabold text-[#2D2A26] transition hover:bg-[#D9A85F]"
          >
            <FiPackage size={18} />
            Track Order
          </Link>

          <Link
            href="/products"
            className="block w-full rounded-xl border border-[#4F6B52] py-4 font-bold text-[#4F6B52] transition hover:bg-[#4F6B52] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}