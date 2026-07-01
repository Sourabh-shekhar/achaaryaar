"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const phone = "917561972501"; // Replace with your WhatsApp number
  const message = encodeURIComponent(
    "Hello Achaaryaar! I'm interested in your homemade pickles."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 group"
    >
      <div className="relative">
        {/* Ping animation */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40 animate-ping"></span>

        {/* Button */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] shadow-2xl hover:scale-110 transition-all duration-300">
          <FaWhatsapp className="text-white text-3xl" />
        </div>
      </div>
    </a>
  );
}