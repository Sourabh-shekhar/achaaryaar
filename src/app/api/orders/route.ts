import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    console.log("POST /api/orders called");

    await connectDB();

    const body = await req.json();
    console.log("Received Data:", body);

    const order = await Order.create(body);
    console.log("Order Saved:", order);

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