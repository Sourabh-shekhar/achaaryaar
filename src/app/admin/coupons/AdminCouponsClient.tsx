"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Coupon = { _id: string; code: string; percent: number; active: boolean; firstOrderOnly?: boolean };

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ code: "", percent: "", firstOrderOnly: false });

  const loadCoupons = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/coupons", { cache: "no-store" });
    const data = await response.json();
    if (data.success) setCoupons(data.coupons);
    else setMessage(data.message || "Could not load coupons.");
    setLoading(false);
  };

  useEffect(() => { loadCoupons(); }, []);

  const addCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, percent: Number(form.percent) }) });
    const data = await response.json();
    setSaving(false);
    if (!data.success) return setMessage(data.message || "Could not add coupon.");
    setForm({ code: "", percent: "", firstOrderOnly: false });
    setMessage("Coupon added.");
    loadCoupons();
  };

  const toggleCoupon = async (coupon: Coupon) => {
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: coupon._id, active: !coupon.active }) });
    const data = await response.json();
    setSaving(false);
    if (!data.success) return setMessage(data.message || "Could not update coupon.");
    setCoupons((current) => current.map((item) => item._id === coupon._id ? { ...item, active: data.coupon.active } : item));
  };

  return <main className="mx-auto min-h-screen max-w-6xl bg-[#FBF7F1] px-4 py-8 sm:px-6">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7A9678]">AchaarYaar Admin</p><h1 className="text-3xl font-black text-[#2D2A26]">Coupon Management</h1></div>
      <Link href="/admin/products" className="rounded-xl bg-[#3D5640] px-5 py-3 font-bold text-white">Product Management</Link>
    </div>
    <section className="mb-8 rounded-2xl border border-[#E8DDD1] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-extrabold text-[#2D2A26]">Create a coupon</h2>
      <form onSubmit={addCoupon} className="grid gap-3 sm:grid-cols-[1fr_150px_auto_auto] sm:items-end">
        <label className="text-sm font-bold text-[#5C5249]">Coupon code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="FESTIVE15" className="mt-1 w-full rounded-xl border border-[#E8DDD1] px-4 py-3 font-bold text-[#2D2A26]" /></label>
        <label className="text-sm font-bold text-[#5C5249]">Discount %<input required min="1" max="100" type="number" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} placeholder="15" className="mt-1 w-full rounded-xl border border-[#E8DDD1] px-4 py-3 font-bold text-[#2D2A26]" /></label>
        <label className="flex items-center gap-2 pb-3 text-sm font-bold text-[#5C5249]"><input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })} /> First order only</label>
        <button disabled={saving} className="rounded-xl bg-[#C18A42] px-5 py-3 font-extrabold text-white disabled:opacity-60">Add Coupon</button>
      </form>
      {message && <p className="mt-3 text-sm font-semibold text-[#6B1F1F]">{message}</p>}
    </section>
    <section className="overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-sm">
      <div className="border-b border-[#E8DDD1] px-5 py-4"><h2 className="text-xl font-extrabold text-[#2D2A26]">All coupons</h2><p className="text-sm text-[#5C5249]">Use the switch to make a coupon available or unavailable immediately.</p></div>
      {loading ? <p className="p-5 text-[#5C5249]">Loading coupons…</p> : <div className="divide-y divide-[#E8DDD1]">{coupons.map((coupon) => <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-mono text-xl font-black tracking-wider text-[#2D2A26]">{coupon.code}</p><p className="text-sm text-[#5C5249]">{coupon.percent}% off{coupon.firstOrderOnly ? " · First order only" : ""}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${coupon.active ? "bg-[#4F6B52]/10 text-[#3D5640]" : "bg-[#6B1F1F]/10 text-[#6B1F1F]"}`}>{coupon.active ? "ACTIVE" : "INACTIVE"}</span><button disabled={saving} onClick={() => toggleCoupon(coupon)} className={`rounded-xl px-4 py-2 font-bold text-white disabled:opacity-60 ${coupon.active ? "bg-[#6B1F1F]" : "bg-[#3D5640]"}`}>{coupon.active ? "Make Unavailable" : "Make Available"}</button></div></div>)}</div>}
    </section>
  </main>;
}
