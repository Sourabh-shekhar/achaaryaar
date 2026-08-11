import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { ensureDefaultCoupons, getCoupon } from "@/lib/coupons";
import Order from "@/models/Order";

export async function GET() {
  try {
    await ensureDefaultCoupons();

    const coupons = await Coupon.find({
      active: true,
    })
      .select("code percent firstOrderOnly")
      .lean();

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Coupon GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load coupons.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a coupon code.",
        },
        { status: 400 }
      );
    }

    const coupon = await getCoupon(code);

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon is invalid or inactive.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const email = session.user.email
      .trim()
      .toLowerCase();

    // ---------------------------------------------
    // CHECK IF THIS COUPON WAS ALREADY USED
    // ---------------------------------------------

    const alreadyUsed = await Order.findOne({
      email,
      couponCode: code,
      status: {
        $nin: ["Cancelled"],
      },
    })
      .select("_id")
      .lean();

    if (alreadyUsed) {
      return NextResponse.json(
        {
          success: false,
          message: "You've already used this coupon.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // FIRST ORDER COUPON
    // ---------------------------------------------

    if (coupon.firstOrderOnly) {
      const previousOrder = await Order.findOne({
        email,
        status: {
          $nin: ["Cancelled"],
        },
      })
        .select("_id")
        .lean();

      if (previousOrder) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This coupon is valid only for your first order.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        percent: coupon.percent,
        firstOrderOnly: coupon.firstOrderOnly,
      },
      message: `${coupon.code} applied successfully.`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to validate coupon.",
      },
      { status: 500 }
    );
  }
}