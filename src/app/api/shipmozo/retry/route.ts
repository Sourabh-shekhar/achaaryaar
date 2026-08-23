import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { processShipmozoOrder } from "@/lib/processShipmozoOrder";

export async function POST(req: Request) {
  try {
    // --------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------
    // CONNECT DATABASE
    // --------------------------------------------

    await connectDB();

    // --------------------------------------------
    // GET ORDER ID
    // --------------------------------------------

    const body = await req.json();

    const orderId = String(body.orderId || "");

    if (!isValidObjectId(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------
    // FIND ORDER
    // --------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------
    // ONLY PAID ORDERS
    // --------------------------------------------

    if (order.paymentStatus !== "Paid") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only paid orders can be pushed to Shipmozo.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------
    // PREVENT DUPLICATE PUSH
    // --------------------------------------------

    if (order.shipmozoOrderId) {
      return NextResponse.json({
        success: true,
        message:
          "This order is already pushed to Shipmozo.",
        order,
        alreadyProcessed: true,
      });
    }

    // --------------------------------------------
    // PUSH OLD ORDER TO SHIPMOZO
    // --------------------------------------------

    console.log(
      "RETRYING ORDER TO SHIPMOZO:",
      order._id.toString()
    );

    const updatedOrder =
      await processShipmozoOrder(order);

    console.log(
      "ORDER SUCCESSFULLY PUSHED TO SHIPMOZO:",
      updatedOrder._id.toString()
    );

    return NextResponse.json({
      success: true,
      message:
        "Order successfully pushed to Shipmozo.",
      order: updatedOrder,
      alreadyProcessed: false,
    });
  } catch (error) {
    console.error(
      "SHIPMOZO RETRY FAILED:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to push order to Shipmozo.",
      },
      {
        status: 500,
      }
    );
  }
}