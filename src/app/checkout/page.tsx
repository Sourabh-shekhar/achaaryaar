"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        paymentMethod: "cod",
    });
    const items = useCartStore((state) => state.items);

    const subtotal = items.reduce((total, item) => {
        const price = parseInt(
            item.price.match(/\d+/)?.[0] || "0"
        );

        return total + price * item.quantity;
    }, 0);

    const shipping = items.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        console.log("Button clicked");

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

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-6">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-5xl font-extrabold text-gray-900 mb-8">
                    Checkout
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Shipping Details */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Shipping Details
                        </h2>

                        <form className="space-y-5">

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
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
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Address
                                </label>

                                <textarea
                                    rows={4}
                                    placeholder="Enter your address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block text-gray-700 font-semibold mb-2">
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
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter pincode"
                                        value={formData.pincode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pincode: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Payment Method
                                </h3>

                                <div className="space-y-3">

                                    <label className="flex items-center gap-3 border border-gray-300 rounded-xl p-4 cursor-pointer">
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
                                        />
                                        <span className="font-medium text-gray-900">
                                            Cash on Delivery (COD)
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 border border-gray-300 rounded-xl p-4 cursor-pointer">
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
                                        />
                                        <span className="font-medium text-gray-900">
                                            Pay Online (UPI, Card, Net Banking)
                                        </span>
                                    </label>

                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 h-fit">

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-4">

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Subtotal
                                </span>

                                <span className="font-semibold">
                                    ₹{subtotal}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Shipping
                                </span>

                                <span className="font-semibold">
                                    ₹{shipping}
                                </span>
                            </div>

                            <hr />

                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-orange-600">
                                    ₹{total}
                                </span>
                            </div>

                            <button
                            type="button"

                                onClick={handlePlaceOrder}
                                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition mt-4"
                            >
                                Place Order
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}