"use client";

import { useState } from "react";

export default function ContactPage() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const res = await fetch("/api/contact", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
      });

    } else {
      alert("Failed to send message");
    }
  };

 return (
  <section className="max-w-7xl mx-auto px-6 py-16">

    <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">
      Contact Us
    </h1>

    <div className="grid md:grid-cols-2 gap-12">

      {/* Contact Details */}
      <div className="bg-white p-8 rounded-3xl shadow-lg">

        <h2 className="text-3xl font-bold mb-8 text-orange-600">
          Get In Touch
        </h2>

        <div className="space-y-6 text-lg text-gray-700">

          <p>📞 <strong>Phone:</strong> +91 9525463643</p>

          <p>📧 <strong>Email:</strong> arjunpanditj474@gmail.com</p>

          <p>📍 <strong>Address:</strong> Siwan, Bihar, India</p>

          <p>
            🕒 <strong>Working Hours:</strong><br />
            Monday - Saturday: 9:00 AM - 8:00 PM
          </p>

          <p>💬 <strong>WhatsApp:</strong> +91 9525463643</p>

        </div>

      </div>

      {/* Contact Form */}
      <div className="bg-white p-8 rounded-3xl shadow-lg">

        <h2 className="text-3xl font-bold mb-8 text-orange-600">
          Send Us a Message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-500"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-500"
          />

          <textarea
            rows={5}
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) =>
              setFormData({
                ...formData,
                message: e.target.value,
              })
            }
            className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-500"
          />

          <button
            type="submit"
            className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700"
          >
            Send Message
          </button>

        </form>

      </div>

    </div>

  </section>
);

}