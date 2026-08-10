import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

import {
  sendAdminOrderNotification,
  sendOrderConfirmation,
} from "@/lib/sendEmail";

import {
  pushShipmozoOrder,
  autoAssignShipmozoOrder,
} from "@/lib/shipmozo";

type CartItem = {
  _id: string;
  selectedVariant?: string;
  quantity: number;
  isCombo?: boolean;
};

const COUPONS: Record<
  string,
  { percent: number; firstOrderOnly?: boolean }
> = {
  WELCOME10: {
    percent: 10,
    firstOrderOnly: true,
  },
  BIHAR10: {
    percent: 10,
  },
};

async function resolveCoupon(
  email: string,
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

  const coupon = COUPONS[code];

  if (!coupon) {
    return {
      code: "",
      percent: 0,
      error: "That coupon code isn't valid.",
    };
  }

  const alreadyUsed = await Order.findOne({
    email,
    couponCode: code,
  });

  if (alreadyUsed) {
    return {
      code: "",
      percent: 0,
      error: `You've already used ${code} on a previous order.`,
    };
  }

  if (coupon.firstOrderOnly) {
    const anyPriorOrder = await Order.findOne({
      email,
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

/**
 * Reserve stock atomically.
 *
 * Returns the items successfully decremented so that
 * they can be rolled back if another item is unavailable.
 */
async function reserveStock(items: CartItem[]) {
  const decrementedItems: CartItem[] = [];
  const outOfStockItems: string[] = [];

  for (const item of items || []) {
    if (!isValidObjectId(item._id)) {
      outOfStockItems.push(item._id);
      continue;
    }

    const quantity = Math.max(
      1,
      Number(item.quantity) || 1
    );

    let updatedProduct;

    if (item.isCombo) {
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item._id,
          isCombo: true,
          comboStock: {
            $gte: quantity,
          },
        },
        {
          $inc: {
            comboStock: -quantity,
          },
        },
        {
          new: true,
        }
      );
    } else {
      if (!item.selectedVariant) {
        outOfStockItems.push(item._id);
        continue;
      }

      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item._id,
          weights: {
            $elemMatch: {
              size: item.selectedVariant,
              stock: {
                $gte: quantity,
              },
            },
          },
        },
        {
          $inc: {
            "weights.$[elem].stock": -quantity,
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
      decrementedItems.push({
        ...item,
        quantity,
      });
    }
  }

  return {
    decrementedItems,
    outOfStockItems,
  };
}

/**
 * Roll back stock if order creation cannot continue.
 */
async function rollbackStock(items: CartItem[]) {
  for (const item of items) {
    const quantity = Math.max(
      1,
      Number(item.quantity) || 1
    );

    if (item.isCombo) {
      await Product.updateOne(
        {
          _id: item._id,
        },
        {
          $inc: {
            comboStock: quantity,
          },
        }
      );
    } else if (item.selectedVariant) {
      await Product.updateOne(
        {
          _id: item._id,
          "weights.size": item.selectedVariant,
        },
        {
          $inc: {
            "weights.$.stock": quantity,
          },
        }
      );
    }
  }
}

/**
 * Extract Shipmozo order ID from different possible
 * response structures.
 */
function extractShipmozoOrderId(data: any) {
  return (
    data?.order_id ||
    data?.shipmozo_order_id ||
    data?.id ||
    data?.orderId ||
    ""
  );
}

/**
 * Extract courier/AWB information from Shipmozo response.
 */
function extractShipmozoShipment(data: any) {
  return {
    courierName:
      data?.courier_name ||
      data?.courierName ||
      data?.courier ||
      "",

    trackingNumber:
      data?.awb_number ||
      data?.awb ||
      data?.tracking_number ||
      data?.trackingNumber ||
      "",

    estimatedDelivery:
      data?.estimated_delivery ||
      data?.estimatedDelivery ||
      "",
  };
}

export async function POST(req: Request) {
  try {
    // ----------------------------------------------------
    // 1. REQUIRE LOGIN
    // ----------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login before placing an order.",
        },
        {
          status: 401,
        }
      );
    }

    const email = session.user.email;

    // ----------------------------------------------------
    // 2. RAZORPAY SECRET
    // ----------------------------------------------------

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay secret is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // 3. READ REQUEST
    // ----------------------------------------------------

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
          message:
            "Missing payment verification details.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 4. VERIFY RAZORPAY SIGNATURE
    // ----------------------------------------------------

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      expectedSignature !== razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // ----------------------------------------------------
    // 5. PREVENT DUPLICATE PAYMENT ORDERS
    // ----------------------------------------------------

    const existingOrder = await Order.findOne({
      paymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: existingOrder,
        alreadyProcessed: true,
      });
    }

    // ----------------------------------------------------
    // 6. VALIDATE COUPON
    // ----------------------------------------------------

    const coupon = await resolveCoupon(
      email,
      orderPayload.couponCode
    );

    if (coupon.error) {
      return NextResponse.json(
        {
          success: false,
          message: coupon.error,
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 7. CALCULATE FINAL TOTAL
    // ----------------------------------------------------

    const subtotal =
      Number(orderPayload.subtotal) || 0;

    const shipping =
      Number(orderPayload.shipping) || 0;

    const discount = Math.round(
      (subtotal * coupon.percent) / 100
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
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 8. RESERVE STOCK
    // ----------------------------------------------------

    const {
      decrementedItems,
      outOfStockItems,
    } = await reserveStock(
      orderPayload.items || []
    );

    if (outOfStockItems.length > 0) {
      await rollbackStock(decrementedItems);

      return NextResponse.json(
        {
          success: false,
          message:
            "Some items in your cart are no longer in stock. Your payment may require refund processing.",
          outOfStockItems,
          paymentId: razorpay_payment_id,
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------------------
    // 9. CREATE PAID ORDER
    // ----------------------------------------------------

    let order;

    try {
      order = await Order.create({
        ...orderPayload,

        // Never trust email from browser.
        email,

        couponCode: coupon.code,
        discount,
        total,

        paymentMethod: "razorpay",
        paymentStatus: "Paid",

        paymentId:
          razorpay_payment_id,

        gatewayOrderId:
          razorpay_order_id,

        status: "Processing",

        // Shipmozo starts empty.
        courierName: "",
        trackingNumber: "",
        estimatedDelivery: "",
        shipmozoOrderId: "",
      });
    } catch (orderError) {
      // Order creation failed after stock reservation.
      // Restore stock.
      await rollbackStock(
        decrementedItems
      );

      throw orderError;
    }

    // ----------------------------------------------------
    // 10. SEND EMAILS
    // ----------------------------------------------------

    try {
      await sendOrderConfirmation(
        email,
        orderPayload.fullName,
        order._id.toString()
      );

      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName:
          orderPayload.fullName,
        email,
        phone: orderPayload.phone,
        total,
        paymentMethod:
          "razorpay",
      });
    } catch (emailError) {
      console.error(
        "Payment order email failed. Order still placed:",
        emailError
      );
    }

    // ----------------------------------------------------
    // 11. PUSH ORDER TO SHIPMOZO
    // ----------------------------------------------------

    try {
      console.log(
        "Sending Razorpay order to Shipmozo:",
        order._id.toString()
      );

      const shipmozoResponse =
        await pushShipmozoOrder(order);

      console.log(
        "Shipmozo push successful:",
        shipmozoResponse
      );

      const shipmozoData =
        shipmozoResponse?.data || {};

      const shipmozoOrderId =
        extractShipmozoOrderId(
          shipmozoData
        );

      if (shipmozoOrderId) {
        await Order.findByIdAndUpdate(
          order._id,
          {
            shipmozoOrderId:
              String(shipmozoOrderId),
          }
        );
      }

      // --------------------------------------------------
      // 12. AUTO ASSIGN COURIER
      // --------------------------------------------------

      if (shipmozoOrderId) {
        try {
          const assignResponse =
            await autoAssignShipmozoOrder(
              String(shipmozoOrderId)
            );

          console.log(
            "Shipmozo courier assignment successful:",
            assignResponse
          );

          const assignData =
            assignResponse?.data || {};

          const shipment =
            extractShipmozoShipment(
              assignData
            );

          await Order.findByIdAndUpdate(
            order._id,
            {
              shipmozoOrderId:
                String(shipmozoOrderId),

              courierName:
                String(
                  shipment.courierName || ""
                ),

              trackingNumber:
                String(
                  shipment.trackingNumber || ""
                ),

              estimatedDelivery:
                String(
                  shipment.estimatedDelivery ||
                    ""
                ),

              status:
                shipment.trackingNumber
                  ? "Shipped"
                  : "Processing",
            }
          );
        } catch (assignError) {
          console.error(
            "Shipmozo courier assignment failed. Order remains valid:",
            assignError
          );
        }
      }
    } catch (shipmozoError) {
      console.error(
        "Shipmozo push failed. Order remains valid:",
        shipmozoError
      );
    }

    // ----------------------------------------------------
    // 13. GET FINAL ORDER
    // ----------------------------------------------------

    const finalOrder =
      (await Order.findById(order._id)) ||
      order;

    // ----------------------------------------------------
    // 14. SUCCESS
    // ----------------------------------------------------

    return NextResponse.json({
      success: true,
      order: finalOrder,
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Payment verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}