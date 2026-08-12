/**
 * src/lib/orderService.ts
 *
 * Order service for AchaarYaar chatbot.
 *
 * Uses:
 * - customer email
 * - MongoDB Order model
 * - Shipmozo information saved inside Order
 *
 * Supports:
 * - Current order
 * - Previous orders
 * - Order lookup by full Mongo ObjectId
 * - Order lookup by last 8 characters
 * - Tracking information
 * - Delivery information
 * - Payment information
 * - Cancellation
 */

import { connectDB } from "./mongodb";
import Order from "@/models/Order";

/**
 * --------------------------------------------------------
 * CLOSED ORDER STATUSES
 * --------------------------------------------------------
 */

const CLOSED_STATUSES = [
  "delivered",
  "cancelled",
  "canceled",
  "returned",
  "refunded",
];

/**
 * --------------------------------------------------------
 * HELPERS
 * --------------------------------------------------------
 */

function normalizeStatus(
  status: string | undefined
) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isClosed(
  status: string | undefined
) {
  const normalized = normalizeStatus(status);

  return CLOSED_STATUSES.some((closed) =>
    normalized.includes(closed)
  );
}

function isShipped(
  status: string | undefined
) {
  const normalized = normalizeStatus(status);

  return (
    normalized.includes("shipped") ||
    normalized.includes("dispatch") ||
    normalized.includes("transit")
  );
}

function shortRef(id: string) {
  return id
    .slice(-8)
    .toUpperCase();
}

/**
 * --------------------------------------------------------
 * CURRENT ORDER
 * --------------------------------------------------------
 */

export async function getCurrentOrder(
  email: string
) {
  await connectDB();

  const orders = await Order.find({
    email,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return (
    orders.find(
      (order: any) =>
        !isClosed(order.status)
    ) || null
  );
}

/**
 * --------------------------------------------------------
 * PREVIOUS ORDERS
 * --------------------------------------------------------
 */

export async function getPreviousOrders(
  email: string,
  limit = 5
) {
  await connectDB();

  const orders = await Order.find({
    email,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return orders
    .filter((order: any) =>
      isClosed(order.status)
    )
    .slice(0, limit);
}

/**
 * --------------------------------------------------------
 * FIND ORDER BY ID / SHORT REFERENCE
 * --------------------------------------------------------
 *
 * Supports:
 *
 * Full:
 * 6a7a16e55eef5a18d1680266
 *
 * Short:
 * 1680266
 *
 * Actually the short reference is always the
 * last 8 characters.
 */

export async function getOrderByIdQuery(
  email: string,
  orderIdQuery: string
) {
  await connectDB();

  const query =
    String(orderIdQuery || "")
      .trim();

  /**
   * Full Mongo ObjectId
   */
  if (
    /^[a-f0-9]{24}$/i.test(query)
  ) {
    return Order.findOne({
      _id: query,
      email,
    }).lean();
  }

  /**
   * Short 8-character reference
   */
  if (
    /^[a-f0-9]{8}$/i.test(query)
  ) {
    const orders =
      await Order.find({
        email,
      }).lean();

    return (
      orders.find(
        (order: any) =>
          shortRef(
            order._id.toString()
          ) === query.toUpperCase()
      ) || null
    );
  }

  return null;
}

/**
 * --------------------------------------------------------
 * TRACKING INFORMATION
 * --------------------------------------------------------
 */

export async function getTrackingInfo(
  email: string,
  orderIdQuery?: string
) {
  await connectDB();

  let order: any = null;

  /**
   * If customer supplied an order reference,
   * use that exact order.
   */
  if (orderIdQuery) {
    order =
      await getOrderByIdQuery(
        email,
        orderIdQuery
      );
  }

  /**
   * Otherwise use the current/latest active order.
   */
  if (!order) {
    order =
      await getCurrentOrder(email);
  }

  if (!order) {
    return {
      success: false,
      message:
        "I couldn't find an active order on your account.",
    };
  }

  const ref = shortRef(
    order._id.toString()
  );

  const trackingNumber =
    order.trackingNumber || "";

  const courierName =
    order.courierName || "";

  const shippingStatus =
    order.shippingStatus || "";

  const estimatedDelivery =
    order.estimatedDelivery || "";

  const orderStatus =
    order.status || "Processing";

  /**
   * Build a friendly response.
   */

  const details: string[] = [];

  details.push(
    `Order ${ref} is currently "${orderStatus}".`
  );

  if (shippingStatus) {
    details.push(
      `Shipping status: ${shippingStatus}.`
    );
  }

  if (courierName) {
    details.push(
      `Courier: ${courierName}.`
    );
  }

  if (trackingNumber) {
    details.push(
      `Tracking/AWB number: ${trackingNumber}.`
    );
  }

  if (estimatedDelivery) {
    details.push(
      `Estimated delivery: ${estimatedDelivery}.`
    );
  }

  /**
   * If Shipmozo has not assigned an AWB yet.
   */

  if (!trackingNumber) {
    details.push(
      "The courier/AWB has not been assigned yet. Please check again shortly."
    );
  }

  return {
    success: true,

    message:
      details.join(" "),

    order,
  };
}

/**
 * --------------------------------------------------------
 * DELIVERY INFORMATION
 * --------------------------------------------------------
 */

export async function getDeliveryInfo(
  email: string,
  orderIdQuery?: string
) {
  await connectDB();

  let order: any = null;

  if (orderIdQuery) {
    order =
      await getOrderByIdQuery(
        email,
        orderIdQuery
      );
  }

  if (!order) {
    order =
      await getCurrentOrder(email);
  }

  if (!order) {
    return {
      success: false,
      message:
        "I couldn't find an active order on your account.",
    };
  }

  const ref = shortRef(
    order._id.toString()
  );

  const status =
    order.status || "Processing";

  const eta =
    order.estimatedDelivery || "";

  const tracking =
    order.trackingNumber || "";

  const courier =
    order.courierName || "";

  let message =
    `Order ${ref} is currently "${status}".`;

  if (courier) {
    message +=
      ` Your courier is ${courier}.`;
  }

  if (tracking) {
    message +=
      ` Your tracking/AWB number is ${tracking}.`;
  }

  if (eta) {
    message +=
      ` Estimated delivery: ${eta}.`;
  } else {
    message +=
      " An estimated delivery date is not available yet.";
  }

  return {
    success: true,
    message,
    order,
  };
}

/**
 * --------------------------------------------------------
 * PAYMENT INFORMATION
 * --------------------------------------------------------
 */

export async function getPaymentInfo(
  email: string,
  orderIdQuery?: string
) {
  await connectDB();

  let order: any = null;

  if (orderIdQuery) {
    order =
      await getOrderByIdQuery(
        email,
        orderIdQuery
      );
  }

  if (!order) {
    order =
      await getCurrentOrder(email);
  }

  if (!order) {
    return {
      success: false,
      message:
        "I couldn't find an order on your account.",
    };
  }

  const ref = shortRef(
    order._id.toString()
  );

  const paymentStatus =
    order.paymentStatus ||
    "Unknown";

  const paymentMethod =
    order.paymentMethod ||
    "Unknown";

  const paymentId =
    order.paymentId || "";

  const total =
    typeof order.total === "number"
      ? `₹${order.total}`
      : "";

  let message =
    `Order ${ref} payment status: ${paymentStatus}.`;

  if (paymentMethod) {
    message +=
      ` Payment method: ${paymentMethod}.`;
  }

  if (total) {
    message +=
      ` Order total: ${total}.`;
  }

  if (paymentId) {
    message +=
      ` Payment ID: ${paymentId}.`;
  }

  return {
    success: true,
    message,
    order,
  };
}

/**
 * --------------------------------------------------------
 * CANCEL ORDER
 * --------------------------------------------------------
 */

export async function cancelOrder(
  email: string,
  orderIdQuery: string
) {
  await connectDB();

  const order: any =
    await getOrderByIdQuery(
      email,
      orderIdQuery
    );

  if (!order) {
    return {
      success: false,
      message:
        "I couldn't find that order on your account.",
    };
  }

  const status =
    normalizeStatus(order.status);

  /**
   * Already closed
   */
  if (isClosed(order.status)) {
    return {
      success: false,
      message:
        `This order is already "${order.status}" and can no longer be cancelled.`,
    };
  }

  /**
   * Already shipped
   */
  if (isShipped(order.status)) {
    return {
      success: false,
      message:
        `This order is already "${order.status}" and can no longer be cancelled.`,
    };
  }

  /**
   * Already has AWB
   */
  if (order.trackingNumber) {
    return {
      success: false,
      message:
        "This order has already been assigned a tracking number and can no longer be cancelled through the chatbot.",
    };
  }

  await Order.updateOne(
    {
      _id: order._id,
      email,
    },
    {
      $set: {
        status: "Cancelled",
        shippingStatus:
          "Cancelled",
      },
    }
  );

  return {
    success: true,
    message:
      `Your order (ref: ${shortRef(
        order._id.toString()
      )}) has been cancelled successfully.`,
  };
}

/**
 * --------------------------------------------------------
 * ORDER SUMMARY
 * --------------------------------------------------------
 */

export async function getOrderSummary(
  email: string,
  orderIdQuery?: string
) {
  await connectDB();

  let order: any = null;

  if (orderIdQuery) {
    order =
      await getOrderByIdQuery(
        email,
        orderIdQuery
      );
  }

  if (!order) {
    order =
      await getCurrentOrder(email);
  }

  if (!order) {
    return {
      success: false,
      message:
        "I couldn't find an order on your account.",
    };
  }

  const ref = shortRef(
    order._id.toString()
  );

  return {
    success: true,

    message:
      `Order ${ref}: ${order.status || "Processing"}.`,

    order,
  };
}

/**
 * --------------------------------------------------------
 * EXPORT SHORT REFERENCE
 * --------------------------------------------------------
 */

export { shortRef };