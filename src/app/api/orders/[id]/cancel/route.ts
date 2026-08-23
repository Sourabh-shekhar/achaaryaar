import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

import { cancelShipmozoOrder } from "@/lib/shipmozo";

export async function POST(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ----------------------------------------------------
    // 1. REQUIRE LOGIN
    // ----------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before cancelling an order.",
        },
        { status: 401 }
      );
    }

    // ----------------------------------------------------
    // 2. GET + VALIDATE ORDER ID
    // ----------------------------------------------------

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ----------------------------------------------------
    // 3. FIND ORDER
    // ----------------------------------------------------

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // ----------------------------------------------------
    // 4. SECURITY
    // ----------------------------------------------------
    // Customer can cancel ONLY their own order.

    const sessionEmail = String(session.user.email)
      .trim()
      .toLowerCase();

    const orderEmail = String(order.email || "")
      .trim()
      .toLowerCase();

    if (!orderEmail || sessionEmail !== orderEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to cancel this order.",
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------
    // 5. NORMALIZE STATUS
    // ----------------------------------------------------

    const currentStatus = String(order.status || "")
      .trim()
      .toLowerCase();

    const shippingStatus = String(order.shippingStatus || "")
      .trim()
      .toLowerCase();

    // ----------------------------------------------------
    // 6. ALLOWED CUSTOMER CANCELLATION STATUS
    // ----------------------------------------------------
    //
    // Customer can cancel while the order is still
    // Processing.
    //
    // Once it has been shipped / dispatched / out for
    // delivery, cancellation is no longer allowed.
    //
    // This also means a newly-created Shipmozo order
    // can still be cancelled BEFORE an AWB is assigned.
    // ----------------------------------------------------

    const allowedStatuses = [
      "processing",
    ];

    const blockedStatuses = [
      "shipped",
      "out for delivery",
      "out_for_delivery",
      "dispatched",
      "delivered",
      "returned",
      "completed",
      "cancelled",
      "cancellationpending",
      "refundpending",
      "cancelledstockreview",
    ];

    if (blockedStatuses.includes(currentStatus)) {
      let message = "This order cannot be cancelled.";

      if (currentStatus === "cancelled") {
        message = "This order has already been cancelled.";
      } else if (currentStatus === "shipped") {
        message = "This order has already been shipped and cannot be cancelled.";
      } else if (
        currentStatus === "out for delivery" ||
        currentStatus === "out_for_delivery"
      ) {
        message =
          "This order is out for delivery and cannot be cancelled.";
      } else if (currentStatus === "delivered") {
        message = "A delivered order cannot be cancelled.";
      } else if (currentStatus === "returned") {
        message = "A returned order cannot be cancelled.";
      } else if (currentStatus === "completed") {
        message = "A completed order cannot be cancelled.";
      } else if (currentStatus === "cancellationpending") {
        message = "This order is already being cancelled.";
      } else if (currentStatus === "refundpending") {
        message = "This order is already being refunded.";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------
    // 7. SHIPPING STATUS CHECK
    // ----------------------------------------------------
    //
    // Even if the main order status has not been updated
    // yet, do not allow cancellation if shipping has
    // already progressed.
    // ----------------------------------------------------

    const blockedShippingStatuses = [
      "shipped",
      "out for delivery",
      "out_for_delivery",
      "dispatched",
      "delivered",
      "returned",
    ];

    if (blockedShippingStatuses.includes(shippingStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order has already entered shipping and cannot be cancelled.",
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------
    // 8. ONLY PROCESSING ORDERS CAN BE CANCELLED
    // ----------------------------------------------------

    if (!allowedStatuses.includes(currentStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order can no longer be cancelled.",
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------
    // 9. LOCK ORDER
    // ----------------------------------------------------
    //
    // This prevents two cancellation requests from
    // simultaneously:
    //
    // - refunding twice
    // - restoring stock twice
    // - cancelling Shipmozo twice
    //
    // IMPORTANT:
    // We allow Processing orders even if Shipmozo already
    // has an order ID but does not yet have an AWB.
    // ----------------------------------------------------

    const lockedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        email: sessionEmail,
        status: {
          $in: ["Processing", "processing"],
        },
      },
      {
        $set: {
          status: "CancellationPending",
        },
      },
      {
        new: true,
      }
    );

    if (!lockedOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order is already being cancelled or can no longer be cancelled.",
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------
    // 10. SHIPMOZO CANCELLATION
    // ----------------------------------------------------
    //
    // There are 3 possibilities:
    //
    // A. No Shipmozo order yet
    //    -> nothing to cancel
    //
    // B. Shipmozo order exists but NO AWB yet
    //    -> do NOT call cancel API because your current
    //       cancelShipmozoOrder requires an AWB.
    //    -> continue with customer cancellation/refund.
    //
    // C. Shipmozo order + AWB exist
    //    -> cancel shipment first.
    // ----------------------------------------------------

    const shipmozoOrderId = String(
      lockedOrder.shipmozoOrderId || ""
    ).trim();

    const trackingNumber = String(
      lockedOrder.trackingNumber || ""
    ).trim();

    let shipmentCancelled = false;

    if (shipmozoOrderId && trackingNumber) {
      try {
        console.log(
          "Cancelling Shipmozo shipment:",
          {
            shipmozoOrderId,
            trackingNumber,
          }
        );

        const cancelResponse = await cancelShipmozoOrder(
          shipmozoOrderId,
        
        );

        console.log(
          "Shipmozo cancellation successful:",
          cancelResponse
        );

        shipmentCancelled = true;
      } catch (shipmozoError) {
        console.error(
          "Shipmozo cancellation failed:",
          shipmozoError
        );

        await Order.findByIdAndUpdate(id, {
          status: "Processing",
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "The courier shipment could not be cancelled. No refund was initiated.",
          },
          { status: 502 }
        );
      }
    } else if (shipmozoOrderId && !trackingNumber) {
      console.log(
        "Shipmozo order exists but AWB is not assigned yet. Continuing customer cancellation."
      );
    }

    // ----------------------------------------------------
    // 11. RAZORPAY REFUND
    // ----------------------------------------------------
    //
    // PREPAID:
    //    paymentStatus = Paid
    //    paymentId exists
    //    -> refund total amount
    //
    // COD:
    //    no refund required because customer has not
    //    paid yet.
    // ----------------------------------------------------

    const paymentId = String(
      lockedOrder.paymentId || ""
    ).trim();

    const paymentStatus = String(
      lockedOrder.paymentStatus || ""
    )
      .trim()
      .toLowerCase();

    let refundId = "";

    const isPaid =
      paymentId &&
      paymentStatus === "paid";

    if (isPaid) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        console.error(
          "Razorpay keys are missing."
        );

        await Order.findByIdAndUpdate(id, {
          status: "Processing",
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Razorpay refund could not be started because payment credentials are missing.",
          },
          { status: 500 }
        );
      }

      try {
        const auth = Buffer.from(
          `${keyId}:${keySecret}`
        ).toString("base64");

        // Razorpay expects amount in paise.
        const refundAmount = Math.round(
          Number(lockedOrder.total || 0) * 100
        );

        if (refundAmount <= 0) {
          throw new Error(
            "Invalid refund amount."
          );
        }

        console.log(
          "Starting Razorpay refund:",
          {
            paymentId,
            refundAmount,
          }
        );

        const refundResponse = await fetch(
          `https://api.razorpay.com/v1/payments/${encodeURIComponent(
            paymentId
          )}/refund`,
          {
            method: "POST",

            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              amount: refundAmount,

              notes: {
                reason:
                  "Customer cancelled order",

                order_id:
                  lockedOrder._id.toString(),
              },
            }),

            cache: "no-store",
          }
        );

        const refundData =
          await refundResponse.json();

        if (!refundResponse.ok) {
          console.error(
            "Razorpay refund failed:",
            refundData
          );

          throw new Error(
            refundData?.error?.description ||
              "Razorpay refund failed."
          );
        }

        refundId = String(
          refundData?.id || ""
        );

        if (!refundId) {
          throw new Error(
            "Razorpay did not return a refund ID."
          );
        }

        console.log(
          "Razorpay refund successful:",
          refundId
        );
      } catch (refundError) {
        console.error(
          "Razorpay refund error:",
          refundError
        );

        // Shipment may already have been cancelled.
        // Do NOT restore stock and call the order fully
        // cancelled if the customer's money has not been
        // refunded.
        await Order.findByIdAndUpdate(id, {
          status: "RefundPending",
          shippingStatus: shipmentCancelled
            ? "Cancelled"
            : lockedOrder.shippingStatus,
        });

        return NextResponse.json(
          {
            success: false,
            message:
              shipmentCancelled
                ? "The shipment was cancelled, but the payment refund could not be created automatically. Please process the refund from Razorpay."
                : "The payment refund could not be created automatically. No stock was restored.",
            orderId: id,
          },
          { status: 502 }
        );
      }
    }

    // ----------------------------------------------------
    // 12. RESTORE PRODUCT STOCK
    // ----------------------------------------------------
    //
    // Normal product:
    //    weights[].stock
    //
    // Combo:
    //    comboStock
    //
    // Stock is restored ONLY after:
    // - Shipmozo cancellation succeeded OR was not needed
    // - Razorpay refund succeeded OR order was COD
    // ----------------------------------------------------

    try {
      const items = Array.isArray(
        lockedOrder.items
      )
        ? lockedOrder.items
        : [];

      for (const item of items) {
        const quantity = Math.max(
          1,
          Number(item?.quantity || 1)
        );

        const productId =
          item?._id ||
          item?.productId;

        if (!isValidObjectId(productId)) {
          console.warn(
            "Skipping invalid product ID during stock restoration:",
            productId
          );

          continue;
        }

        // ----------------------------------------------
        // COMBO
        // ----------------------------------------------

        if (item?.isCombo) {
          await Product.updateOne(
            {
              _id: productId,
            },
            {
              $inc: {
                comboStock: quantity,
              },
            }
          );

          console.log(
            "Restored combo stock:",
            {
              productId,
              quantity,
            }
          );

          continue;
        }

        // ----------------------------------------------
        // NORMAL PRODUCT
        // ----------------------------------------------

        const selectedVariant = String(
          item?.selectedVariant || ""
        ).trim();

        if (!selectedVariant) {
          console.warn(
            "Skipping normal product without selectedVariant:",
            productId
          );

          continue;
        }

        const stockResult =
          await Product.updateOne(
            {
              _id: productId,
              "weights.size":
                selectedVariant,
            },
            {
              $inc: {
                "weights.$.stock":
                  quantity,
              },
            }
          );

        console.log(
          "Restored product stock:",
          {
            productId,
            selectedVariant,
            quantity,
            modified:
              stockResult.modifiedCount,
          }
        );
      }
    } catch (stockError) {
      console.error(
        "Stock restoration failed:",
        stockError
      );

      // Payment has already been refunded and/or COD
      // did not need a refund.
      //
      // Do NOT hide this problem.
      await Order.findByIdAndUpdate(id, {
        status: "CancelledStockReview",
        shippingStatus:
          shipmentCancelled
            ? "Cancelled"
            : lockedOrder.shippingStatus,

        paymentStatus:
          isPaid && refundId
            ? "Refunded"
            : lockedOrder.paymentStatus,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "The order was cancelled and payment was handled, but stock restoration needs review.",
          refundId:
            refundId || null,
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------
    // 13. FINAL ORDER UPDATE
    // ----------------------------------------------------

    const finalOrder =
      await Order.findByIdAndUpdate(
        id,
        {
          status: "Cancelled",

          shippingStatus:
            shipmentCancelled
              ? "Cancelled"
              : "Cancelled",

          paymentStatus:
            isPaid && refundId
              ? "Refunded"
              : lockedOrder.paymentStatus,

          courierName:
            lockedOrder.courierName || "",

          trackingNumber:
            lockedOrder.trackingNumber || "",

          estimatedDelivery:
            lockedOrder.estimatedDelivery || "",
        },
        {
          new: true,
        }
      );

    if (!finalOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order could not be updated after cancellation.",
          refundId:
            refundId || null,
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------
    // 14. SUCCESS
    // ----------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Order cancelled successfully.",

      order: finalOrder,

      refundId:
        refundId || null,

      refundProcessed:
        Boolean(refundId),

      shipmentCancelled:
        shipmentCancelled,
    });
  } catch (error) {
    console.error(
      "Order cancellation error:",
      error
    );

    // ----------------------------------------------------
    // 15. ROLLBACK TEMPORARY LOCK
    // ----------------------------------------------------

    try {
      const { id } =
        await context.params;

      if (isValidObjectId(id)) {
        await connectDB();

        await Order.updateOne(
          {
            _id: id,
            status:
              "CancellationPending",
          },
          {
            $set: {
              status:
                "Processing",
            },
          }
        );
      }
    } catch (rollbackError) {
      console.error(
        "Cancellation status rollback failed:",
        rollbackError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to cancel order.",
      },
      { status: 500 }
    );
  }
}