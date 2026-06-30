"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/lib/baseUrl";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function CheckoutPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        paymentMethod: "cod",
        email: "",
    });
    const items = useCartStore((state) => state.items);

    const subtotal = items.reduce((total, item) => {
        const price =
            typeof item.price === "number"
                ? item.price
                : parseInt(String(item.price).match(/\d+/)?.[0] || "0", 10);

        return total + price * item.quantity;
    }, 0);

    const shipping = items.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (!formData.fullName.trim()) {
            alert("Please enter your full name");
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            alert("Please enter a valid email address");
            return;
        }

        if (!formData.address.trim()) {
            alert("Please enter your address");
            return;
        }

        if (!formData.city.trim()) {
            alert("Please enter your city");
            return;
        }

        if (!/^[0-9]{6}$/.test(formData.pincode)) {
            alert("Please enter a valid 6-digit pincode");
            return;
        }
        if (items.length === 0) {
            alert("Your cart is empty");
            return;
        }
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    items,
                    subtotal,
                    shipping,
                    total,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push("/order-success");
            } else {
                alert("Order failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    const inputClasses =
        "w-full border border-[#E8DDD1] bg-white rounded-xl px-4 py-3 text-[#2D2A26] font-medium placeholder:text-[#9C9388] focus:outline-none focus:ring-2 focus:ring-[#C18A42] focus:border-[#C18A42] transition";

    const labelClasses = "block text-[#4F6B52] font-semibold mb-2 text-sm tracking-wide";

    return (
        <div className="min-h-screen bg-[#FBF7F1] py-12 px-6">
            <div className="max-w-6xl mx-auto">

                <h1
                    className="text-5xl font-extrabold text-[#2D2A26] mb-2"
                    style={{ fontFamily: FONT_DISPLAY }}
                >
                    Checkout
                </h1>
                <p className="text-[#7A6F65] mb-8">
                    Review your order and complete your purchase.
                </p>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Shipping Details */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-[#E8DDD1] p-8">

                        <h2
                            className="text-3xl font-bold text-[#2D2A26] mb-6"
                            style={{ fontFamily: FONT_DISPLAY }}
                        >
                            Shipping Details
                        </h2>

                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

                            <div>
                                <label className={labelClasses}>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fullName: e.target.value,
                                        })
                                    }
                                    className={inputClasses}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Address
                                </label>

                                <textarea
                                    rows={4}
                                    placeholder="House no, street, locality"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                    className={inputClasses}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <label className={labelClasses}>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter city"
                                        value={formData.city}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                city: e.target.value,
                                            })
                                        }
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="6-digit pincode"
                                        value={formData.pincode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pincode: e.target.value,
                                            })
                                        }
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3
                                    className="text-2xl font-bold text-[#2D2A26] mb-4"
                                    style={{ fontFamily: FONT_DISPLAY }}
                                >
                                    Payment Method
                                </h3>

                                <div className="space-y-3">

                                    <label
                                        className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${formData.paymentMethod === "cod"
                                            ? "border-[#C18A42] bg-[#FBF3E7]"
                                            : "border-[#E8DDD1] bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={formData.paymentMethod === "cod"}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    paymentMethod: e.target.value,
                                                })
                                            }
                                            className="accent-[#C18A42]"
                                        />
                                        <span className="font-medium text-[#2D2A26]">
                                            Cash on Delivery (COD)
                                        </span>
                                    </label>

                                    <label
                                        className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${formData.paymentMethod === "razorpay"
                                            ? "border-[#C18A42] bg-[#FBF3E7]"
                                            : "border-[#E8DDD1] bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="razorpay"
                                            checked={formData.paymentMethod === "razorpay"}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    paymentMethod: e.target.value,
                                                })
                                            }
                                            className="accent-[#C18A42]"
                                        />
                                        <span className="font-medium text-[#2D2A26]">
                                            Pay Online (UPI, Card, Net Banking)
                                        </span>
                                    </label>

                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-3xl shadow-xl border border-[#E8DDD1] p-8 h-fit sticky top-8">

                        <h2
                            className="text-2xl font-bold text-[#2D2A26] mb-6"
                            style={{ fontFamily: FONT_DISPLAY }}
                        >
                            Order Summary
                        </h2>

                        {items.length === 0 ? (
                            <p className="text-[#7A6F65] text-sm mb-4">
                                Your cart is empty.{" "}
                                <Link
                                    href="/shop"
                                    className="text-[#C18A42] font-semibold underline"
                                >
                                    Browse pickles →
                                </Link>
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                                    {items.map((item) => (
                                        <div
                                            key={`${item._id}-${item.selectedVariant}`}
                                            className="flex justify-between text-sm">
                                        
                                            <span className="text-[#2D2A26]">
                                                {item.name}
                                                <span className="text-[#9C9388]">
                                                    {" "}({item.selectedVariant}) × {item.quantity}
                                                </span>
                                            </span>

                                            <span className="font-medium text-[#2D2A26]">
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 border-t border-[#E8DDD1] pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-[#7A6F65]">Subtotal</span>
                                        <span className="font-semibold text-[#2D2A26]">
                                            ₹{subtotal}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-[#7A6F65]">Shipping</span>
                                        <span className="font-semibold text-[#2D2A26]">
                                            ₹{shipping}
                                        </span>
                                    </div>

                                    <hr className="border-[#E8DDD1]" />

                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-[#2D2A26]">Total</span>
                                        <span className="text-[#C18A42]">
                                            ₹{total}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={items.length === 0}
                                        className="w-full bg-[#C18A42] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#A8742F] transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Place Order
                                    </button>

                                    <p className="text-center text-xs text-[#9C9388] mt-2">
                                        🔒 Secure checkout · Handcrafted with care in Bihar
                                    </p>
                                </div>
                            </>
                        )}

                    </div>

                </div>

            </div>
        </div>
    );
}