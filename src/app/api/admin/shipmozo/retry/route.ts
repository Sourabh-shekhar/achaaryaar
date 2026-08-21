import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import {
  processShipmozoOrder,
} from "@/lib/processShipmozoOrder";

export async function POST(req: Request) {
  try {
    const session =
      await getServerSession(authOptions);

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

    await connectDB();

    const body = await req.json();

    const orderId = String(
      body.orderId || ""
    );

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

    const order =
      await Order.findById(orderId);

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

    if (
      order.paymentStatus !== "Paid"
    ) {
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

    if (order.shipmozoOrderId) {
      return NextResponse.json({
        success: true,
        message:
          "This order is already pushed to Shipmozo.",
        order,
        alreadyProcessed: true,
      });
    }

    console.log(
      "RETRYING OLD ORDER TO SHIPMOZO:",
      order._id.toString()
    );

    const updatedOrder =
      await processShipmozoOrder(order);

    return NextResponse.json({
      success: true,
      message:
        "Order successfully pushed to Shipmozo.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Shipmozo retry failed:",
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