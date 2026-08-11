import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

const DEFAULT_COUPONS = [
  { code: "WELCOME10", percent: 10, firstOrderOnly: true, active: true },
  { code: "BIHAR10", percent: 10, firstOrderOnly: false, active: true },
];

export async function ensureDefaultCoupons() {
  await connectDB();
  await Promise.all(
    DEFAULT_COUPONS.map((coupon) =>
      Coupon.updateOne({ code: coupon.code }, { $setOnInsert: coupon }, { upsert: true })
    )
  );
}

export async function getCoupon(code: string) {
  await ensureDefaultCoupons();
  return Coupon.findOne({ code: code.trim().toUpperCase(), active: true }).lean();
}
