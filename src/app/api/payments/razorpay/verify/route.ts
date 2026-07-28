import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/sendEmail";

type CartItem = {
  _id: string;
  selectedVariant: string;
  quantity: number;
};

// Same coupon rules as /api/orders (COD path). Keep both in sync if you
// ever add/change a coupon code.
const COUPONS: Record<string, { percent: number; firstOrderOnly?: boolean }> = {
  WELCOME10: { percent: 10, firstOrderOnly: true },
  BIHAR10: { percent: 10 },
};

async function resolveCoupon(email: string, rawCode: string | undefined) {
  const code = (rawCode || "").trim().toUpperCase();

  if (!code) {
    return { code: "", percent: 0, error: null as string | null };
  }

  const coupon = COUPONS[code];

  if (!coupon) {
    return { code: "", percent: 0, error: "That coupon code isn't valid." };
  }

  const alreadyUsed = await Order.findOne({ email, couponCode: code });

  if (alreadyUsed) {
    return {
      code: "",
      percent: 0,
      error: `You've already used ${code} on a previous order.`,
    };
  }

  if (coupon.firstOrderOnly) {
    const anyPriorOrder = await Order.findOne({ email });

    if (anyPriorOrder) {
      return {
        code: "",
        percent: 0,
        error: `${code} is only valid on your first order.`,
      };
    }
  }

  return { code, percent: coupon.percent, error: null as string | null };
}

async function reduceStock(items: CartItem[]) {
  for (const item of items) {
    if (!isValidObjectId(item._id)) continue;

    const product = await Product.findById(item._id);

    if (!product) continue;

    const variant = product.weights?.find(
      (v: { size: string }) => v.size === item.selectedVariant
    );

    if (variant) {
      variant.stock = Math.max(0, variant.stock - item.quantity);
    }

    await product.save();
  }
}

export async function POST(req: Request) {
  try {
    // 🔒 Was previously missing — this endpoint trusted whatever email
    // the client sent inside orderPayload, meaning someone could place an
    // order that looked like it belonged to a different account. Now we
    // require a real session and always use the session's own email.
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Please login before placing an order." },
        { status: 401 }
      );
    }

    const email = session.user.email;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay secret is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderPayload
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment verification details.",
        },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ---- Validate the coupon server-side, same as the COD path. This
    // runs AFTER signature verification (so we don't waste a DB lookup on
    // an unverified request) but BEFORE the order is created. ----
    const coupon = await resolveCoupon(email, orderPayload.couponCode);

    if (coupon.error) {
      return NextResponse.json(
        { success: false, message: coupon.error },
        { status: 400 }
      );
    }

    const subtotal = Number(orderPayload.subtotal) || 0;
    const shipping = Number(orderPayload.shipping) || 0;
    const discount = Math.round((subtotal * coupon.percent) / 100);
    const total = Math.max(0, subtotal - discount + shipping);

    const order = await Order.create({
      ...orderPayload,
      email,
      couponCode: coupon.code,
      discount,
      total,
      paymentMethod: "razorpay",
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      status: "Processing",
    });

    try {
      await sendOrderConfirmation(
        email,
        orderPayload.fullName,
        order._id.toString()
      );
      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: orderPayload.fullName,
        email,
        phone: orderPayload.phone,
        total,
        paymentMethod: "razorpay",
      });
    } catch (emailError) {
      console.error("Payment order email failed (order still placed):", emailError);
    }

    await reduceStock(orderPayload.items || []);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}