/**
 * src/app/api/chatbot/route.ts
 *
 * POST endpoint the ChatWidget calls.
 * Identifies the customer by session.user.email — matching how your
 * existing src/app/api/orders/route.ts already scopes orders.
 */

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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { reply: "Please log in to check your orders." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, pendingAction } = body as { message: string; pendingAction?: string };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const { intent, orderIdQuery } = detectIntent(message);

    // Multi-turn: bot previously asked "which order do you want to cancel?"
    if (pendingAction === "await_cancel_order_id") {
      const idMatch = message.match(/\b[a-f0-9]{24}\b/i) || message.match(/\b[a-f0-9]{8}\b/i);
      if (idMatch) {
        const result = await cancelOrder(email, idMatch[0]);
        return NextResponse.json({ reply: result.message, done: true });
      }
      return NextResponse.json({
        reply: "I couldn't find an order reference in that. Please share the 8-character code from your order confirmation.",
        pendingAction: "await_cancel_order_id",
      });
    }

    switch (intent) {
      case "greeting":
        return NextResponse.json({
          reply: "Hi! I can help with your orders — try 'current order', 'previous orders', or paste your order reference.",
        });

      case "current_order": {
        const order: any = await getCurrentOrder(email);
        if (!order) return NextResponse.json({ reply: "You don't have any active orders right now." });
        const ref = shortRef(order._id.toString());
        const eta = order.estimatedDelivery ? ` Expected: ${order.estimatedDelivery}.` : "";
        return NextResponse.json({
          reply: `Your order (ref: ${ref}) is "${order.status}".${eta}`,
          data: order,
        });
      }

      case "previous_orders": {
        const orders: any[] = await getPreviousOrders(email);
        if (!orders.length) return NextResponse.json({ reply: "You don't have any past orders yet." });
        const summary = orders
          .map((o) => `• ${shortRef(o._id.toString())} — ${o.status} (${new Date(o.createdAt).toLocaleDateString()})`)
          .join("\n");
        return NextResponse.json({ reply: `Here are your recent orders:\n${summary}`, data: orders });
      }

      case "order_status_by_id": {
        const order: any = await getOrderByIdQuery(email, orderIdQuery!);
        if (!order) return NextResponse.json({ reply: "I couldn't find that order on your account." });
        const ref = shortRef(order._id.toString());
        const extra = [
          order.courierName ? `Courier: ${order.courierName}.` : "",
          order.trackingNumber ? `Tracking #: ${order.trackingNumber}.` : "",
          order.estimatedDelivery ? `ETA: ${order.estimatedDelivery}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return NextResponse.json({
          reply: `Order ${ref}: ${order.status}. ${extra}`,
          data: order,
        });
      }

      case "cancel_order": {
        if (orderIdQuery) {
          const result = await cancelOrder(email, orderIdQuery);
          return NextResponse.json({ reply: result.message });
        }
        return NextResponse.json({
          reply: "Sure — which order would you like to cancel? Please share the 8-character reference from your order confirmation.",
          pendingAction: "await_cancel_order_id",
        });
      }

      case "return_order":
        return NextResponse.json({
          reply: "To start a return, go to your order in 'Previous Orders' and select 'Return', or share the order reference here.",
        });

      case "human_handoff":
        return NextResponse.json({
          reply: "Our team usually replies fastest on WhatsApp or email — pick whichever's easiest for you.",
          escalate: true,
          contact: {
            whatsapp: "https://wa.me/917561972501?text=" + encodeURIComponent("Hi, I need help with my order."),
            email: "support@achaaryaar.com",
          },
        });

      default:
        return NextResponse.json({
          reply: "I didn't quite get that. You can ask about your 'current order', 'previous orders', or share an order reference.",
        });
    }
  } catch (err) {
    console.error("Chatbot error:", err);
    return NextResponse.json({ reply: "Something went wrong. Please try again." }, { status: 500 });
  }
}