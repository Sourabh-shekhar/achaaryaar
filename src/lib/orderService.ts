/**
 * src/lib/orderService.ts
 *
 * Real queries against YOUR Order model (src/models/Order.ts).
 * Orders are looked up by `email` (not userId) — matching how your
 * existing src/app/api/orders/route.ts already works.
 *
 * There's no custom order code field, so "order lookup by ID" matches
 * against Mongo's _id — either the full ObjectId or its last 8 hex
 * characters (a friendlier reference you can show customers, e.g. on
 * the order-success page: "Your order ref: " + order._id.toString().slice(-8).toUpperCase()).
 *
 * `status` is a free-text field in your schema (not a fixed enum), so
 * these helpers match case-insensitively against a small set of known
 * "closed" states. Adjust the CLOSED_STATUSES list below if your admin
 * panel uses different wording (e.g. "Refunded", "Returned").
 */

import { connectDB } from "./mongodb"; // matches your existing src/lib/mongodb.ts
import Order from "@/models/Order";

// Statuses that mean an order is "done" (shows up under Previous Orders)
const CLOSED_STATUSES = ["delivered", "cancelled"];

function isClosed(status: string | undefined) {
  if (!status) return false;
  return CLOSED_STATUSES.some((s) => status.toLowerCase().includes(s));
}

function shortRef(id: string) {
  return id.slice(-8).toUpperCase();
}

export async function getCurrentOrder(email: string) {
  await connectDB();
  const orders = await Order.find({ email }).sort({ createdAt: -1 }).lean();
  return orders.find((o: any) => !isClosed(o.status)) || null;
}

export async function getPreviousOrders(email: string, limit = 5) {
  await connectDB();
  const orders = await Order.find({ email }).sort({ createdAt: -1 }).lean();
  return orders.filter((o: any) => isClosed(o.status)).slice(0, limit);
}

/**
 * orderIdQuery is whatever the user typed: either a full 24-char
 * Mongo ObjectId, or the last-8-char short reference.
 */
export async function getOrderByIdQuery(email: string, orderIdQuery: string) {
  await connectDB();

  // Full ObjectId — direct lookup, still scoped to this customer's email
  if (/^[a-f0-9]{24}$/i.test(orderIdQuery)) {
    return Order.findOne({ _id: orderIdQuery, email }).lean();
  }

  // Short 8-char reference — match against the end of each order's _id
  const orders = await Order.find({ email }).lean();
  return (
    orders.find((o: any) => shortRef(o._id.toString()) === orderIdQuery.toUpperCase()) || null
  );
}

export async function cancelOrder(email: string, orderIdQuery: string) {
  await connectDB();

  const order: any = await getOrderByIdQuery(email, orderIdQuery);
  if (!order) {
    return { success: false, message: "I couldn't find that order on your account." };
  }

  if (isClosed(order.status) || order.status?.toLowerCase().includes("shipped")) {
    return {
      success: false,
      message: `This order is already "${order.status}" and can no longer be cancelled.`,
    };
  }

  await Order.updateOne({ _id: order._id }, { $set: { status: "Cancelled" } });

  return {
    success: true,
    message: `Your order (ref: ${shortRef(order._id.toString())}) has been cancelled.`,
  };
}

export { shortRef };