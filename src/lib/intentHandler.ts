/**
 * src/lib/intentHandler.ts
 *
 * Intent detection for AchaarYaar Support Chatbot.
 *
 * Supports:
 * - Greeting
 * - Current order
 * - Previous orders
 * - Order status
 * - Tracking
 * - Delivery
 * - Payment
 * - Cancellation
 * - Returns / refunds
 * - Human support
 * - General order questions
 */

export type Intent =
  | "greeting"
  | "current_order"
  | "previous_orders"
  | "order_status_by_id"
  | "tracking"
  | "delivery"
  | "payment"
  | "cancel_order"
  | "return_order"
  | "human_handoff"
  | "fallback";

export interface IntentResult {
  intent: Intent;
  orderIdQuery?: string;
}

/**
 * --------------------------------------------------------
 * ORDER REFERENCE PATTERNS
 * --------------------------------------------------------
 */

const fullObjectIdPattern =
  /\b[a-f0-9]{24}\b/i;

const shortRefPattern =
  /\b[a-f0-9]{8}\b/i;

/**
 * --------------------------------------------------------
 * INTENT DETECTION
 * --------------------------------------------------------
 */

export function detectIntent(
  message: string
): IntentResult {
  const text =
    message
      .toLowerCase()
      .trim();

  /**
   * ------------------------------------------------------
   * ORDER ID / REFERENCE
   * ------------------------------------------------------
   */

  const fullIdMatch =
    message.match(
      fullObjectIdPattern
    );

  const shortRefMatch =
    !fullIdMatch
      ? message.match(
          shortRefPattern
        )
      : null;

  const orderIdQuery =
    fullIdMatch?.[0] ||
    shortRefMatch?.[0];

  /**
   * ------------------------------------------------------
   * GREETING
   * ------------------------------------------------------
   */

  if (
    /\b(hi|hello|hey|hii|helo|namaste|good morning|good afternoon|good evening)\b/.test(
      text
    )
  ) {
    return {
      intent: "greeting",
    };
  }

  /**
   * ------------------------------------------------------
   * CANCEL ORDER
   * ------------------------------------------------------
   */

  if (
    /(cancel|cancellation|stop|don't want|do not want)/.test(
      text
    ) &&
    /(order|purchase|item)/.test(
      text
    )
  ) {
    return {
      intent: "cancel_order",
      orderIdQuery,
    };
  }

  /**
   * ------------------------------------------------------
   * TRACKING
   * ------------------------------------------------------
   */

  if (
    /(track|tracking|awb|shipment|shipped|shipping|courier|where is my package|where is my parcel|location of my order)/.test(
      text
    )
  ) {
    return {
      intent: "tracking",
      orderIdQuery,
    };
  }

  /**
   * ------------------------------------------------------
   * DELIVERY
   * ------------------------------------------------------
   */

  if (
    /(delivery|deliver|arrive|arrival|when will.*come|when.*receive|how long.*take|eta|estimated delivery)/.test(
      text
    )
  ) {
    return {
      intent: "delivery",
      orderIdQuery,
    };
  }

  /**
   * ------------------------------------------------------
   * PAYMENT
   * ------------------------------------------------------
   */

  if (
    /(payment|paid|pay|razorpay|upi|transaction|transaction id|payment id|amount paid|money|price paid)/.test(
      text
    )
  ) {
    return {
      intent: "payment",
      orderIdQuery,
    };
  }

  /**
   * ------------------------------------------------------
   * PREVIOUS ORDERS
   * ------------------------------------------------------
   */

  if (
    /(previous|past|old|history|completed|delivered|cancelled).*order/.test(
      text
    ) ||
    /order.*(history|list|past)/.test(
      text
    )
  ) {
    return {
      intent: "previous_orders",
    };
  }

  /**
   * ------------------------------------------------------
   * CURRENT ORDER
   * ------------------------------------------------------
   */

  if (
    /(current|latest|active|recent).*order/.test(
      text
    ) ||
    /(my order|my latest order|my current order)/.test(
      text
    ) ||
    /(where.*order|order.*where)/.test(
      text
    )
  ) {
    return {
      intent: "current_order",
    };
  }

  /**
   * ------------------------------------------------------
   * RETURN / REFUND
   * ------------------------------------------------------
   */

  if (
    /(return|refund|replace|replacement|damaged|wrong item|wrong product)/.test(
      text
    )
  ) {
    return {
      intent: "return_order",
      orderIdQuery,
    };
  }

  /**
   * ------------------------------------------------------
   * HUMAN SUPPORT
   * ------------------------------------------------------
   */

  if (
    /(human|agent|representative|support person|customer care|customer service|talk to someone|speak to someone|contact support|contact team)/.test(
      text
    )
  ) {
    return {
      intent: "human_handoff",
    };
  }

  /**
   * ------------------------------------------------------
   * ORDER REFERENCE
   *
   * If user simply pastes an order reference,
   * show its status.
   * ------------------------------------------------------
   */

  if (orderIdQuery) {
    return {
      intent: "order_status_by_id",
      orderIdQuery:
        orderIdQuery.toLowerCase(),
    };
  }

  /**
   * ------------------------------------------------------
   * FALLBACK
   * ------------------------------------------------------
   */

  return {
    intent: "fallback",
  };
}