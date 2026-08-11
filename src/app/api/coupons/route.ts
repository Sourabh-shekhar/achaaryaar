import { NextResponse } from "next/server";
import { ensureDefaultCoupons } from "@/lib/coupons";
import Coupon from "@/models/Coupon";

export async function GET() {
  await ensureDefaultCoupons();
  const coupons = await Coupon.find({ active: true }).select("code percent").lean();
  return NextResponse.json({ success: true, coupons }, { headers: { "Cache-Control": "no-store" } });
}
