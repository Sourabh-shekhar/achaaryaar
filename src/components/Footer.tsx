import Link from "next/link";
import {
    FaInstagram,
    FaFacebook,
    FaWhatsapp,
    FaYoutube,
    FaCcVisa,
    FaCcMastercard,
} from "react-icons/fa";

import { SiGooglepay, SiPaytm } from "react-icons/si";

export default function Footer() {
    return (
        <footer className="bg-amber-50 text-gray-900 mt-20 border-t border-orange-200">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-3xl font-extrabold text-orange-500 mb-4">
                        ACHAAR 🏺 YAAR
                    </h2>

                    <p className="text-gray-600 leading-7 mb-6">
                        Bringing authentic homemade Bihar pickles to every home with
                        traditional recipes and premium ingredients.
                    </p>

                    {/* Social Media */}
                    <div className="flex gap-5 text-3xl">
                        <a
                            href="https://www.instagram.com/achaaryaar?igsh=MXIyandtYjM1M3RpZQ=="
                            target="_blank"
                            className="text-pink-600 hover:scale-110 transition"
                        >
                            <FaInstagram />
                        </a>

                        <a
                            href="https://www.facebook.com/share/1JYUx8xQc4/"
                            target="_blank"
                            className="text-blue-600 hover:scale-110 transition"
                        >
                            <FaFacebook />
                        </a>

                        <a
                            href="https://wa.me/917561972501"
                            target="_blank"
                            className="text-green-600 hover:scale-110 transition"
                        >
                            <FaWhatsapp />
                        </a>

                        <a
                            href="https://youtube.com"
                            target="_blank"
                            className="text-red-600 hover:scale-110 transition"
                        >
                            <FaYoutube />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-xl font-bold mb-5">
                        Quick Links
                    </h3>

                    <div className="flex flex-col gap-3 text-gray-600">
                        <Link href="/" className="hover:text-orange-500">
                            Home
                        </Link>

                        <Link href="/products" className="hover:text-orange-500">
                            Shop
                        </Link>

                        <Link href="/about" className="hover:text-orange-500">
                            About Us
                        </Link>

                        <Link href="/contact" className="hover:text-orange-500">
                            Contact
                        </Link>
                    </div>
                </div>

                {/* Customer Support */}
                <div>
                    <h3 className="text-xl font-bold mb-5">
                        Customer Support
                    </h3>

                    <div className="space-y-3 text-gray-600">
                        <p>📞 +91 7561972501</p>
                        <p>✉ support@achaaryaar.com</p>
                        <p>📍 Bihar, India</p>
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-xl font-bold mb-5">
                        Stay Updated
                    </h3>

                    <p className="text-gray-600 mb-4">
                        Get offers and new product updates.
                    </p>

                    <div className="flex mb-6">
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full p-3 rounded-l-xl border border-gray-300"
                        />

                        <button className="bg-orange-600 text-white px-5 rounded-r-xl hover:bg-orange-700">
                            Subscribe
                        </button>
                    </div>
                    <div className="mt-8 space-y-2 text-gray-600">
                        <p>✅ 100% Homemade</p>
                        <p>✅ FSSAI Certified</p>
                        <p>🚚 Pan India Delivery</p>
                        <p>🔒 Secure Payments</p>
                    </div>

                    {/* Secure Payments */}
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-700">
                            Secure Payments
                        </h4>

                        <div className="flex gap-4 text-4xl">
                            <FaCcVisa className="text-blue-700" />

                            <FaCcMastercard className="text-red-500" />

                            <SiGooglepay className="text-gray-700" />

                            <SiPaytm className="text-sky-600" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-300 py-6 text-center text-gray-600">
                © {new Date().getFullYear()} Achaaryaar. All Rights Reserved.

                <p className="mt-2">
                    Made with ❤️ in Bihar
                </p>
            </div>

        </footer>
    );
}