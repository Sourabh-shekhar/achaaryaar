import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { getCoupon } from "@/lib/coupons";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/sendEmail";
import { processShipmozoOrder } from "@/lib/processShipmozoOrder";
// Source of truth for coupons — the browser is never trusted for the
// discount percentage or eligibility, only for which code the customer
// typed in. Keep this in sync with any coupon codes shown in the UI
// (currently in the checkout page's old client-side couponMap).
// Validates a coupon code for this specific customer. Returns the
// discount percent to apply (0 if no/invalid coupon), and an error
// message if the customer tried to use one they're not eligible for.
async function resolveCoupon(
  email: string,
  phone: string,
  rawCode: string | undefined
) {
  const code = (rawCode || "").trim().toUpperCase();

  if (!code) {
    return {
      code: "",
      percent: 0,
      error: null as string | null,
    };
  }

  const coupon = await getCoupon(code);

  if (!coupon) {
    return {
      code: "",
      percent: 0,
      error: "That coupon code isn't valid.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.replace(/\D/g, "").replace(/^91/, "");

  // Check if this email OR phone has already used this coupon.
  // Matches against `normalizedPhone` (not the raw, differently-formatted
  // `phone` field) so re-typing the number with different spacing/prefix
  // on a later order can't slip past this check.
  const alreadyUsed = await Order.findOne({
    $or: [
      { email: normalizedEmail, couponCode: code },
      { normalizedPhone, couponCode: code },
    ],
  });

  if (alreadyUsed) {
    return {
      code: "",
      percent: 0,
      error: `You've already used ${code} on a previous order.`,
    };
  }

  // WELCOME10 is only for the first order
  if (coupon.firstOrderOnly) {
    const anyPriorOrder = await Order.findOne({
      $or: [{ email: normalizedEmail }, { normalizedPhone }],
    });

    if (anyPriorOrder) {
      return {
        code: "",
        percent: 0,
        error: `${code} is only valid on your first order.`,
      };
    }
  }

  return {
    code,
    percent: coupon.percent,
    error: null as string | null,
  };
}

// Create Order
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before placing an order.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const email = session.user.email;

    // ----------------------------------------------------
    // STEP 0: VALIDATE COUPON SERVER-SIDE
    // ----------------------------------------------------

    const coupon = await resolveCoupon(email, body.phone, body.couponCode);

    if (coupon.error) {
      return NextResponse.json(
        {
          success: false,
          message: coupon.error,
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // STEP 1: VALIDATE & RESERVE STOCK
    // ----------------------------------------------------

    const decrementedItems: {
      _id: string;
      selectedVariant?: string;
      quantity: number;
      isCombo?: boolean;
    }[] = [];

    const outOfStockItems: string[] = [];

    for (const item of body.items || []) {
      if (!isValidObjectId(item._id)) {
        console.log("Skipped invalid _id:", item._id);
        continue;
      }

      let updatedProduct;

      if (item.isCombo) {
        // Combo products use comboStock.
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item._id,
            isCombo: true,
            comboStock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              comboStock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );
      } else {
        // Normal products use stock inside weights[].
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item._id,
            weights: {
              $elemMatch: {
                size: item.selectedVariant,
                stock: {
                  $gte: item.quantity,
                },
              },
            },
          },
          {
            $inc: {
              "weights.$[elem].stock": -item.quantity,
            },
          },
          {
            arrayFilters: [
              {
                "elem.size": item.selectedVariant,
              },
            ],
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

    // ----------------------------------------------------
    // ROLLBACK STOCK IF ANY ITEM IS OUT OF STOCK
    // ----------------------------------------------------

    if (outOfStockItems.length > 0) {
      for (const item of decrementedItems) {
        if (item.isCombo) {
          await Product.updateOne(
            {
              _id: item._id,
            },
            {
              $inc: {
                comboStock: item.quantity,
              },
            }
          );
        } else {
          await Product.updateOne(
            {
              _id: item._id,
              "weights.size": item.selectedVariant,
            },
            {
              $inc: {
                "weights.$.stock": item.quantity,
              },
            }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "Some items in your cart are no longer in stock.",
          outOfStockItems,
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------------------
    // STEP 2: CALCULATE FINAL PRICE
    // ----------------------------------------------------

const subtotal = Number(body.subtotal) || 0;
const shipping = subtotal >= 499 ? 0 : 50;
    const discount = Math.round((subtotal * coupon.percent) / 100);

    const total = Math.max(0, subtotal - discount + shipping);

    // ----------------------------------------------------
    // STEP 3: CREATE ORDER
    // ----------------------------------------------------

    // Same normalization used in resolveCoupon — stored alongside the
    // raw `phone` (kept as-is for shipping/contact) so future coupon
    // checks match reliably regardless of how the number was typed.
    const normalizedPhone = String(body.phone || "")
      .replace(/\D/g, "")
      .replace(/^91/, "");

    const order = await Order.create({
      ...body,

      // NEVER trust email from browser.
       email: email.trim().toLowerCase(),

      normalizedPhone,

      // Server-calculated coupon information.
      couponCode: coupon.code,
      discount,
      total,

     paymentStatus: "Paid",

      // Shipmozo starts with no courier/AWB.
      courierName: "",
      trackingNumber: "",
      estimatedDelivery: "",
      shipmozoOrderId: "",

      status: "Processing",
    });

    // ----------------------------------------------------
    // STEP 4: SEND CUSTOMER + ADMIN EMAIL
    // ----------------------------------------------------

    try {
      await sendOrderConfirmation(email, body.fullName, order._id.toString());

      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: body.fullName,
        email,
        phone: body.phone,
        total,
        paymentMethod: body.paymentMethod,
      });
    } catch (emailError) {
      console.error("Order email failed. Order still placed:", emailError);
    }

let finalOrder = order;

try {
  console.log(
    "Processing Shipmozo order:",
    order._id.toString()
  );

  finalOrder = await processShipmozoOrder(order);

  console.log(
    "Shipmozo order processed successfully:",
    {
      orderId: finalOrder._id?.toString(),
      shipmozoOrderId: finalOrder.shipmozoOrderId,
      courierName: finalOrder.courierName,
      trackingNumber: finalOrder.trackingNumber,
      status: finalOrder.status,
      shippingStatus: finalOrder.shippingStatus,
    }
  );
} catch (shipmozoError) {
  // Shipmozo failure must NOT cancel the customer's order.
  console.error(
    "Shipmozo processing failed:",
    shipmozoError
  );

  await Order.findByIdAndUpdate(order._id, {
    status: "Processing",
    shippingStatus: "Pending",
  });

  finalOrder =
    (await Order.findById(order._id)) || order;

    // ----------------------------------------------------
// STEP 6: RETURN SUCCESS
// ----------------------------------------------------

}
    return NextResponse.json({
      success: true,
      order: finalOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}

// ----------------------------------------------------
// FETCH ORDERS
// ----------------------------------------------------
// Admin sees ALL orders.
// Customer sees only their own orders.

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    // Get the role added by your NextAuth session callback.
    const user = session.user as typeof session.user & {
      role?: string;
    };

    let orders;

    // ADMIN: Fetch every customer's order.
    if (user.role === "admin") {
      orders = await Order.find({})
        .sort({
          createdAt: -1,
        })
        .lean();
    }

    // CUSTOMER: Fetch only their own orders.
    else {
      if (!session.user.email) {
        return NextResponse.json(
          {
            success: false,
            message: "User email not found.",
          },
          {
            status: 400,
          }
        );
      }

      orders = await Order.find({
        email: session.user.email
          .trim()
          .toLowerCase(),
      })
        .sort({
          createdAt: -1,
        })
        .lean();
    }

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}
