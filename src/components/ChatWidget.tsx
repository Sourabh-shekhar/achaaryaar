"use client";

import { useEffect, useRef, useState } from "react";

interface OrderItem {
  name: string;
  quantity: number;
  image?: string;
  price?: number | null;
}

interface ChatOrder {
  id: string;
  reference: string;
  status: string;
  shippingStatus?: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt?: string | null;
  total?: number | null;
  items: OrderItem[];
}

interface OrderActions {
  canTrack?: boolean;
  canCancel?: boolean;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  contact?: {
    whatsapp: string;
    email: string;
  };
  orders?: ChatOrder[];
  orderActions?: OrderActions;
}

const ACCENT = "#7A2E2E";
const ACCENT_DARK = "#5E2222";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [greeted, setGreeted] = useState(false);
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function toggleOpen() {
    setOpen((prev) => !prev);

    if (!greeted) {
      setMessages([
        {
          sender: "bot",
          text:
            "Hi! 👋 Welcome to AchaarYaar Support. I can automatically access orders linked to your account.",
        },
      ]);

      setGreeted(true);
    }
  }

  async function sendRequest(body: Record<string, unknown>) {
    setTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setPendingAction(data.pendingAction || null);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            data.reply ||
            "Sorry, something went wrong.",
          contact: data.contact,
          orders: data.orders || (data.order ? [data.order] : undefined),
          orderActions: data.orderActions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "I'm having trouble connecting. Please try again shortly.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setInput("");

    await sendRequest({
      message: text,
      pendingAction,
    });
  }

  async function handleOrderAction(
    order: ChatOrder,
    action: "view_order" | "track_order" | "cancel_order"
  ) {
    if (typing) return;

    const actionText =
      action === "view_order"
        ? `View order ${order.reference}`
        : action === "track_order"
        ? `Track order ${order.reference}`
        : `Cancel order ${order.reference}`;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: actionText,
      },
    ]);

    await sendRequest({
      selectedOrderId: order.id,
      selectedAction: action,
    });
  }

  const quickReplies = [
    "Current order",
    "Previous orders",
    "Cancel order",
    "Talk to an agent",
  ];

  return (
    <>
      <button
        onClick={toggleOpen}
        aria-label={
          open
            ? "Close support chat"
            : "Open support chat"
        }
        className="fixed bottom-18 right-3 z-[70] group"
      >
        <div className="relative">
          {!open && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping"
              style={{
                background: ACCENT,
              }}
            />
          )}

          <div
            className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 text-white"
            style={{
              background: ACCENT,
            }}
          >
            {open ? (
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/30 z-[55] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[58] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Order support chat"
      >
        <div
          className="px-5 py-4 flex items-center justify-between text-white"
          style={{
            background: ACCENT,
          }}
        >
          <div>
            <p className="font-semibold text-[15px] leading-tight">
              AchaarYaar Support
            </p>

            <p className="text-xs text-white/75 mt-0.5">
              Your personal order assistant
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="opacity-80 hover:opacity-100 p-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 bg-[#FAF7F2] flex flex-col gap-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                m.sender === "user"
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-white border border-[#EEE6DA] text-[#2B2420] rounded-bl-sm"
                }`}
                style={
                  m.sender === "user"
                    ? {
                        background: ACCENT,
                      }
                    : undefined
                }
              >
                {m.text}
              </div>

              {m.orders?.map((order) => (
                <div
                  key={order.id}
                  className="w-full max-w-[95%] mt-2 bg-white border border-[#E7DDCF] rounded-2xl p-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#2B2420] text-sm">
                        Order #{order.reference}
                      </p>

                      <p className="text-xs text-[#756B60] mt-1">
                        {order.status}
                      </p>
                    </div>

                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F5EDE3] text-[#7A2E2E]"
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.items?.length > 0 && (
                    <div className="mt-3 border-t border-[#F0E8DE] pt-3">
                      {order.items.slice(0, 2).map(
                        (item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="text-xs text-[#5A4E3E] mb-1"
                          >
                            {item.quantity} × {item.name}
                          </div>
                        )
                      )}

                      {order.items.length > 2 && (
                        <div className="text-xs text-[#8A7B6B]">
                          +{order.items.length - 2} more item(s)
                        </div>
                      )}
                    </div>
                  )}

                  {order.estimatedDelivery && (
                    <div className="mt-3 text-xs text-[#5A4E3E]">
                      Expected: {order.estimatedDelivery}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleOrderAction(
                          order,
                          "view_order"
                        )
                      }
                      disabled={typing}
                      className="text-xs px-3 py-2 rounded-full border border-[#D8C7B2] text-[#5A4E3E] hover:bg-[#F7F0E7] disabled:opacity-50"
                    >
                      View details
                    </button>

                    <button
                      onClick={() =>
                        handleOrderAction(
                          order,
                          "track_order"
                        )
                      }
                      disabled={typing}
                      className="text-xs px-3 py-2 rounded-full border border-[#D8C7B2] text-[#5A4E3E] hover:bg-[#F7F0E7] disabled:opacity-50"
                    >
                      Track
                    </button>

                    {m.orderActions?.canCancel && (
                      <button
                        onClick={() =>
                          handleOrderAction(
                            order,
                            "cancel_order"
                          )
                        }
                        disabled={typing}
                        className="text-xs px-3 py-2 rounded-full text-white disabled:opacity-50"
                        style={{
                          background: ACCENT,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {m.contact && (
                <div className="flex gap-2 mt-2 max-w-[95%]">
                  <a
                    href={m.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-full border border-[#DDD1BE] text-[#5A4E3E] bg-white hover:bg-[#F2E9DA] transition-colors"
                  >
                    WhatsApp us
                  </a>

                  <a
                    href={`mailto:${m.contact.email}`}
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-full border border-[#DDD1BE] text-[#5A4E3E] bg-white hover:bg-[#F2E9DA] transition-colors"
                  >
                    Email us
                  </a>
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="self-start bg-white border border-[#EEE6DA] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8A98F] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8A98F] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8A98F] animate-bounce" />
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 pb-3 flex-wrap bg-[#FAF7F2]">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={typing}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#DDD1BE] text-[#5A4E3E] hover:bg-[#F2E9DA] disabled:opacity-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-[#EEE6DA] p-3 bg-white">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(input);
              }
            }}
            placeholder="Ask about your order..."
            className="flex-1 border border-[#DDD1BE] rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-[#7A2E2E] transition-colors"
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={typing || !input.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
            style={{
              background: ACCENT,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                ACCENT_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                ACCENT;
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
