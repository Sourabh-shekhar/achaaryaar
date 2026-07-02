import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendOrderConfirmation } from "@/lib/sendEmail";

// Create Order
export async function POST(req: Request) {
  try {
    await connectDB();

    // Always trust the server-side session for identity, never a client-sent
    // field — otherwise a tampered request could save an order under a
    // different user's email.
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Please login before placing an order." },
        { status: 401 }
      );
    }

    const body = await req.json();

    for (const item of body.items) {
      console.log("Item _id:", item._id);
    }

    const order = await Order.create({
      ...body,
      email: session.user.email,
      paymentStatus:
        body.paymentMethod === "cod" ? "Pending COD" : body.paymentStatus || "Pending",
    });

    await sendOrderConfirmation(
      session.user.email,
      body.fullName,
      order._id.toString()
    );

    for (const item of body.items) {
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

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}

// Fetch Orders — scoped to the logged-in user only.
// Previously this ran Order.find() with no filter at all, which would
// return every customer's orders to whoever called this endpoint.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ email: session.user.email }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}