"use client";
 
import { useState } from "react";
 
export default function ContactPage() {
  const [loading, setLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
 
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
 
    setLoading(true);
 
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
 
      const data = await res.json();
 
      if (data.success) {
        alert(
          "Thank you for contacting Achaaryaar. We'll get back to you soon."
        );
 
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        alert("Unable to send message. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    }
 
    setLoading(false);
  };
 
  return (
    <section className="bg-[#FFF8F1] py-20 px-6">
      <div className="max-w-7xl mx-auto">
 
        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2B1D14]">
            Contact Us
          </h1>
 
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            We'd love to hear from you. Whether you have questions about our
            handcrafted pickles, orders, or feedback, feel free to contact us.
          </p>
        </div>
 
        <div className="grid lg:grid-cols-2 gap-10">
 
          {/* Left Side */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-orange-100">
 
            <h2 className="text-3xl font-bold text-[#C05621] mb-8">
              Get In Touch
            </h2>
 
            <div className="space-y-8 text-gray-700">
 
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  📞 Phone
                </h3>
                <p>+91 7561972501</p>
              </div>
 
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  📧 Email
                </h3>
                <p>arjunpanditj474@gmail.com</p>
              </div>
 
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  📍 Address
                </h3>
                <p>Siwan, Bihar, India</p>
              </div>
 
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  🕒 Working Hours
                </h3>
                <p>Monday – Saturday</p>
                <p>9:00 AM – 8:00 PM</p>
              </div>
 
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  💬 WhatsApp
                </h3>
 
                <a
                  href="https://wa.me/917561972501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
 
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-orange-100">
 
            <h2 className="text-3xl font-bold text-[#C05621] mb-8">
              Send Us a Message
            </h2>
 
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
 
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
 
              <input
                type="email"
                required
                placeholder="Your Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
 
              <textarea
                rows={6}
                required
                placeholder="Write your message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
 
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C05621] hover:bg-[#9C4221] text-white py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-50"
              >
                {loading
                  ? "Sending Message..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}