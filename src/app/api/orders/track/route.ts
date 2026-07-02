import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId")?.trim();
    const contact = searchParams.get("contact")?.trim().toLowerCase();

    if (!orderId || !contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and phone or email are required.",
        },
        { status: 400 }
      );
    }

    if (!isValidObjectId(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid order ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "We could not find an order with that ID.",
        },
        { status: 404 }
      );
    }

    const normalizedPhone = String(order.phone || "").replace(/\D/g, "");
    const normalizedContact = contact.replace(/\D/g, "");
    const emailMatches = String(order.email || "").toLowerCase() === contact;
    const phoneMatches =
      normalizedPhone.length > 0 && normalizedPhone === normalizedContact;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "The contact detail does not match this order.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: String(order._id),
        fullName: order.fullName,
        city: order.city,
        pincode: order.pincode,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || "Pending",
        status: order.status || "Pending",
        total: order.total || 0,
        items: order.items || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber || "",
        courierName: order.courierName || "",
        estimatedDelivery: order.estimatedDelivery || "",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to track order.",
      },
      { status: 500 }
    );
  }
}
