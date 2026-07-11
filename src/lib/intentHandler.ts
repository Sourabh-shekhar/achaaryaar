/**
 * src/lib/intentHandler.ts
 *
 * Keyword-based intent detection, adjusted for your actual Order schema:
 * there's no custom "ORD1234" code — orders are identified by Mongo's
 * _id. Customers can paste either:
 *   - the full 24-char Mongo ObjectId, or
 *   - the last 8 characters of it (a friendlier "reference code" you
 *     can also show them on the order-success / profile page)
 */

export type Intent =
  | "greeting"
  | "current_order"
  | "previous_orders"
  | "order_status_by_id"
  | "cancel_order"
  | "return_order"
  | "human_handoff"
  | "fallback";

export interface IntentResult {
  intent: Intent;
  orderIdQuery?: string; // full ObjectId OR 8-char suffix, as typed by the user
}

const fullObjectIdPattern = /\b[a-f0-9]{24}\b/i;
const shortRefPattern = /\b[a-f0-9]{8}\b/i;

export function detectIntent(message: string): IntentResult {
  const text = message.toLowerCase().trim();

  const fullIdMatch = message.match(fullObjectIdPattern);
  const shortRefMatch = !fullIdMatch ? message.match(shortRefPattern) : null;

  if (/\b(hi|hello|hey)\b/.test(text)) {
    return { intent: "greeting" };
  }

  if (fullIdMatch || shortRefMatch) {
    return {
      intent: "order_status_by_id",
      orderIdQuery: (fullIdMatch?.[0] || shortRefMatch?.[0])!.toLowerCase(),
    };
  }

  if (/(current|latest|active|track).*order/.test(text) || /where.*order/.test(text)) {
    return { intent: "current_order" };
  }

  if (/(previous|past|old|history).*order/.test(text) || /order.*(history|list)/.test(text)) {
    return { intent: "previous_orders" };
  }

  if (/cancel/.test(text) && /order/.test(text)) {
    return { intent: "cancel_order" };
  }

  if (/(return|refund)/.test(text)) {
    return { intent: "return_order" };
  }

  if (/(human|agent|representative|support person)/.test(text)) {
    return { intent: "human_handoff" };
  }

  return { intent: "fallback" };
}