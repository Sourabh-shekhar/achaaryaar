import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { getCoupon } from "@/lib/coupons";
import Order from "@/models/Order";
import Product from "@/models/Product";

type CartItem = {
  _id: string;
  selectedVariant?: string;
  quantity: number;
  isCombo?: boolean;
};

export async function POST(req: Request) {
  try {
    // ------------------------------------------------
    // 1. REQUIRE LOGIN
    // ------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before checkout.",
        },
        { status: 401 }
      );
    }

    const email = session.user.email
      .trim()
      .toLowerCase();

    // ------------------------------------------------
    // 2. RAZORPAY KEYS
    // ------------------------------------------------

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay keys are not configured.",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------------
    // 3. READ REQUEST
    // ------------------------------------------------

    const body = await req.json();

    const items: CartItem[] = Array.isArray(body.items)
      ? body.items
      : [];

    const couponCode = String(body.couponCode || "")
      .trim()
      .toUpperCase();

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 4. CONNECT DATABASE
    // ------------------------------------------------

    await connectDB();

    // ------------------------------------------------
    // 5. SERVER-SIDE SUBTOTAL
    // ------------------------------------------------

    let subtotal = 0;

    for (const item of items) {
      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      const product = await Product.findById(
        item._id
      ).lean();

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One of the products in your cart no longer exists.",
          },
          { status: 404 }
        );
      }

      // ------------------------------------------------
      // COMBO
      // ------------------------------------------------

      if (item.isCombo) {
        if (!product.isCombo) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} is no longer available as a combo.`,
            },
            { status: 400 }
          );
        }

        if (typeof product.comboPrice !== "number") {
          return NextResponse.json(
            {
              success: false,
              message:
                `Price is missing for ${product.name}.`,
            },
            { status: 400 }
          );
        }

        if ((product.comboStock ?? 0) < quantity) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} is out of stock.`,
            },
            { status: 409 }
          );
        }

        subtotal += product.comboPrice * quantity;

        continue;
      }

      // ------------------------------------------------
      // NORMAL PRODUCT
      // ------------------------------------------------

      if (!item.selectedVariant) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Please select a size for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      const variant = product.weights?.find(
        (weight: any) =>
          weight.size === item.selectedVariant
      );

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} ${item.selectedVariant} is no longer available.`,
          },
          { status: 400 }
        );
      }

      if ((variant.stock ?? 0) < quantity) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} (${item.selectedVariant}) is out of stock.`,
          },
          { status: 409 }
        );
      }

      if (typeof variant.price !== "number") {
        return NextResponse.json(
          {
            success: false,
            message:
              `Price is missing for ${product.name} (${item.selectedVariant}).`,
          },
          { status: 400 }
        );
      }

      subtotal += variant.price * quantity;
    }

    // ------------------------------------------------
    // 6. SHIPPING
    // ------------------------------------------------

    const shipping = subtotal >= 499 ? 0 : 50;

    // ------------------------------------------------
    // 7. COUPON
    // ------------------------------------------------

    let discountPercent = 0;
    let validCouponCode = "";

    if (couponCode) {
      const coupon = await getCoupon(couponCode);

      if (!coupon) {
        return NextResponse.json(
          {
            success: false,
            message: "That coupon code isn't valid.",
          },
          { status: 400 }
        );
      }

      // Coupon already used?
      const alreadyUsed = await Order.findOne({
        email,
        couponCode: coupon.code,
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
            message:
              `You've already used ${coupon.code} on a previous order.`,
          },
          { status: 400 }
        );
      }

      // First order only
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
                `${coupon.code} is only valid on your first order.`,
            },
            { status: 400 }
          );
        }
      }

      discountPercent = coupon.percent;
      validCouponCode = coupon.code;
    }

    // ------------------------------------------------
    // 8. FINAL TOTAL
    // ------------------------------------------------

    const discount = Math.round(
      (subtotal * discountPercent) / 100
    );

    const total = Math.max(
      0,
      subtotal - discount + shipping
    );

    if (total <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order total.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 9. CREATE RAZORPAY ORDER
    // ------------------------------------------------

    const auth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const receipt = `AY-${Date.now()}`;

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt,
          notes: {
            brand: "AchaarYaar",
            email,
            coupon: validCouponCode || "NONE",
          },
        }),
        cache: "no-store",
      }
    );

    const razorpayOrder =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay order creation error:",
        razorpayOrder
      );

      return NextResponse.json(
        {
          success: false,
          message:
            razorpayOrder?.error?.description ||
            "Failed to create Razorpay order.",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------------
    // 10. RETURN SERVER PRICING
    // ------------------------------------------------

    return NextResponse.json({
      success: true,
      keyId,
      order: razorpayOrder,

      pricing: {
        subtotal,
        shipping,
        discount,
        total,
        couponCode: validCouponCode,
        discountPercent,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay order creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to start payment.",
      },
      { status: 500 }
    );
  }
}