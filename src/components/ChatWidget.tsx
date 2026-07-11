/**
 * src/components/ChatWidget.tsx
 *
 * Order-support chat as a slide-in sidebar (not a popup, not a new page).
 * Trigger icon sits bottom-right; clicking it slides a panel in from the
 * right edge of the viewport, over a soft backdrop, on the same page.
 *
 * Usage — add once in your root layout:
 *   import ChatWidget from "@/components/ChatWidget";
 *   ...
 *   <body>{children}<ChatWidget /></body>
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  contact?: { whatsapp: string; email: string };
}

const ACCENT = "#7A2E2E"; // deep brick/maroon — spice-brand accent
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  function toggleOpen() {
    setOpen((prev) => !prev);
    if (!greeted) {
      setMessages([
        {
          sender: "bot",
          text: "Hi, welcome to Achaaryaar Support! Ask me about your current order, previous orders, or paste your order reference.",
        },
      ]);
      setGreeted(true);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, pendingAction }),
      });
      const data = await res.json();
      setPendingAction(data.pendingAction || null);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "Sorry, something went wrong.", contact: data.contact },
      ]);
    } catch {
      setTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: "I'm having trouble connecting. Please try again shortly." }]);
    }
  }

  const quickReplies = ["Current order", "Previous orders", "Cancel order", "Talk to an agent"];

  return (
    <>
      {/* Trigger button — same spot/size as the old WhatsApp button (bottom-4 right-4, 64px) */}
      <button
        onClick={toggleOpen}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-4 right-4 z-[70] group"
      >
        <div className="relative">
          {!open && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping"
              style={{ background: ACCENT }}
            />
          )}
          <div
            className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 text-white"
            style={{ background: ACCENT }}
          >
            {open ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/30 z-[55] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar panel — slides in from the right, same page, no navigation */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[58] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Order support chat"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between text-white" style={{ background: ACCENT }}>
          <div>
            <p className="font-semibold text-[15px] leading-tight">Achaaryaar Support</p>
            <p className="text-xs text-white/75 mt-0.5">Usually replies in a few seconds</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="opacity-80 hover:opacity-100 p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-[#FAF7F2] flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-white border border-[#EEE6DA] text-[#2B2420] rounded-bl-sm"
                }`}
                style={m.sender === "user" ? { background: ACCENT } : undefined}
              >
                {m.text}
              </div>

              {m.contact && (
                <div className="flex gap-2 mt-2 max-w-[82%]">
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

        {/* Quick replies */}
        <div className="flex gap-2 px-4 pb-3 flex-wrap bg-[#FAF7F2]">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#DDD1BE] text-[#5A4E3E] hover:bg-[#F2E9DA] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-[#EEE6DA] p-3 bg-white">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type a message..."
            className="flex-1 border border-[#DDD1BE] rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-[#7A2E2E] transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            aria-label="Send message"
            className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-colors"
            style={{ background: ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}