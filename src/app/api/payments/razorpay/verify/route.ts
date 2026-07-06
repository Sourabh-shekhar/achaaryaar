import crypto from "crypto";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/sendEmail";

type CartItem = {
  _id: string;
  selectedVariant: string;
  quantity: number;
};

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

    const order = await Order.create({
      ...orderPayload,
      paymentMethod: "razorpay",
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      status: "Processing",
    });

    try {
      await sendOrderConfirmation(
        orderPayload.email,
        orderPayload.fullName,
        order._id.toString()
      );
      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: orderPayload.fullName,
        email: orderPayload.email,
        phone: orderPayload.phone,
        total: orderPayload.total,
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
