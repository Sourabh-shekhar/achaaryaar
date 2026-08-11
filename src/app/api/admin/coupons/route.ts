import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureDefaultCoupons } from "@/lib/coupons";
import Coupon from "@/models/Coupon";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  await ensureDefaultCoupons();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  await ensureDefaultCoupons();
  const body = await req.json();
  const code = String(body.code || "").trim().toUpperCase();
  const percent = Number(body.percent);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code) || !Number.isFinite(percent) || percent < 1 || percent > 100) {
    return NextResponse.json({ success: false, message: "Enter a valid code and discount between 1% and 100%." }, { status: 400 });
  }
  try {
    const coupon = await Coupon.create({ code, percent, active: body.active !== false, firstOrderOnly: body.firstOrderOnly === true });
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "A coupon with this code already exists." }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id || typeof body.active !== "boolean") return NextResponse.json({ success: false, message: "Invalid coupon update." }, { status: 400 });
  const coupon = await Coupon.findByIdAndUpdate(body.id, { active: body.active }, { new: true });
  if (!coupon) return NextResponse.json({ success: false, message: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ success: true, coupon });
}
