import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/sendEmail";

// Create Order
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Please login before placing an order." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ---- STEP 1: Validate & reserve stock BEFORE creating the order ----
    // We do this first, atomically per item, so an out-of-stock item
    // blocks the order instead of silently going through.
    const decrementedItems: { _id: string; selectedVariant?: string; quantity: number; isCombo?: boolean }[] = [];
    const outOfStockItems: string[] = [];

    for (const item of body.items) {
      if (!isValidObjectId(item._id)) {
        console.log("Skipped invalid _id:", item._id);
        continue;
      }

      let updatedProduct;

      if (item.isCombo) {
        // Combo products track stock on comboStock, not weights[].
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item._id,
            isCombo: true,
            comboStock: { $gte: item.quantity },
          },
          { $inc: { comboStock: -item.quantity } },
          { new: true }
        );
      } else {
        // Regular products track stock per weight variant (e.g. "225g").
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item._id,
            weights: {
              $elemMatch: {
                size: item.selectedVariant,
                stock: { $gte: item.quantity },
              },
            },
          },
          { $inc: { "weights.$[elem].stock": -item.quantity } },
          {
            arrayFilters: [{ "elem.size": item.selectedVariant }],
            new: true,
          }
        );
      }

      if (!updatedProduct) {
        outOfStockItems.push(item._id);
      } else {
        decrementedItems.push(item);
      }
    }

    // If anything was out of stock, roll back everything we already
    // decremented in this loop, and reject the whole order.
    if (outOfStockItems.length > 0) {
      for (const item of decrementedItems) {
        if (item.isCombo) {
          await Product.updateOne(
            { _id: item._id },
            { $inc: { comboStock: item.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: item._id, "weights.size": item.selectedVariant },
            { $inc: { "weights.$.stock": item.quantity } }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "Some items in your cart are no longer in stock.",
          outOfStockItems,
        },
        { status: 409 }
      );
    }

    // ---- STEP 2: Stock is confirmed and reserved — now create the order ----
    const order = await Order.create({
      ...body,
      email: session.user.email,
      paymentStatus:
        body.paymentMethod === "cod" ? "Pending COD" : body.paymentStatus || "Pending",
    });

    // Email is "best effort" — if it fails, the order itself must still succeed.
    try {
      await sendOrderConfirmation(
        session.user.email,
        body.fullName,
        order._id.toString()
      );
      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: body.fullName,
        email: session.user.email,
        phone: body.phone,
        total: body.total,
        paymentMethod: body.paymentMethod,
      });
    } catch (emailError) {
      console.error("Order email failed (order still placed):", emailError);
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