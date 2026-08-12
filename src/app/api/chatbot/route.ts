import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { detectIntent } from "@/lib/intentHandler";
import {
  getCurrentOrder,
  getPreviousOrders,
  getOrderByIdQuery,
  cancelOrder,
  shortRef,
} from "@/lib/orderService";

type OrderAction =
  | "view_current"
  | "view_previous"
  | "view_order"
  | "track_order"
  | "cancel_order";

function serializeOrder(order: any) {
  return {
    id: order._id?.toString(),
    reference: shortRef(order._id?.toString() || ""),
    status: order.status || "Processing",
    shippingStatus: order.shippingStatus || "",
    courierName: order.courierName || "",
    trackingNumber: order.trackingNumber || "",
    estimatedDelivery: order.estimatedDelivery || "",
    createdAt: order.createdAt || null,
    total: order.total ?? null,
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          name: item.name || item.productName || "Product",
          quantity: item.quantity || 1,
          image: item.image || item.productImage || "",
          price: item.price ?? null,
        }))
      : [],
  };
}

function isClosedStatus(status?: string) {
  const value = String(status || "").toLowerCase();

  return [
    "delivered",
    "cancelled",
    "canceled",
    "returned",
    "refunded",
  ].some((item) => value.includes(item));
}

function isShippedStatus(status?: string) {
  const value = String(status || "").toLowerCase();

  return (
    value.includes("shipped") ||
    value.includes("dispatch") ||
    value.includes("transit") ||
    value.includes("out for delivery")
  );
}

function canCancelOrder(order: any) {
  if (isClosedStatus(order.status)) return false;
  if (isShippedStatus(order.status)) return false;
  if (order.trackingNumber) return false;

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    const body = await req.json();

    const {
      message,
      pendingAction,
      selectedOrderId,
      selectedAction,
    } = body as {
      message?: string;
      pendingAction?: string;
      selectedOrderId?: string;
      selectedAction?: OrderAction;
    };

    if (!email) {
      return NextResponse.json({
        reply:
          "Please log in to access your orders. Once you log in, I can automatically show your orders here.",
        requiresLogin: true,
      });
    }

    /*
     * PREMIUM ORDER CARD ACTIONS
     *
     * The frontend sends the real MongoDB order ID when
     * the customer clicks an order card.
     *
     * The service always verifies:
     * _id + logged-in customer email
     */

    if (selectedOrderId && selectedAction) {
      const order: any = await getOrderByIdQuery(
        email,
        selectedOrderId
      );

      if (!order) {
        return NextResponse.json({
          reply: "I couldn't find that order on your account.",
        });
      }

      const ref = shortRef(order._id.toString());

      if (selectedAction === "view_order") {
        const details = [
          `Order ${ref}`,
          `Status: ${order.status || "Processing"}`,
          order.shippingStatus
            ? `Shipping: ${order.shippingStatus}`
            : "",
          order.estimatedDelivery
            ? `Expected delivery: ${order.estimatedDelivery}`
            : "",
          order.courierName
            ? `Courier: ${order.courierName}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        return NextResponse.json({
          reply: details,
          order: serializeOrder(order),
          orderActions: {
            canTrack: true,
            canCancel: canCancelOrder(order),
          },
        });
      }

      if (selectedAction === "track_order") {
        const details = [
          `Order ${ref} is currently ${order.status || "Processing"}.`,
          order.shippingStatus
            ? `Shipping status: ${order.shippingStatus}.`
            : "",
          order.courierName
            ? `Courier: ${order.courierName}.`
            : "",
          order.trackingNumber
            ? `Tracking/AWB: ${order.trackingNumber}.`
            : "Tracking information has not been assigned yet.",
          order.estimatedDelivery
            ? `Expected delivery: ${order.estimatedDelivery}.`
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return NextResponse.json({
          reply: details,
          order: serializeOrder(order),
        });
      }

      if (selectedAction === "cancel_order") {
        const result = await cancelOrder(
          email,
          selectedOrderId
        );

        return NextResponse.json({
          reply: result.message,
          cancelled: result.success,
        });
      }
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const { intent, orderIdQuery } = detectIntent(message);

    /*
     * BACKWARD COMPATIBILITY
     *
     * If a customer manually enters an old order reference,
     * this still works.
     */
    if (pendingAction === "await_cancel_order_id") {
      const idMatch =
        message.match(/\b[a-f0-9]{24}\b/i) ||
        message.match(/\b[a-f0-9]{8}\b/i);

      if (idMatch) {
        const result = await cancelOrder(
          email,
          idMatch[0]
        );

        return NextResponse.json({
          reply: result.message,
          done: true,
        });
      }

      return NextResponse.json({
        reply:
          "Please select one of your orders below.",
        pendingAction: "await_cancel_order_selection",
      });
    }

    switch (intent) {
      case "greeting":
        return NextResponse.json({
          reply:
            "Hi! 👋 I can help you manage your orders. Choose an option below, and I'll automatically show orders linked to your account.",
        });

      /*
       * CURRENT ORDERS
       *
       * No reference number required.
       */
      case "current_order": {
        const order: any = await getCurrentOrder(email);

        if (!order) {
          return NextResponse.json({
            reply:
              "You don't have any active orders right now.",
            orders: [],
          });
        }

        return NextResponse.json({
          reply:
            "Here is your current order. You can view details, track it, or cancel it if eligible.",
          orders: [serializeOrder(order)],
          orderActions: {
            canTrack: true,
            canCancel: canCancelOrder(order),
          },
        });
      }

      /*
       * PREVIOUS ORDERS
       *
       * Automatically scoped to logged-in customer.
       */
      case "previous_orders": {
        const orders: any[] = await getPreviousOrders(
          email,
          10
        );

        if (!orders.length) {
          return NextResponse.json({
            reply:
              "You don't have any previous orders yet.",
            orders: [],
          });
        }

        return NextResponse.json({
          reply:
            "Here are your recent previous orders. Select any order to view its details.",
          orders: orders.map(serializeOrder),
        });
      }

      /*
       * Manual reference still supported.
       */
      case "order_status_by_id": {
        if (!orderIdQuery) {
          const order: any = await getCurrentOrder(email);

          if (!order) {
            return NextResponse.json({
              reply:
                "I couldn't find an active order on your account.",
            });
          }

          return NextResponse.json({
            reply:
              "Here is your latest active order.",
            orders: [serializeOrder(order)],
            orderActions: {
              canTrack: true,
              canCancel: canCancelOrder(order),
            },
          });
        }

        const order: any = await getOrderByIdQuery(
          email,
          orderIdQuery
        );

        if (!order) {
          return NextResponse.json({
            reply:
              "I couldn't find that order on your account.",
          });
        }

        return NextResponse.json({
          reply: `Here are the details for order ${shortRef(
            order._id.toString()
          )}.`,
          orders: [serializeOrder(order)],
          orderActions: {
            canTrack: true,
            canCancel: canCancelOrder(order),
          },
        });
      }

      /*
       * CANCEL ORDER
       *
       * Instead of asking for a reference, show eligible orders.
       */
      case "cancel_order": {
        if (orderIdQuery) {
          const result = await cancelOrder(
            email,
            orderIdQuery
          );

          return NextResponse.json({
            reply: result.message,
          });
        }

        const currentOrder: any =
          await getCurrentOrder(email);

        if (!currentOrder) {
          return NextResponse.json({
            reply:
              "You don't have any active orders available to cancel.",
            orders: [],
          });
        }

        if (canCancelOrder(currentOrder)) {
          return NextResponse.json({
            reply:
              "Select the order below if you want to cancel it.",
            orders: [serializeOrder(currentOrder)],
            orderActions: {
              canCancel: true,
            },
          });
        }

        return NextResponse.json({
          reply: `Your current order is "${currentOrder.status}" and can no longer be cancelled.`,
          orders: [serializeOrder(currentOrder)],
        });
      }

      case "return_order": {
        const orders: any[] = await getPreviousOrders(
          email,
          10
        );

        if (!orders.length) {
          return NextResponse.json({
            reply:
              "I couldn't find any delivered or previous orders available for a return request.",
          });
        }

        return NextResponse.json({
          reply:
            "Select the order you need help returning.",
          orders: orders.map(serializeOrder),
        });
      }

      case "human_handoff":
        return NextResponse.json({
          reply:
            "Our support team is ready to help. Choose WhatsApp or email.",
          escalate: true,
          contact: {
            whatsapp:
              "https://wa.me/917561972501?text=" +
              encodeURIComponent(
                "Hi, I need help with my AchaarYaar order."
              ),
            email: "support@achaaryaar.com",
          },
        });

      default:
        return NextResponse.json({
          reply:
            "I can help with your orders. Try Current order, Previous orders, Cancel order, or Talk to an agent.",
        });
    }
  } catch (err) {
    console.error("Chatbot error:", err);

    return NextResponse.json(
      {
        reply:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}