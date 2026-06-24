"use client";
import { FaWhatsapp } from "react-icons/fa";
export default function WhatsAppButton() {
  return (
 <a
  href="https://wa.me/919525463643"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition z-50">
  <FaWhatsapp size={40} />
</a>
  );
}